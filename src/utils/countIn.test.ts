import { describe, expect, it } from 'vitest';
import { countInReadout } from './countIn';

describe('countInReadout', () => {
  it('shows Off for zero and negative values', () => {
    expect(countInReadout(0)).toBe('Off');
    expect(countInReadout(-2)).toBe('Off');
  });

  it('uses the singular for a single beat', () => {
    expect(countInReadout(1)).toBe('1 beat');
  });

  it('uses the plural for multiple beats', () => {
    expect(countInReadout(2)).toBe('2 beats');
    expect(countInReadout(8)).toBe('8 beats');
  });
});
