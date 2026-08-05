import { BeatStep, SegmentKind, TimeSignature } from '../types';

export interface PlaybackPlan {
  intro: BeatStep[];
  loop: BeatStep[];
}

function measureSteps(
  sig: TimeSignature,
  segment: SegmentKind,
  groupIndex: number
): BeatStep[] {
  const steps: BeatStep[] = [];
  for (let beat = 1; beat <= sig.beats; beat++) {
    for (let sub = 0; sub < sig.subdivision; sub++) {
      const accent =
        beat === 1 && sub === 0
          ? 'measure'
          : sub === 0
            ? 'beat'
            : 'subdivision';
      steps.push({
        segment,
        beatInMeasure: beat,
        totalBeats: sig.beats,
        subdivisionIndex: sub,
        subdivisions: sig.subdivision,
        accent,
        groupIndex,
      });
    }
  }
  return steps;
}

function countInSteps(
  sig: TimeSignature,
  segment: SegmentKind,
  count: number
): BeatStep[] {
  const steps: BeatStep[] = [];
  for (let beat = 1; beat <= count; beat++) {
    steps.push({
      segment,
      beatInMeasure: beat,
      totalBeats: count,
      subdivisionIndex: 0,
      subdivisions: 1,
      accent: 'countin',
      groupIndex: 0,
    });
  }
  return steps;
}

export function buildMetronomePlan(sig: TimeSignature): PlaybackPlan {
  return {
    intro: [],
    loop: measureSteps(sig, 'metronome', 0),
  };
}

export function buildRatioPlan(
  sig1: TimeSignature,
  countInBeats1: number,
  measures1: number,
  sig2: TimeSignature,
  countInBeats2: number,
  measures2: number
): PlaybackPlan {
  const loop: BeatStep[] = [];
  if (countInBeats1 > 0) loop.push(...countInSteps(sig1, 'count-in-1', countInBeats1));
  for (let m = 0; m < measures1; m++) {
    loop.push(...measureSteps(sig1, 'group-1', 0));
  }
  if (countInBeats2 > 0) loop.push(...countInSteps(sig2, 'count-in-2', countInBeats2));
  for (let m = 0; m < measures2; m++) {
    loop.push(...measureSteps(sig2, 'group-2', 1));
  }
  return { intro: [], loop };
}
