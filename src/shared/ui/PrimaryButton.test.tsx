import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renders children', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows as disabled', () => {
    render(<PrimaryButton disabled>Disabled</PrimaryButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
