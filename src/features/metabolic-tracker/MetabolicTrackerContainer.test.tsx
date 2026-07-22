import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MetabolicTrackerContainer } from './MetabolicTrackerContainer';
import { useTrackerStore } from '@shared/stores';
import { makeCaloricTargetOutput } from '@/test/fixtures';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { ValidationError } from '@shared/errors';

describe('MetabolicTrackerContainer', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useTrackerStore.setState({
      weight: '80',
      height: '170',
      age: '55',
      diagnosisAge: '55',
      gender: 'male',
      paf: '1.2',
      glucose: '',
      glucoseContext: 'fasting',
      caloricTarget: null,
      restrictionActive: false,
      profileError: null,
    });
  });

  const renderContainer = () => renderWithI18n(<MetabolicTrackerContainer />);

  it('renders ProfileForm when in pending state (caloricTarget and profileError are null)', () => {
    renderContainer();

    // Card title visible
    expect(screen.getByText('📊 Perfil Metabólico')).toBeInTheDocument();

    // ProfileForm fields visible (labels from i18n)
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Altura (cm)')).toBeInTheDocument();

    // No results yet
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // No error alert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders ProfileResults with caloric target data when store has caloricTarget', () => {
    useTrackerStore.setState({
      caloricTarget: makeCaloricTargetOutput(),
    });

    renderContainer();

    // ProfileResults StatCards visible
    expect(screen.getByRole('status', { name: 'BMR: 1400 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'TDEE: 1680 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Déficit: 600 kcal' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Objetivo: 1680 kcal' })).toBeInTheDocument();
  });

  it('renders ProfileError with alert when store has profileError', () => {
    useTrackerStore.setState({
      profileError: new ValidationError('El peso debe ser un número válido'),
    });

    renderContainer();

    // Error alert visible with correct message
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('El peso debe ser un número válido');
  });

  it('renders restriction warning when IMC crossing is detected and restriction is active', () => {
    useTrackerStore.setState({
      caloricTarget: makeCaloricTargetOutput({ restrictionActive: true, deficit: 600 }),
      profileError: new ValidationError('IMC ha superado 25 — restricción calórica activada', {
        crossing: 'crossed_above',
        prevIMC: 'see history',
      }),
    });

    renderContainer();

    // IMC crossing warning visible as alert
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('IMC ha superado 25');

    // Restriction subtext visible on deficit card
    const deficitCard = screen.getByRole('status', { name: /Déficit:/ });
    expect(deficitCard).toHaveTextContent('IMC > 25');
    expect(deficitCard).toHaveAttribute('data-variant', 'danger');
  });

  it('renders both ProfileResults and ProfileError simultaneously when both exist in store', () => {
    useTrackerStore.setState({
      caloricTarget: makeCaloricTargetOutput({ restrictionActive: false, deficit: 0 }),
      profileError: new ValidationError('Glucosa en ayunas elevada — consulte con su médico'),
    });

    renderContainer();

    // Both results and error visible
    expect(screen.getByRole('status', { name: 'BMR: 1400 kcal' })).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Glucosa en ayunas elevada');
  });
});
