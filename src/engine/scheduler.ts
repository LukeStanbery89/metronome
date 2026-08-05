import { AudioBackend } from '../audio/types';
import { BeatStep } from '../types';
import { PlaybackPlan } from './sequence';

// Schedule audio events this far into the future (seconds). Long enough to
// absorb UI jank, short enough that BPM/tempo changes feel immediate.
const LOOKAHEAD = 0.12;
// Tick cadence for the lookahead loop (ms).
const TICK_MS = 25;

export class Scheduler {
  private backend: AudioBackend;
  private timer: ReturnType<typeof setInterval> | null = null;
  private uiTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private plan: PlaybackPlan | null = null;
  private bpm = 120;
  private cursorTime = 0;
  private nextIndex = 0;
  private onBeat: ((step: BeatStep, beatIndex: number) => void) | null = null;

  constructor(backend: AudioBackend) {
    this.backend = backend;
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  async start(
    plan: PlaybackPlan,
    bpm: number,
    onBeat: (step: BeatStep, beatIndex: number) => void
  ): Promise<void> {
    this.stop();
    // Awaiting init() before anchoring the schedule guarantees the driver's
    // clock is live. If the AudioContext is still suspended, its currentTime
    // is frozen; scheduling against it would let all clicks pile up at the
    // same instant once it finally resumes. On iOS a resume triggered by a
    // user gesture (play tap) is required and resolves synchronously.
    await this.backend.init();
    this.plan = plan;
    this.bpm = bpm;
    // Anchor the schedule slightly in the future so the first click isn't
    // scheduled at (or behind) the current instant.
    this.cursorTime = this.backend.now() + 0.05;
    this.nextIndex = 0;
    this.onBeat = onBeat;
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.uiTimeouts.forEach((t) => clearTimeout(t));
    this.uiTimeouts.clear();
    this.backend.close();
    this.plan = null;
    this.onBeat = null;
  }

  // Resolves the step at a 0-based index: intro (count-in) first, then the
  // main loop, wrapping around its length forever.
  private stepAt(index: number): BeatStep {
    const plan = this.plan as PlaybackPlan;
    if (index < plan.intro.length) {
      return plan.intro[index];
    }
    return plan.loop[(index - plan.intro.length) % plan.loop.length];
  }

  private tick(): void {
    if (!this.plan) return;
    const until = this.backend.now() + LOOKAHEAD;
    // Schedule every click that falls inside the lookahead window. The
    // guard is a hard cap so a pathological plan can never spin forever in
    // a single tick.
    let guard = 0;
    while (guard++ < 4096 && this.cursorTime <= until) {
      const step = this.stepAt(this.nextIndex);
      this.backend.scheduleClick(this.cursorTime, step.accent);

      // The UI beat (progress dot) is driven by a setTimeout rather than the
      // audio callbacks because audio playback timing is unreliable on
      // mobile. The timeout targets the same absolute beat time.
      const time = this.cursorTime;
      const index = this.nextIndex;
      const handle = setTimeout(() => {
        this.uiTimeouts.delete(handle);
        this.onBeat?.(step, index);
      }, Math.max(0, (time - this.backend.now()) * 1000));
      this.uiTimeouts.add(handle);

      // Advance the cursor by this step's duration in seconds.
      this.cursorTime += 60 / this.bpm / step.subdivisions;
      this.nextIndex++;
    }
  }
}
