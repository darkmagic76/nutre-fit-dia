import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import { makeMetricsFormState } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';
import type { UserMetricsFormState } from '@shared/domain';

describe('ProfileForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  const defaultForm = makeMetricsFormState();

  const renderForm = (overrides: Partial<UserMetricsFormState> = {}) => {
    const form = { ...defaultForm, ...overrides };
    return {
      ...renderWithI18n(<ProfileForm form={form} onSubmit={onSubmit} />),
      form,
    };
  };

  beforeEach(() => {
    onSubmit = vi.fn();
  });

  it('renders all required form fields with i18n labels', () => {
    renderForm();

    // Wait — NumberField uses aria-label matching the label text, so we query by label
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Altura (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Edad')).toBeInTheDocument();
    expect(screen.getByLabelText('Género')).toBeInTheDocument();
    expect(screen.getByLabelText('Factor de actividad física')).toBeInTheDocument();
  });

  it('renders optional diagnosis age and glucose fields', () => {
    renderForm();

    expect(screen.getByLabelText('Edad diagnóstico DT2')).toBeInTheDocument();
    expect(screen.getByLabelText('Glucosa (mg/dL)')).toBeInTheDocument();
  });

  it('renders gender select with male and female options', () => {
    renderForm();

    const genderSelect = screen.getByLabelText('Género');
    expect(genderSelect).toBeInTheDocument();

    const options = within(genderSelect).getAllByRole('option');
    const optionValues = options.map((o) => (o as HTMLOptionElement).value);
    expect(optionValues).toContain('male');
    expect(optionValues).toContain('female');
  });

  it('renders PAF select with all 5 activity level options', () => {
    renderForm();

    const pafSelect = screen.getByLabelText('Factor de actividad física');
    const options = within(pafSelect).getAllByRole('option');
    const optionValues = options.map((o) => (o as HTMLOptionElement).value);
    expect(optionValues).toContain('1.2');
    expect(optionValues).toContain('1.375');
    expect(optionValues).toContain('1.55');
    expect(optionValues).toContain('1.725');
    expect(optionValues).toContain('1.9');
  });

  it('renders glucoseContext select with fasting and postprandial options', () => {
    renderForm();

    const glucoseSelect = screen.getByLabelText('Contexto glucosa');
    const options = within(glucoseSelect).getAllByRole('option');
    const optionValues = options.map((o) => (o as HTMLOptionElement).value);
    expect(optionValues).toContain('fasting');
    expect(optionValues).toContain('postprandial');
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    renderForm();

    const button = screen.getByRole('button', { name: 'Calcular perfil' });
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('has form with noValidate attribute and accessible aria-label', () => {
    renderForm();

    const form = screen.getByRole('form', { name: 'Formulario de perfil metabólico' });
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('novalidate');
  });

  it('submits without diagnosisAge value (field is optional)', async () => {
    const user = userEvent.setup();
    renderForm({ diagnosisAge: '' });

    const button = screen.getByRole('button', { name: 'Calcular perfil' });
    await user.click(button);

    // onSubmit receives the form event — the form does not block submission
    // when optional fields are empty (no validation in this component)
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
