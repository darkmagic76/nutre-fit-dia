import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MedDietValidatorContainer } from './MedDietValidatorContainer';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { FoodCategory } from '@shared/domain';
import { makeFood, makeCaloricTargetOutput, makeValidationResult } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';

describe('MedDietValidatorContainer', () => {
  beforeEach(() => {
    useLogStore.setState({ todayLog: [], todayValidation: null });
    useTrackerStore.setState({ caloricTarget: null });
  });

  it('renders DailyLogView with empty state when store has no entries', () => {
    renderWithI18n(<MedDietValidatorContainer />);

    // Empty tip from DailyLogView
    expect(screen.getByText(/Configurá tu perfil metabólico/)).toBeInTheDocument();

    // FoodList empty state
    expect(screen.getByText('Sin alimentos registrados.')).toBeInTheDocument();
  });

  it('renders DailyLogView with entries when todayLog has foods', () => {
    const foods = [
      makeFood({
        id: '1',
        name: 'Pan integral',
        category: FoodCategory.CEREALS,
        kcalPer100g: 250,
        gramsPerRation: 40,
      }),
      makeFood({
        id: '2',
        name: 'AOVE',
        category: FoodCategory.OLIVE_OIL,
        kcalPer100g: 100,
        gramsPerRation: 15,
      }),
    ];
    const caloricTarget = makeCaloricTargetOutput({ target: 1680, restrictionActive: true });
    const validation = makeValidationResult({ valid: true, animalProteinCount: 1 });

    useLogStore.setState({ todayLog: foods, todayValidation: validation });
    useTrackerStore.setState({ caloricTarget });

    renderWithI18n(<MedDietValidatorContainer />);

    // Food names visible
    expect(screen.getByText('Pan integral')).toBeInTheDocument();
    expect(screen.getByText('AOVE')).toBeInTheDocument();

    // CaloricSummary visible
    expect(screen.getByText('Objetivo diario')).toBeInTheDocument();

    // Success message from DailyViolations
    expect(
      screen.getByText(/El registro de hoy cumple con los límites diarios/),
    ).toBeInTheDocument();

    // Computed totalKcal: 250*(40/100) + 100*(15/100) = 100 + 15 = 115
    expect(screen.getByText('115 kcal')).toBeInTheDocument();
  });
});
