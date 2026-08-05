export interface TimeSignature {
  beats: number;
  noteValue: number;
  subdivision: number;
}

export type Accent = 'measure' | 'beat' | 'subdivision' | 'countin';

export type SegmentKind =
  | 'metronome'
  | 'count-in-1'
  | 'group-1'
  | 'count-in-2'
  | 'group-2';

export interface BeatStep {
  segment: SegmentKind;
  beatInMeasure: number;
  totalBeats: number;
  subdivisionIndex: number;
  subdivisions: number;
  accent: Accent;
}

export interface BeatEvent {
  step: BeatStep;
  beatIndex: number;
}
