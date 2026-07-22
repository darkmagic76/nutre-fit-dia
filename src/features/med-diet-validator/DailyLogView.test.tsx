import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { DailyLogView } from './DailyLogView';
import { FoodCategory } from '@shared/domain';
import { makeFood, makeCaloricTargetOutput, makeValidationResult } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';

describe('DailyLogView', () => {
  const caloricTarget = makeCaloricTargetOutput({
    target: 1680,
    restrictionActive: true,
    deficit: 600,
  });
  const foods = [
    makeFood({ id: '1', name: 'Pan integral', category: FoodCategory.CEREALS, kcalPer100g: 250 }),
    makeFood({ id: '2', name: 'AOVE', category: FoodCategory.OLIVE_OIL, kcalPer100g: 100 }),
  ];
  const validation = makeValidationResult({ valid: true, animalProteinCount: 1 });
  const totalKcal = 350;
  const onRemoveFood = vi.fn();

  it('renders CaloricSummary, FoodList, and DailyViolations when all props provided', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={foods}
        todayValidation={validation}
        caloricTarget={caloricTarget}
        totalKcal={totalKcal}
        onRemoveFood={onRemoveFood}
      />,
    );

    // CaloricSummary
    expect(screen.getByText('Objetivo diario')).toBeInTheDocument();
    expect(screen.getByText('Ingerido')).toBeInTheDocument();

    // FoodList
    expect(screen.getByText('Pan integral')).toBeInTheDocument();
    expect(screen.getByText('AOVE')).toBeInTheDocument();

    // DailyViolations — success message (3 status elements: 2 StatCards + 1 success message)
    const statuses = screen.getAllByRole('status');
    expect(statuses.length).toBeGreaterThanOrEqual(3);
    expect(
      screen.getByText(/El registro de hoy cumple con los límites diarios/),
    ).toBeInTheDocument();
  });

  it('shows empty state tip when no caloricTarget', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={[]}
        todayValidation={null}
        caloricTarget={null}
        totalKcal={0}
        onRemoveFood={vi.fn()}
      />,
    );

    expect(screen.getByText(/Configurá tu perfil metabólico/)).toBeInTheDocument();
    // R2-S4: default description text when no caloricTarget
    const card = screen.getByRole('region', { name: /Registro Diario/ });
    expect(card).toBeInTheDocument();
  });

  it('renders FoodList with entries when todayLog has foods', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={foods}
        todayValidation={null}
        caloricTarget={null}
        totalKcal={totalKcal}
        onRemoveFood={onRemoveFood}
      />,
    );

    expect(screen.getByText('Pan integral')).toBeInTheDocument();
    expect(screen.getByText('AOVE')).toBeInTheDocument();
  });

  it('renders description with deficit info when caloricTarget has restrictionActive', () => {
    const target = makeCaloricTargetOutput({ target: 1680, restrictionActive: true, deficit: 600 });

    renderWithI18n(
      <DailyLogView
        todayLog={[]}
        todayValidation={null}
        caloricTarget={target}
        totalKcal={1200}
        onRemoveFood={vi.fn()}
      />,
    );

    // Description contains target, ingested, and deficit
    const description = screen.getByText(/Déficit: 600 kcal/);
    expect(description).toBeInTheDocument();
  });

  it('renders DailyViolations when todayValidation is provided', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={foods}
        todayValidation={validation}
        caloricTarget={caloricTarget}
        totalKcal={totalKcal}
        onRemoveFood={onRemoveFood}
      />,
    );

    expect(
      screen.getByText(/El registro de hoy cumple con los límites diarios/),
    ).toBeInTheDocument();
  });

  it('does not render CaloricSummary when caloricTarget is null', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={foods}
        todayValidation={null}
        caloricTarget={null}
        totalKcal={totalKcal}
        onRemoveFood={onRemoveFood}
      />,
    );

    expect(screen.queryByText('Objetivo diario')).not.toBeInTheDocument();
    expect(screen.queryByText('Ingerido')).not.toBeInTheDocument();
    // R2-S6: DailyViolations not rendered when todayValidation is null
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders card title with i18n text', () => {
    renderWithI18n(
      <DailyLogView
        todayLog={[]}
        todayValidation={null}
        caloricTarget={null}
        totalKcal={0}
        onRemoveFood={vi.fn()}
      />,
    );

    expect(screen.getByText('📝 Registro Diario')).toBeInTheDocument();
  });
});
