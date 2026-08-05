import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MeasuresControl } from './MeasuresControl';

describe('MeasuresControl', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn();
    render(<MeasuresControl value={1} onChange={onChange} />);

    const icons = screen.getAllByTestId('icon');
    // At the minimum, decrement is clamped.
    fireEvent.click(icons[0]);
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(icons[1]);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('clamps at the maximum', () => {
    const onChange = vi.fn();
    render(<MeasuresControl value={8} onChange={onChange} />);
    fireEvent.click(screen.getAllByTestId('icon')[1]);
    expect(onChange).toHaveBeenLastCalledWith(8);
  });
});
