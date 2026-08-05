import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabBar } from './TabBar';

describe('TabBar', () => {
  it('renders both tabs and reports the selected one', () => {
    const onChange = vi.fn();
    render(<TabBar active="metronome" onChange={onChange} />);

    expect(screen.getByText('Metronome')).toBeTruthy();
    fireEvent.click(screen.getByText('Ratio Training'));
    expect(onChange).toHaveBeenCalledWith('ratio');
  });

  it('uses outline icons for inactive tabs', () => {
    render(<TabBar active="metronome" onChange={vi.fn()} />);
    const names = screen
      .getAllByTestId('icon')
      .map((el) => el.getAttribute('data-name'));
    expect(names).toEqual(['timer', 'swap-vertical-outline']);
  });
});
