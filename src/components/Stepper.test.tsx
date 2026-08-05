import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('renders both buttons by default and fires both handlers', () => {
    const onDecrement = vi.fn();
    const onIncrement = vi.fn();
    render(<Stepper onDecrement={onDecrement} onIncrement={onIncrement} />);

    const icons = screen.getAllByTestId('icon');
    expect(icons).toHaveLength(2);

    fireEvent.click(icons[0]);
    expect(onDecrement).toHaveBeenCalledOnce();

    fireEvent.click(icons[1]);
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it('renders only the requested button in single modes', () => {
    const { rerender } = render(
      <Stepper onDecrement={vi.fn()} onIncrement={vi.fn()} mode="decrement" />
    );
    expect(screen.getAllByTestId('icon')).toHaveLength(1);

    rerender(
      <Stepper onDecrement={vi.fn()} onIncrement={vi.fn()} mode="increment" />
    );
    expect(screen.getAllByTestId('icon')).toHaveLength(1);
  });

  it('does not fire handlers when disabled', () => {
    const onDecrement = vi.fn();
    const onIncrement = vi.fn();
    render(
      <Stepper
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        disabled
      />
    );

    fireEvent.click(screen.getAllByTestId('icon')[0]);
    expect(onDecrement).not.toHaveBeenCalled();
  });
});
