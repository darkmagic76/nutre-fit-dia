import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ProfileResults } from './ProfileResults';
import { makeCaloricTargetOutput } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';

describe('ProfileResults', () => {
  const renderResults = (overrides: Parameters<typeof makeCaloricTargetOutput>[0] = {}) =>
    renderWithI18n(<ProfileResults caloricTarget={makeCaloricTargetOutput(overrides)} />);

  it('renders BMR, TDEE, deficit, and target StatCards with kcal values', () => {
    renderResults();

    expect(screen.getByRole('status', { name: 'BMR: 1400 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'TDEE: 1680 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Déficit: 600 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Objetivo: 1680 kcal' })).toBeInTheDocument();
  });

  it('shows "Sin restricción" subtext and default variant when restriction is inactive', () => {
    renderResults({ restrictionActive: false, deficit: 0 });

    const deficitCard = screen.getByRole('status', { name: /Déficit: 0 kcal/ });
    expect(deficitCard).toBeInTheDocument();
    expect(deficitCard).toHaveTextContent('Sin restricción');
    expect(deficitCard).toHaveAttribute('data-variant', 'default');
  });

  it('shows restriction subtext "IMC > 25" and danger variant when restriction is active', () => {
    renderResults({ restrictionActive: true, deficit: 600 });

    const deficitCard = screen.getByRole('status', { name: /Déficit: 600 kcal/ });
    expect(deficitCard).toBeInTheDocument();
    expect(deficitCard).toHaveTextContent('IMC > 25');
    expect(deficitCard).toHaveAttribute('data-variant', 'danger');
  });

  it('renders target card with success variant', () => {
    renderResults();

    const targetCard = screen.getByRole('status', { name: /Objetivo:/ });
    expect(targetCard).toHaveAttribute('data-variant', 'success');
  });

  it('displays target at safety floor of 1200 kcal correctly', () => {
    renderResults({ target: 1200, tdee: 1200, deficit: 0 });

    expect(screen.getByRole('status', { name: 'Objetivo: 1200 kcal' })).toBeInTheDocument();
  });

  it('displays deficit capped at 30% of TDEE correctly', () => {
    // 30% of 1400 TDEE = 420 kcal deficit cap
    renderResults({ tdee: 1400, deficit: 420, target: 980, restrictionActive: true });

    expect(screen.getByRole('status', { name: 'Déficit: 420 kcal' })).toBeInTheDocument();
  });

  it('has accessible aria-label and aria-live="polite" for screen readers', () => {
    renderResults();

    const region = screen.getByLabelText('Resultados del perfil metabólico');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('all metric values include "kcal" suffix', () => {
    renderResults({ bmr: 1500, tdee: 1800, deficit: 300, target: 1500 });

    const statusElements = screen.getAllByRole('status');
    for (const el of statusElements) {
      const ariaLabel = el.getAttribute('aria-label') ?? '';
      expect(ariaLabel).toMatch(/kcal/);
    }
  });
});
