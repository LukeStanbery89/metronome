import { describe, expect, it } from 'vitest';
import { TimeSignature } from '../types';
import { buildMetronomePlan, buildRatioPlan } from './sequence';

const sig4: TimeSignature = { beats: 4, noteValue: 4, subdivision: 1 };
const sig4Sub2: TimeSignature = { beats: 4, noteValue: 4, subdivision: 2 };

describe('buildMetronomePlan', () => {
  it('has an empty intro (no count-in)', () => {
    const plan = buildMetronomePlan(sig4);
    expect(plan.intro).toEqual([]);
  });

  it('creates one step per beat', () => {
    expect(buildMetronomePlan(sig4).loop).toHaveLength(4);
  });

  it('marks the first beat as measure and the rest as beat', () => {
    expect(buildMetronomePlan(sig4).loop.map((s) => s.accent)).toEqual([
      'measure',
      'beat',
      'beat',
      'beat',
    ]);
  });

  it('expands each beat into subdivisions with correct accents', () => {
    expect(buildMetronomePlan(sig4Sub2).loop.map((s) => s.accent)).toEqual([
      'measure',
      'subdivision',
      'beat',
      'subdivision',
      'beat',
      'subdivision',
      'beat',
      'subdivision',
    ]);
  });

  it('fills the metadata the UI dots read', () => {
    const step = buildMetronomePlan(sig4Sub2).loop[1]; // beat 1, sub 1
    expect(step.segment).toBe('metronome');
    expect(step.beatInMeasure).toBe(1);
    expect(step.totalBeats).toBe(4);
    expect(step.subdivisionIndex).toBe(1);
    expect(step.subdivisions).toBe(2);
  });
});

describe('buildRatioPlan', () => {
  it('orders count-in 1, group 1, count-in 2, group 2', () => {
    const plan = buildRatioPlan(sig4, 2, 1, sig4, 2, 1);
    expect(plan.loop.map((s) => s.segment)).toEqual([
      'count-in-1',
      'count-in-1',
      'group-1',
      'group-1',
      'group-1',
      'group-1',
      'count-in-2',
      'count-in-2',
      'group-2',
      'group-2',
      'group-2',
      'group-2',
    ]);
  });

  it('marks count-in steps with the countin accent', () => {
    const plan = buildRatioPlan(sig4, 2, 1, sig4, 2, 1);
    const countIn = plan.loop.filter((s) => s.segment === 'count-in-1');
    expect(countIn).toHaveLength(2);
    expect(countIn.every((s) => s.accent === 'countin')).toBe(true);
  });

  it('skips count-ins configured to 0', () => {
    const plan = buildRatioPlan(sig4, 0, 1, sig4, 0, 1);
    expect(plan.loop.map((s) => s.segment)).toEqual([
      'group-1',
      'group-1',
      'group-1',
      'group-1',
      'group-2',
      'group-2',
      'group-2',
      'group-2',
    ]);
  });

  it('repeats measures the configured number of times', () => {
    const plan = buildRatioPlan(sig4, 0, 3, sig4, 0, 2);
    expect(plan.loop.filter((s) => s.segment === 'group-1')).toHaveLength(12);
    expect(plan.loop.filter((s) => s.segment === 'group-2')).toHaveLength(8);
  });

  it('keeps count-in steps as quarter notes regardless of signature', () => {
    const plan = buildRatioPlan(sig4Sub2, 3, 1, sig4, 0, 1);
    const countIn = plan.loop.filter((s) => s.segment === 'count-in-1');
    expect(countIn).toHaveLength(3);
    expect(countIn.every((s) => s.subdivisions === 1)).toBe(true);
    expect(countIn.every((s) => s.totalBeats === 3)).toBe(true);
  });

  it('produces an empty intro', () => {
    const plan = buildRatioPlan(sig4, 0, 1, sig4, 0, 1);
    expect(plan.intro).toEqual([]);
  });
});
