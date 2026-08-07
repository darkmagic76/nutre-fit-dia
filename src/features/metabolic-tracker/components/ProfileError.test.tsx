import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileError } from './ProfileError';
import { ValidationError } from '@domain/errors';
import { I18nProvider } from '@shared/i18n';
import { es } from '@shared/i18n/es';

describe('ProfileError', () => {
  const renderWithI18n = (ui: React.ReactElement) => {
    return render(<I18nProvider value={es}>{ui}</I18nProvider>);
  };

  it('returns null when error is null (renders nothing in DOM)', () => {
    const { container } = renderWithI18n(<ProfileError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('translates GLUCOSE_REQUIRED error code to Spanish message', () => {
    const error = new ValidationError('GLUCOSE_REQUIRED');
    renderWithI18n(<ProfileError error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('glucosa es obligatoria');
  });

  it('translates GLUCOSE_MUST_BE_POSITIVE error code to Spanish message', () => {
    const error = new ValidationError('GLUCOSE_MUST_BE_POSITIVE');
    renderWithI18n(<ProfileError error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('valor positivo');
  });

  it('translates DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE with context', () => {
    const error = new ValidationError('DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE', {
      diagnosisAge: 45,
      currentAge: 40,
    });
    renderWithI18n(<ProfileError error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('edad de diagnóstico');
  });

  it('translates IMC_THRESHOLD_CROSSED with direction context', () => {
    const error = new ValidationError('IMC_THRESHOLD_CROSSED', {
      direction: 'crossed_above',
    });
    renderWithI18n(<ProfileError error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('IMC');
  });

  it('translates INVALID_NUMERIC_INPUT with error context', () => {
    const error = new ValidationError('INVALID_NUMERIC_INPUT', {
      error: 'Invalid input',
    });
    renderWithI18n(<ProfileError error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error al procesar');
  });
});
