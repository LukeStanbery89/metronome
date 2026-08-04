import { Accent } from '../types';
import { AudioBackend } from './types';

const CLICK_SPECS: Record<Accent, { freq: number; vol: number }> = {
  measure: { freq: 1568, vol: 0.9 },
  beat: { freq: 1046, vol: 0.6 },
  subdivision: { freq: 784, vol: 0.42 },
  countin: { freq: 720, vol: 0.38 },
};

const DURATION = 0.05;

export class WebAudioBackend implements AudioBackend {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  init(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  scheduleClick(time: number, accent: Accent): void {
    if (!this.ctx || !this.master) return;
    const spec = CLICK_SPECS[accent];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = Math.max(time, this.ctx.currentTime);

    osc.type = 'square';
    osc.frequency.value = spec.freq;

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(spec.vol, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + DURATION);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + DURATION + 0.02);
  }

  close(): void {
    if (this.ctx) {
      void this.ctx.close();
    }
    this.ctx = null;
    this.master = null;
  }
}
