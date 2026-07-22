import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { CaloricSummary } from './CaloricSummary';
import { makeCaloricTargetOutput } from '@/test/fixtures';

describe('CaloricSummary', () => {
  it('renders target and ingested values when restriction is active', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1680, restrictionActive: true });

    renderWithI18n(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />);

    expect(screen.getByText('Objetivo diario')).toBeInTheDocument();
    expect(screen.getByText('1680 kcal')).toBeInTheDocument();
    expect(screen.getByText('Ingerido')).toBeInTheDocument();
    expect(screen.getByText('1200 kcal')).toBeInTheDocument();
  });

  it('renders target and ingested values when restriction is inactive', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1680, restrictionActive: false });

    renderWithI18n(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />);

    expect(screen.getByText('Objetivo diario')).toBeInTheDocument();
    expect(screen.getByText('1680 kcal')).toBeInTheDocument();
    expect(screen.getByText('Ingerido')).toBeInTheDocument();
    expect(screen.getByText('1200 kcal')).toBeInTheDocument();
  });

  it('uses danger variant when ingested exceeds target', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1500 });

    renderWithI18n(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1800} />);

    const dangerCard = screen.getByRole('status', { name: /Ingerido: 1800 kcal/ });
    expect(dangerCard).toBeInTheDocument();
    expect(dangerCard.dataset.variant).toBe('danger');
  });

  it('uses default variant when ingested does not exceed target', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1500 });

    renderWithI18n(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />);

    const defaultCard = screen.getByRole('status', { name: /Ingerido: 1200 kcal/ });
    expect(defaultCard).toBeInTheDocument();
    expect(defaultCard.dataset.variant).toBe('default');
  });
});
