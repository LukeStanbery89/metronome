import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Accent } from '../types';
import { buildMetronomePlan, buildRatioPlan } from './sequence';
import { Scheduler } from './scheduler';

// Deterministic stand-in for an AudioBackend. Its clock follows Date.now(),
// which fake timers drive forward, so scheduling behaviour is fully
// reproducible without touching any real audio APIs.
class FakeBackend {
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

const sig4 = { beats: 4, noteValue: 4, subdivision: 1 };

describe('Scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes the backend on start', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    await sched.start(buildMetronomePlan(sig4), 120, () => {});
    expect(backend.initCalls).toBe(1);
    expect(sched.isRunning).toBe(true);
    sched.stop();
  });

  it('schedules clicks at the correct BPM spacing', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    await sched.start(buildMetronomePlan(sig4), 120, () => {});
    vi.advanceTimersByTime(6000);
    sched.stop();

    // 120 BPM quarter notes = one click every 0.5s.
    const times = backend.clicks.map((c) => c.time);
    expect(times.length).toBeGreaterThan(10);
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBeCloseTo(0.5, 5);
    }
  });

  it('schedules clicks into the future, never in the past', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    const now = () => Date.now() / 1000;
    const before = now();
    await sched.start(buildMetronomePlan(sig4), 120, () => {});
    const after = now();
    sched.stop();

    expect(backend.clicks.length).toBeGreaterThan(0);
    for (const click of backend.clicks) {
      expect(click.time).toBeGreaterThanOrEqual(before);
      expect(click.time).toBeLessThanOrEqual(after + 0.5);
    }
  });

  it('fires beat callbacks in order with the right step', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    const beats: number[] = [];
    await sched.start(buildMetronomePlan(sig4), 120, (step) =>
      beats.push(step.beatInMeasure)
    );

    // 2s of playback = 4 beats at 120 BPM.
    vi.advanceTimersByTime(2000);
    sched.stop();

    expect(beats.length).toBeGreaterThanOrEqual(4);
    expect(beats.slice(0, 4)).toEqual([1, 2, 3, 4]);
  });

  it('stops scheduling and closes the backend on stop', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    let calls = 0;
    await sched.start(buildMetronomePlan(sig4), 120, () => calls++);
    sched.stop();

    expect(backend.closed).toBe(true);
    expect(sched.isRunning).toBe(false);

    const clicksBefore = backend.clicks.length;
    vi.advanceTimersByTime(1000);
    expect(backend.clicks.length).toBe(clicksBefore);
    expect(calls).toBe(0);
  });

  it('can be restarted cleanly after a stop', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);

    await sched.start(buildMetronomePlan(sig4), 120, () => {});
    vi.advanceTimersByTime(1000);
    sched.stop();

    backend.clicks = [];
    await sched.start(buildMetronomePlan(sig4), 120, () => {});
    vi.advanceTimersByTime(1000);
    sched.stop();

    expect(backend.clicks.length).toBeGreaterThan(0);
    const times = backend.clicks.map((c) => c.time);
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBeCloseTo(0.5, 5);
    }
  });

  it('plays a full ratio cycle: count-in, group 1, count-in, group 2', async () => {
    const backend = new FakeBackend();
    const sched = new Scheduler(backend);
    const plan = buildRatioPlan(
      { beats: 2, noteValue: 4, subdivision: 1 }, // group 1: 2 beats
      2,
      1,
      { beats: 3, noteValue: 4, subdivision: 2 }, // group 2: 6 steps
      1,
      1
    );
    const segments: string[] = [];
    await sched.start(plan, 60, (step) => segments.push(step.segment));

    // One full cycle is 2 + 2 + 1 + 6 steps = 11 steps. At 60 BPM quarter
    // notes the group-2 subdivisions are 0.5s each, so a cycle is 8s.
    vi.advanceTimersByTime(12000);
    sched.stop();

    expect(segments.slice(0, 11)).toEqual([
      'count-in-1',
      'count-in-1',
      'group-1',
      'group-1',
      'count-in-2',
      'group-2',
      'group-2',
      'group-2',
      'group-2',
      'group-2',
      'group-2',
    ]);
    // And the cycle repeats.
    expect(segments[11]).toBe('count-in-1');
  });
});
