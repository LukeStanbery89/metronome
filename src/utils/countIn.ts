// Human-readable label for a count-in length. Extracted from the control so
// the formatting rules are testable in isolation.
export function countInReadout(value: number): string {
  if (value <= 0) return 'Off';
  return value === 1 ? '1 beat' : `${value} beats`;
}
