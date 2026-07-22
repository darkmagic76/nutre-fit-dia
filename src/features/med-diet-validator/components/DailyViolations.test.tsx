import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { DailyViolations } from './DailyViolations';
import { makeValidationResult, makeViolation } from '@/test/fixtures';

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
      violations: [makeViolation({ message: 'Demasiados cereales' })],
      animalProteinCount: 1,
    });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={false} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Demasiados cereales')).toBeInTheDocument();
  });

  it('shows animal protein warning when count exceeds 2', () => {
    const validation = makeValidationResult({ valid: true, animalProteinCount: 3 });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={true} />);

    expect(screen.getByText(/Proteína animal: 3\/día/)).toBeInTheDocument();
  });

  it('renders mixed severity: both error and warning when invalid with high animal protein', () => {
    const validation = makeValidationResult({
      valid: false,
      violations: [makeViolation({ message: 'Exceso de raciones' })],
      animalProteinCount: 4,
    });

    renderWithI18n(<DailyViolations validation={validation} hasFoods={false} />);

    // Both error and warning ViolationList render with role="alert"
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);

    // Error violation
    expect(screen.getByText('Exceso de raciones')).toBeInTheDocument();

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
});
