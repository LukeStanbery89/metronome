import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransportButton } from './TransportButton';

describe('TransportButton', () => {
  it('shows the play icon when stopped and fires onPress', () => {
    const onPress = vi.fn();
    render(<TransportButton isPlaying={false} onPress={onPress} />);

    const icon = screen.getByTestId('icon');
    expect(icon.getAttribute('data-name')).toBe('play');

    fireEvent.click(icon);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('shows the stop icon while playing', () => {
    render(<TransportButton isPlaying onPress={vi.fn()} />);
    expect(screen.getByTestId('icon').getAttribute('data-name')).toBe('stop');
  });
});
