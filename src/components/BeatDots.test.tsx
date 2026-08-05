import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildMetronomePlan, buildRatioPlan } from '../engine/sequence';
import { BeatDots } from './BeatDots';

const sig4 = { beats: 4, noteValue: 4, subdivision: 1 };
const sig4Sub2 = { beats: 4, noteValue: 4, subdivision: 2 };

describe('BeatDots', () => {
  it('shows the ready state with fallback dots when stopped', () => {
    render(<BeatDots step={null} fallbackBeats={4} />);
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getAllByTestId('beat-dot')).toHaveLength(4);
  });

  it('always renders the subdivision row so layout height is fixed', () => {
    // A count-in step has subdivisions: 1, so no ticks should show, but the
    // row must still exist.
    const step = buildMetronomePlan(sig4).loop[0];
    render(<BeatDots step={step} fallbackBeats={4} />);

    expect(screen.getByTestId('sub-row')).toBeTruthy();
    expect(screen.queryAllByTestId('sub-tick')).toHaveLength(0);
  });

  it('shows a tick per subdivision when subdivisions exceed 1', () => {
    const step = buildMetronomePlan(sig4Sub2).loop[0];
    render(<BeatDots step={step} fallbackBeats={4} />);

    expect(screen.getAllByTestId('sub-tick')).toHaveLength(2);
  });

  it('labels the current segment while running', () => {
    const step = buildRatioPlan(sig4, 2, 1, sig4, 0, 1).loop[0];
    render(<BeatDots step={step} fallbackBeats={4} />);

    expect(screen.getByText('Count-in 1')).toBeTruthy();
  });

  it('uses the step total for the dot count while running', () => {
    // A 3-beat count-in shows 3 dots, overriding the 4-beat fallback.
    const step = buildRatioPlan(sig4, 3, 1, sig4, 0, 1).loop[0];
    render(<BeatDots step={step} fallbackBeats={4} />);

    expect(screen.getAllByTestId('beat-dot')).toHaveLength(3);
  });
});
