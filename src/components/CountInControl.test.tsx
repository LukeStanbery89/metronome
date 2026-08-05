import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CountInControl } from './CountInControl';

describe('CountInControl', () => {
  it('shows the Off readout for zero and the beat count otherwise', () => {
    const { rerender } = render(
      <CountInControl value={0} maxBeats={4} onChange={vi.fn()} />
    );
    expect(screen.getByText('Off')).toBeTruthy();

    rerender(<CountInControl value={4} maxBeats={4} onChange={vi.fn()} />);
    expect(screen.getByText('4 beats')).toBeTruthy();
  });

  it('commits the rounded slider value on release', () => {
    const onChange = vi.fn();
    render(<CountInControl value={2} maxBeats={4} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('slider'), { target: { value: '3' } });

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
