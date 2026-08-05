// Small pure helpers shared by the controls. Kept framework-free so they can
// be unit-tested without any React Native setup.

export function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

export const BPM_MIN = 30;
export const BPM_MAX = 280;

export function clampBpm(value: number): number {
  return Math.round(clamp(BPM_MIN, BPM_MAX, value));
}

export function clampMeasures(value: number): number {
  return clamp(1, 8, value);
}

// Count-in beats are floored at 4 regardless of the signature so short
// measures (e.g. 2/4) can't be paired with an unreasonably small count-in.
// The slider's max is Math.max(4, beats); this mirrors that ceiling when the
// beats value changes.
export function clampCountIn(countInBeats: number, sigBeats: number): number {
  return Math.min(countInBeats, Math.max(4, sigBeats));
}
