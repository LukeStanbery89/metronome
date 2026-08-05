import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeSignatureControl } from './TimeSignatureControl';

// The control renders three steppers in order: Beats, Note, Subdivision.
// icon[0]/icon[1] = beats, icon[2]/icon[3] = note, icon[4]/icon[5] = sub.
function baseProps() {
  return {
    beats: 4,
    noteValue: 4,
    subdivision: 2,
    onBeatsChange: vi.fn(),
    onNoteValueChange: vi.fn(),
    onSubdivisionChange: vi.fn(),
  };
}

describe('TimeSignatureControl', () => {
  it('clamps beats to 1..12', () => {
    const props = baseProps();
    props.beats = 1;
    render(<TimeSignatureControl {...props} />);

    const icons = screen.getAllByTestId('icon');
    fireEvent.click(icons[0]);
    expect(props.onBeatsChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(icons[1]);
    expect(props.onBeatsChange).toHaveBeenLastCalledWith(2);
  });

  it('cycles the note value within its list', () => {
    const props = baseProps();
    props.noteValue = 1;
    render(<TimeSignatureControl {...props} />);

    const icons = screen.getAllByTestId('icon');
    // At the first list entry, decrement stays put.
    fireEvent.click(icons[2]);
    expect(props.onNoteValueChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(icons[3]);
    expect(props.onNoteValueChange).toHaveBeenLastCalledWith(2);
  });

  it('cycles the subdivision within its list', () => {
    const props = baseProps();
    props.subdivision = 8; // last entry
    render(<TimeSignatureControl {...props} />);

    const icons = screen.getAllByTestId('icon');
    fireEvent.click(icons[5]);
    expect(props.onSubdivisionChange).toHaveBeenLastCalledWith(8);
    fireEvent.click(icons[4]);
    expect(props.onSubdivisionChange).toHaveBeenLastCalledWith(6);
  });
});
