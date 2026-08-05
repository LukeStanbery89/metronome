import { Accent } from '../types';
import { AudioBackend } from './types';

const CLICK_SPECS: Record<Accent, { freq: number; vol: number }> = {
  measure: { freq: 1568, vol: 0.9 },
  beat: { freq: 1046, vol: 0.6 },
  subdivision: { freq: 784, vol: 0.42 },
  countin: { freq: 720, vol: 0.38 },
};

// Length of each synthesized click (seconds). Kept short so rapid
// subdivisions stay distinct rather than blurring together.
const DURATION = 0.05;

// A tiny (8-sample, 8-bit, 8 kHz) silent WAV used by the HTML5 <audio>
// unlock fallback below. It never produces audible output; it only exists
// to put iOS's audio session into a "playing" state.
const SILENT_AUDIO_SRC =
  'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAAAAAAAAAAAAAA==';

// A single AudioContext shared for the lifetime of the page. Mobile
// browsers (especially iOS) only "unlock" Web Audio once, after the first
// successful gesture resume, so reusing one context is far more reliable
// than creating/tearing down contexts on every start/stop. iOS also caps
// the number of contexts a page may create (4 in older WebKit), so reuse
// is important. The scheduler calls close() on stop, but we intentionally
// keep this context alive (see close() below).
let sharedCtx: AudioContext | null = null;

// Ensures the HTML5 <audio> unlock is only attempted once per page load.
let htmlUnlockTried = false;

// Returns the browser's AudioContext constructor, preferring the standard
// name and falling back to the prefixed one used by older WebKit.
function getCtor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

// Lazily creates the shared AudioContext, re-creating it if a stale one
// ever ends up closed. A closed context keeps its currentTime frozen and
// silently drops all scheduled nodes, so operating on one would freeze the
// metronome's beat display and kill all sound.
function ensureSharedContext(): AudioContext | null {
  if (sharedCtx && sharedCtx.state === 'closed') {
    sharedCtx = null;
  }
  if (!sharedCtx) {
    const Ctor = getCtor();
    if (!Ctor) return null;
    sharedCtx = new Ctor();
  }
  return sharedCtx;
}

// iOS 17+ lets a page opt Web Audio out of the device's mute/ringer switch
// by declaring a "playback" audio session. The default session type is
// "ambient", which WebKit mutes whenever the hardware ringer is off — the
// classic "works on desktop, silent on iPhone" failure. Setting this once
// at load time makes clicks audible even with the mute switch on.
function setPlaybackSession(): void {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      nav.audioSession.type = 'playback';
    }
  } catch {
    // The property can be absent/read-only on non-WebKit browsers; ignore.
  }
}

// Plays an inaudible buffer through the Web Audio graph. Older iOS requires
// at least one actual sound to be started synchronously inside a user
// gesture before the context is considered unlocked; the 1-sample silent
// buffer satisfies that requirement without making noise.
function pokeSilent(ctx: AudioContext): void {
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

// Pre-iOS-17 fallback for the mute-switch problem (see setPlaybackSession).
// HTML5 <audio> playback is NOT muted by the ringer switch, and starting a
// looping silent element during a user gesture pushes the audio session into
// a playing state, after which Web Audio nodes are allowed to sound too.
function pokeSilentHtmlAudio(): void {
  if (htmlUnlockTried || typeof document === 'undefined') return;
  htmlUnlockTried = true;
  const audio = document.createElement('audio');
  audio.src = SILENT_AUDIO_SRC;
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0;
  void audio.play().catch(() => {});
}

// Runs the full unlock sequence for a user gesture. The shared context is
// created here (inside the gesture) so that on iOS it is born in the
// "running" state rather than suspended-and-stuck.
function unlockAudio(): void {
  const ctx = ensureSharedContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  pokeSilent(ctx);
  pokeSilentHtmlAudio();
}

// Browsers require a user gesture to resume a suspended AudioContext.
// React Native Web's Pressable onPress is a synthetic event whose user
// activation can be consumed by the time it runs, so we instead listen for
// the raw native events (pointer/touch/click) and unlock synchronously
// inside the real gesture. Each event type gets its own { once: true }
// listener so the first gesture of that type to fire performs the unlock;
// re-armed every time a new backend context is attached in init().
function armUnlock(): void {
  if (typeof window === 'undefined') return;
  const handler = () => unlockAudio();
  window.addEventListener('pointerdown', handler, { once: true });
  window.addEventListener('touchstart', handler, { once: true });
  window.addEventListener('click', handler, { once: true });
}

// WebKit (iOS Safari and WKWebView apps like Chrome) suspends the
// AudioContext when the page is backgrounded or the screen locks, and can
// leave it suspended on return. Resuming on visibility change keeps the
// metronome clicking after the user returns to the tab.
function armVisibilityResume(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const ctx = ensureSharedContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
  });
}

setPlaybackSession();
armUnlock();
armVisibilityResume();

export class WebAudioBackend implements AudioBackend {
  // Backend's handle on the shared context plus a dedicated master gain so
  // every scheduled click routes through one controllable volume node.
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  now(): number {
    // While suspended, currentTime stays frozen; that is exactly why the
    // scheduler awaits init() before scheduling (see scheduler.ts).
    return this.ctx ? this.ctx.currentTime : 0;
  }

  async init(): Promise<void> {
    if (!this.ctx) {
      const ctx = ensureSharedContext();
      if (!ctx) return;
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(ctx.destination);
      armUnlock();
    }
    if (this.ctx.state === 'suspended') {
      // Awaited by the scheduler before the first clicks are scheduled so
      // nothing is lost to the pre-resume frozen clock.
      await this.ctx.resume();
    }
  }

  scheduleClick(time: number, accent: Accent): void {
    if (!this.ctx || !this.master) return;
    const spec = CLICK_SPECS[accent];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    // Never schedule in the past; clamps to "now" if a click ever arrives
    // behind the context clock (e.g. after a suspension).
    const t = Math.max(time, this.ctx.currentTime);

    osc.type = 'square';
    osc.frequency.value = spec.freq;

    // Fast attack then decay to keep the click punchy and short.
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(spec.vol, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + DURATION);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + DURATION + 0.02);
  }

  close(): void {
    // Deliberately does NOT close the shared AudioContext: the unlocked
    // context is reused across start/stop cycles (see sharedCtx above).
    // We only detach this backend's master gain and drop our refs.
    if (this.master) {
      try {
        this.master.disconnect();
      } catch {
        // ignore
      }
    }
    this.ctx = null;
    this.master = null;
  }
}
