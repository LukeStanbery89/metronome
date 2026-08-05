import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BpmControl } from './BpmControl';

function renderControl(
  overrides: Partial<Parameters<typeof BpmControl>[0]> = {}
) {
  const props = {
    value: 120,
    displayValue: 120,
    onPreview: vi.fn(),
    onCommit: vi.fn(),
    ...overrides,
  };
  const utils = render(<BpmControl {...props} />);
  return { ...utils, ...props };
}

describe('BpmControl', () => {
  it('decrements and increments via the steppers with clamping', () => {
    const { onCommit, rerender } = renderControl({ value: 30 });
    const icons = screen.getAllByTestId('icon');

    fireEvent.click(icons[0]); // minus at the floor stays at 30
    expect(onCommit).toHaveBeenLastCalledWith(30);

    fireEvent.click(icons[1]); // plus
    expect(onCommit).toHaveBeenLastCalledWith(31);

    rerender(
      <BpmControl value={280} displayValue={280} onPreview={vi.fn()} onCommit={onCommit} />
    );
    fireEvent.click(screen.getAllByTestId('icon')[1]); // plus at the ceiling
    expect(onCommit).toHaveBeenLastCalledWith(280);
  });

  it('previews slider movement and commits on release', () => {
    const { onPreview, onCommit } = renderControl();
    const slider = screen.getByTestId('slider');

    fireEvent.change(slider, { target: { value: '150' } });

    expect(onPreview).toHaveBeenCalledWith(150);
    expect(onCommit).toHaveBeenCalledWith(150);
  });

  it('commits a typed value clamped into range', () => {
    const { onCommit } = renderControl();
    fireEvent.click(screen.getByText('120'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '500' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith(280);
  });

  it('restores the readout when a typed value is invalid', () => {
    const { onCommit } = renderControl();
    fireEvent.click(screen.getByText('120'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('120')).toBeTruthy();
  });
});
