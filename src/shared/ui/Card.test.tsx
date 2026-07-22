import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders title and children', () => {
    render(<Card title="Test Title">Hello</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Card title="T" description="A description">
        X
      </Card>,
    );
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('has aria-labelledby pointing to the title', () => {
    render(<Card title="My Card">Body</Card>);
    const section = screen.getByRole('region', { name: /my card/i });
    expect(section).toBeInTheDocument();
  });
});
