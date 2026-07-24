import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViolationList } from './ViolationList';

const LABELS = { errorLabel: 'Errors detected', warningLabel: 'Warnings' };

describe('ViolationList', () => {
  it('returns null for empty violations', () => {
    const { container } = render(<ViolationList violations={[]} errorLabel="E" warningLabel="W" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error violations with role alert', () => {
    render(<ViolationList type="error" violations={[{ message: 'too many' }]} {...LABELS} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('too many')).toBeInTheDocument();
  });

  it('renders warning violations without alert role', () => {
    render(
      <ViolationList type="warning" violations={[{ message: 'consider change' }]} {...LABELS} />,
    );
    expect(screen.getByText('consider change')).toBeInTheDocument();
  });

  it('renders multiple violations', () => {
    render(<ViolationList violations={[{ message: 'a' }, { message: 'b' }]} {...LABELS} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });
});
