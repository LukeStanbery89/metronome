import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildMetronomePlan } from '../engine/sequence';
import { FakeBackend } from '../../test/fakes';
import { useTransport } from './useTransport';

const sig4 = { beats: 4, noteValue: 4, subdivision: 1 };
const plan = buildMetronomePlan(sig4);

describe('useTransport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // scheduler.start is async (it awaits backend.init); flush the pending
  // microtask so the interval is actually armed before we advance time.
  async function flush(): Promise<void> {
    await act(async () => {});
  }

  it('starts playback, reports beats, and stops', async () => {
    const backend = new FakeBackend();
    const makeBackend = () => backend;
    const { result } = renderHook(() => useTransport(makeBackend));

    act(() => result.current.start(plan, 120));
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.beat).toBeNull();
    await flush();

    // At 120 BPM the first two beats fire at 0.05s and 0.55s.
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.beat?.step.beatInMeasure).toBe(2);

    act(() => result.current.stop());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.beat).toBeNull();
    expect(backend.closed).toBe(true);
  });

  it('ignores restart while stopped', () => {
    const backend = new FakeBackend();
    const makeBackend = () => backend;
    const { result } = renderHook(() => useTransport(makeBackend));

    act(() => result.current.restart(plan, 140));

    expect(result.current.isPlaying).toBe(false);
    expect(backend.initCalls).toBe(0);
  });

  it('restarts the plan while playing', async () => {
    const backend = new FakeBackend();
    const makeBackend = () => backend;
    const { result } = renderHook(() => useTransport(makeBackend));

    act(() => result.current.start(plan, 120));
    await flush();

    act(() => result.current.restart(plan, 120));
    await flush();

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.beat).toBeNull();
    // One init for start, one for the restart.
    expect(backend.initCalls).toBe(2);
  });

  it('stops playback on unmount', async () => {
    const backend = new FakeBackend();
    const makeBackend = () => backend;
    const { result, unmount } = renderHook(() => useTransport(makeBackend));

    act(() => result.current.start(plan, 120));
    await flush();
    unmount();

    expect(backend.closed).toBe(true);
  });
});
