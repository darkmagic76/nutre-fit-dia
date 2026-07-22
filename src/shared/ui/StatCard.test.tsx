import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="BMR" value="1500 kcal" />);
    expect(screen.getByText('BMR')).toBeInTheDocument();
    expect(screen.getByText('1500 kcal')).toBeInTheDocument();
  });

  it('renders optional sub text', () => {
    render(<StatCard label="Deficit" value="600 kcal" sub="IMC > 25" />);
    expect(screen.getByText('IMC > 25')).toBeInTheDocument();
  });

  it('renders danger variant with red background', () => {
    render(<StatCard label="Over" value="3000 kcal" variant="danger" />);
    const card = screen.getByRole('status');
    expect(card.className).toContain('bg-red');
  });

  it('renders success variant with green background', () => {
    render(<StatCard label="Target" value="1800 kcal" variant="success" />);
    const card = screen.getByRole('status');
    expect(card.className).toContain('bg-emerald');
  });
});
