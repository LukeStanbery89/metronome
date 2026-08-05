import { Accent } from '../src/types';

// Deterministic stand-in for an AudioBackend used by hook/scheduler tests.
// Its clock follows Date.now(), which fake timers drive forward, so
// scheduling behaviour is fully reproducible without any real audio APIs.
export class FakeBackend {
  clicks: { time: number; accent: Accent }[] = [];
  initCalls = 0;
  closed = false;

  now(): number {
    return Date.now() / 1000;
  }

  async init(): Promise<void> {
    this.initCalls++;
  }

  scheduleClick(time: number, accent: Accent): void {
    this.clicks.push({ time, accent });
  }

  close(): void {
    this.closed = true;
  }
}
