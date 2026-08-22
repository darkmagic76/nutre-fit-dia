import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MetabolicTrackerView } from './MetabolicTrackerView';
import { makeCaloricTargetOutput, makeMetricsFormState } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { ValidationError } from '@domain/errors';
import { es } from '@shared/i18n/es';
import type { CaloricTargetOutput } from '@domain/caloricTargetService';
import type { ValidationError as ValidationErrorType } from '@domain/errors';

describe('MetabolicTrackerView', () => {
  const form = makeMetricsFormState();
  const onCalculate = vi.fn();

  const renderView = (
    caloricTarget: CaloricTargetOutput | null,
    profileError: ValidationErrorType | null,
  ) =>
    renderWithI18n(
      <MetabolicTrackerView
        form={form}
        caloricTarget={caloricTarget}
        profileError={profileError}
        onCalculate={onCalculate}
        translate={es}
        canCalculate={true}
        onExportData={vi.fn()}
        isExporting={false}
      />,
    );

  it('renders ProfileForm, ProfileResults, and card when caloricTarget is present and no error', () => {
    renderView(makeCaloricTargetOutput(), null);

    // Card title and description visible
    expect(screen.getByText('📊 Perfil Metabólico')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo erMedDiet/)).toBeInTheDocument();

    // ProfileForm fields visible (via i18n labels)
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument();

    // ProfileResults cards visible
    expect(screen.getByRole('status', { name: 'BMR: 1400 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'TDEE: 1680 kcal' })).toBeInTheDocument();

    // ProfileError is rendered but null (no error in DOM)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders ProfileForm and ProfileError when error is present and no caloricTarget', () => {
    const error = new ValidationError('GLUCOSE_REQUIRED');
    renderView(null, error);

    // ProfileForm visible
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument();

    // ProfileError visible with alert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('glucosa es obligatoria');

    // ProfileResults NOT rendered
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders only ProfileForm when both caloricTarget and profileError are null', () => {
    renderView(null, null);

    // ProfileForm visible
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument();

    // ProfileError returns null (no alert)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // ProfileResults NOT rendered
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
