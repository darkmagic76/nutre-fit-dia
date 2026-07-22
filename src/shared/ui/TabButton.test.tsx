import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabButton } from './TabButton';

describe('TabButton', () => {
  it('renders with tab role', () => {
    render(<TabButton active={false}>Scanner</TabButton>);
    expect(screen.getByRole('tab')).toBeInTheDocument();
  });

  it('sets aria-selected when active', () => {
    render(<TabButton active={true}>Active</TabButton>);
    expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'true');
  });

  it('sets aria-selected false when inactive', () => {
    render(<TabButton active={false}>Inactive</TabButton>);
    expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'false');
  });

  it('renders children', () => {
    render(<TabButton active={false}>🔍 Click</TabButton>);
    expect(screen.getByText('🔍 Click')).toBeInTheDocument();
  });
});
