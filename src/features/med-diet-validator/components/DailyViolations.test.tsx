import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { DailyViolations } from './DailyViolations';
import { makeValidationResult, makeViolation } from '@/test/fixtures';
import { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/nudge';
import { FoodCategory } from '@shared/domain';

describe('DailyViolations', () => {
  it('shows green success message when valid and has foods', () => {
    const validation = makeValidationResult({ valid: true, animalProteinCount: 1 });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={true} />);

    const success = screen.getByRole('status');
    expect(success).toHaveTextContent(/El registro de hoy cumple con los límites diarios/i);
  });

  it('shows violation list when not valid', () => {
    const validation = makeValidationResult({
      valid: false,
      violations: [makeViolation()],
      animalProteinCount: 1,
    });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={false} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Formatted via formatViolation with Spanish locale (default)
    expect(screen.getByText(/Cereales: 5 raciones/)).toBeInTheDocument();
  });

  it('shows animal protein warning when count exceeds 2', () => {
    const validation = makeValidationResult({ valid: true, animalProteinCount: 3 });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={true} />);

    expect(screen.getByText(/Proteína animal: 3\/día/)).toBeInTheDocument();
  });

  it('renders mixed severity: both error and warning when invalid with high animal protein', () => {
    const validation = makeValidationResult({
      valid: false,
      violations: [makeViolation()],
      animalProteinCount: 4,
    });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={false} />);

    // Both error and warning ViolationList render with role="alert"
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);

    // Formatted violation via formatViolation (Spanish locale)
    expect(screen.getByText(/Cereales: 5 raciones/)).toBeInTheDocument();

    // Warning violation (protein count > 2)
    expect(screen.getByText(/Proteína animal: 4\/día/)).toBeInTheDocument();
  });

  it('renders nothing visible when valid but has no foods', () => {
    const validation = makeValidationResult({ valid: true, animalProteinCount: 1 });

    const { container } = renderWithI18n(
      <DailyViolations validation={validation} hasFoods={false} />,
    );

    // Success message only renders when hasFoods is true
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    // No alerts either
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Container should have no visible text content
    expect(container.textContent).toBe('');
  });

  // ─── Vegetable nudge time gate ───

  it('shows vegetable nudge info before 2PM when deficit exists', () => {
    // Arrange: vegetable deficit violation, currentHour < threshold
    const deficitViolation = makeViolation({
      category: FoodCategory.VEGETABLES as unknown as string,
      direction: 'under',
      message: 'Déficit de hortalizas',
    });
    const validation = makeValidationResult({
      valid: false,
      violations: [deficitViolation],
      animalProteinCount: 1,
    });
    const beforeThreshold = VEGETABLE_NUDGE_HOUR_THRESHOLD - 3; // 11

    // Act
    renderWithI18n(
      <DailyViolations validation={validation} hasFoods={true} currentHour={beforeThreshold} />,
    );

    // Assert: Message A visible
    expect(
      screen.getByText(/Los recordatorios de hortalizas se activan a partir de las 14:00/),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows vegetable deficit message at/after 2PM when deficit exists', () => {
    // Arrange: vegetable deficit violation, currentHour >= threshold
    const deficitViolation = makeViolation({
      category: FoodCategory.VEGETABLES as unknown as string,
      direction: 'under',
      message: 'Déficit de hortalizas',
    });
    const validation = makeValidationResult({
      valid: false,
      violations: [deficitViolation],
      animalProteinCount: 1,
    });
    const atThreshold = VEGETABLE_NUDGE_HOUR_THRESHOLD; // 14

    // Act
    renderWithI18n(
      <DailyViolations validation={validation} hasFoods={true} currentHour={atThreshold} />,
    );

    // Assert: Message B visible
    expect(screen.getByText(/Tienes déficit de hortalizas/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows neither vegetable nudge message when no vegetable deficit', () => {
    // Arrange: no vegetable violation
    const cerealViolation = makeViolation({
      category: FoodCategory.CEREALS as unknown as string,
      direction: 'over',
      message: 'Demasiados cereales',
    });
    const validation = makeValidationResult({
      valid: false,
      violations: [cerealViolation],
      animalProteinCount: 1,
    });

    // Act
    renderWithI18n(<DailyViolations validation={validation} hasFoods={true} currentHour={10} />);

    // Assert: neither vegetable nudge message visible
    expect(screen.queryByText(/recordatorios de hortalizas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tienes déficit de hortalizas/)).not.toBeInTheDocument();
  });
});
