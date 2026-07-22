import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViolationList } from './ViolationList';

describe('ViolationList', () => {
  it('returns null for empty violations', () => {
    const { container } = render(<ViolationList violations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error violations with role alert', () => {
    render(<ViolationList type="error" violations={[{ message: 'too many' }]} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('too many')).toBeInTheDocument();
  });

  it('renders warning violations without alert role', () => {
    render(<ViolationList type="warning" violations={[{ message: 'consider change' }]} />);
    expect(screen.getByText('consider change')).toBeInTheDocument();
  });

  it('renders multiple violations', () => {
    render(<ViolationList violations={[{ message: 'a' }, { message: 'b' }]} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });
});
