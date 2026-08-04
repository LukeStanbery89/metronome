import { AudioBackend } from '../audio/types';
import { BeatStep } from '../types';
import { PlaybackPlan } from './sequence';

const LOOKAHEAD = 0.12;
const TICK_MS = 25;

export class Scheduler {
  private backend: AudioBackend;
  private timer: ReturnType<typeof setInterval> | null = null;
  private uiTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private plan: PlaybackPlan | null = null;
  private bpm = 120;
  private startTime = 0;
  private cursorTime = 0;
  private nextIndex = 0;
  private onBeat: ((step: BeatStep, beatIndex: number) => void) | null = null;

  constructor(backend: AudioBackend) {
    this.backend = backend;
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  start(
    plan: PlaybackPlan,
    bpm: number,
    onBeat: (step: BeatStep, beatIndex: number) => void
  ): void {
    this.stop();
    this.backend.init();
    this.plan = plan;
    this.bpm = bpm;
    this.startTime = this.backend.now() + 0.05;
    this.cursorTime = this.startTime;
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
    let guard = 0;
    while (guard++ < 4096 && this.cursorTime <= until) {
      const step = this.stepAt(this.nextIndex);
      this.backend.scheduleClick(this.cursorTime, step.accent);

      const time = this.cursorTime;
      const index = this.nextIndex;
      const handle = setTimeout(() => {
        this.uiTimeouts.delete(handle);
        this.onBeat?.(step, index);
      }, Math.max(0, (time - this.backend.now()) * 1000));
      this.uiTimeouts.add(handle);

      this.cursorTime += 60 / this.bpm / step.subdivisions;
      this.nextIndex++;
    }
  }
}
