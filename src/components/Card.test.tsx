import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders the title and children', () => {
    render(
      <Card title="Tempo">
        <span>content</span>
      </Card>
    );
    expect(screen.getByText('Tempo')).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('omits the title when not provided', () => {
    render(<Card>only children</Card>);
    expect(screen.getByText('only children')).toBeTruthy();
  });
});
