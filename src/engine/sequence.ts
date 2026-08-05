import { BeatStep, SegmentKind, TimeSignature } from '../types';

// A plan splits playback into two parts:
//   - intro: count-in steps played once at the very start (empty for a plain
//     metronome, which has no count-in).
//   - loop: steps repeated indefinitely once the intro has finished. For the
//     ratio trainer the loop itself interleaves count-in -> group 1 ->
//     count-in -> group 2 so each full cycle begins with a count-in.
export interface PlaybackPlan {
  intro: BeatStep[];
  loop: BeatStep[];
}

// Builds the steps for a single measure of a time signature. Each beat is
// expanded into `subdivision` steps; the downbeat of every beat is a "beat"
// accent, the first beat of the measure is a louder "measure" accent, and
// the remaining subdivisions are "subdivision" accents.
function measureSteps(
  sig: TimeSignature,
  segment: SegmentKind
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
      });
    }
  }
  return steps;
}

// Count-in steps are always quarter-note clicks (subdivisions: 1) regardless
// of the upcoming signature, matching how most players count themselves in.
// The displayed total is the count length, not the measure length.
function countInSteps(
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
    });
  }
  return steps;
}

export function buildMetronomePlan(sig: TimeSignature): PlaybackPlan {
  return {
    intro: [],
    loop: measureSteps(sig, 'metronome'),
  };
}

// The ratio trainer loop is ordered count-in 1 -> group 1 -> count-in 2 ->
// group 2, repeated. A count-in of 0 simply contributes no steps. Group 1
// and group 2 alternate; `measuresN` repeats each signature's measure that
// many times.
export function buildRatioPlan(
  sig1: TimeSignature,
  countInBeats1: number,
  measures1: number,
  sig2: TimeSignature,
  countInBeats2: number,
  measures2: number
): PlaybackPlan {
  const loop: BeatStep[] = [];
  if (countInBeats1 > 0) loop.push(...countInSteps('count-in-1', countInBeats1));
  for (let m = 0; m < measures1; m++) {
    loop.push(...measureSteps(sig1, 'group-1'));
  }
  if (countInBeats2 > 0) loop.push(...countInSteps('count-in-2', countInBeats2));
  for (let m = 0; m < measures2; m++) {
    loop.push(...measureSteps(sig2, 'group-2'));
  }
  return { intro: [], loop };
}
