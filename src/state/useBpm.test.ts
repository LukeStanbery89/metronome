import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBpm } from './useBpm';

describe('useBpm', () => {
  it('starts with the initial values', () => {
    const { result } = renderHook(() => useBpm(120, vi.fn()));
    expect(result.current.bpm).toBe(120);
    expect(result.current.displayBpm).toBe(120);
  });

  it('previews without committing', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useBpm(120, onCommit));

    act(() => result.current.previewBpm(180));

    expect(result.current.displayBpm).toBe(180);
    expect(result.current.bpm).toBe(120);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits the value and notifies the caller', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useBpm(120, onCommit));

    act(() => result.current.commitBpm(180));

    expect(result.current.bpm).toBe(180);
    expect(result.current.displayBpm).toBe(180);
    expect(onCommit).toHaveBeenCalledWith(180);
  });
});
