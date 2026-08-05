import { describe, expect, it } from 'vitest';
import {
  BPM_MAX,
  BPM_MIN,
  clamp,
  clampBpm,
  clampCountIn,
  clampMeasures,
} from './clamp';

describe('clamp', () => {
  it('keeps values within bounds', () => {
    expect(clamp(0, 10, 5)).toBe(5);
    expect(clamp(0, 10, -1)).toBe(0);
    expect(clamp(0, 10, 11)).toBe(10);
  });
});

describe('clampBpm', () => {
  it('keeps values inside the BPM range', () => {
    expect(clampBpm(BPM_MIN)).toBe(BPM_MIN);
    expect(clampBpm(BPM_MAX)).toBe(BPM_MAX);
    expect(clampBpm(BPM_MIN - 1)).toBe(BPM_MIN);
    expect(clampBpm(BPM_MAX + 1)).toBe(BPM_MAX);
    expect(clampBpm(120)).toBe(120);
  });

  it('rounds to a whole number', () => {
    expect(clampBpm(120.4)).toBe(120);
    expect(clampBpm(120.5)).toBe(121);
    expect(clampBpm(179.6)).toBe(180);
  });
});

describe('clampMeasures', () => {
  it('keeps values between 1 and 8 measures', () => {
    expect(clampMeasures(1)).toBe(1);
    expect(clampMeasures(8)).toBe(8);
    expect(clampMeasures(0)).toBe(1);
    expect(clampMeasures(9)).toBe(8);
    expect(clampMeasures(4)).toBe(4);
  });
});

describe('clampCountIn', () => {
  it('keeps count-in within the signature max', () => {
    expect(clampCountIn(4, 4)).toBe(4);
    expect(clampCountIn(5, 4)).toBe(4);
    expect(clampCountIn(0, 4)).toBe(0);
    expect(clampCountIn(6, 6)).toBe(6);
    expect(clampCountIn(8, 6)).toBe(6);
  });

  it('floors the max at 4 beats for short signatures', () => {
    expect(clampCountIn(4, 2)).toBe(4);
    expect(clampCountIn(5, 2)).toBe(4);
    expect(clampCountIn(4, 1)).toBe(4);
  });

  it('allows count-in below the signature beats', () => {
    expect(clampCountIn(5, 6)).toBe(5);
    expect(clampCountIn(0, 6)).toBe(0);
  });
});
