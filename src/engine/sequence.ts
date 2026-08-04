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

function countInSteps(sig: TimeSignature, segment: SegmentKind): BeatStep[] {
  const steps: BeatStep[] = [];
  for (let beat = 1; beat <= sig.beats; beat++) {
    steps.push({
      segment,
      beatInMeasure: beat,
      totalBeats: sig.beats,
      subdivisionIndex: 0,
      subdivisions: 1,
      accent: 'countin',
      groupIndex: 0,
    });
  }
  return steps;
}

export function buildMetronomePlan(
  sig: TimeSignature,
  countIn: boolean
): PlaybackPlan {
  return {
    intro: countIn ? countInSteps(sig, 'metronome') : [],
    loop: measureSteps(sig, 'metronome', 0),
  };
}

export function buildRatioPlan(
  sig1: TimeSignature,
  countIn1: boolean,
  measures1: number,
  sig2: TimeSignature,
  countIn2: boolean,
  measures2: number
): PlaybackPlan {
  const loop: BeatStep[] = [];
  if (countIn1) loop.push(...countInSteps(sig1, 'count-in-1'));
  for (let m = 0; m < measures1; m++) {
    loop.push(...measureSteps(sig1, 'group-1', 0));
  }
  if (countIn2) loop.push(...countInSteps(sig2, 'count-in-2'));
  for (let m = 0; m < measures2; m++) {
    loop.push(...measureSteps(sig2, 'group-2', 1));
  }
  return { intro: [], loop };
}
