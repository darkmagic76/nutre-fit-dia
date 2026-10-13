import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useLocale } from '@shared/i18n';
import { DEMO_STEPS, type DemoGuideViewProps } from './types';
import { DemoGuideView } from './DemoGuideView';

const noop = vi.fn();

function baseProps(): DemoGuideViewProps {
  return {
    currentStep: DEMO_STEPS.escaneo,
    completed: false,
    completedChecks: {},
    checks: [
      { step: DEMO_STEPS.escaneo, passed: true, expected: 'green', actual: 'green' },
      { step: DEMO_STEPS.escaneo, passed: false, expected: 'red', actual: 'green' },
    ],
    seeded: true,
    confirmReset: false,
    onNext: noop,
    onBack: noop,
    onReplay: noop,
    onExit: noop,
    onConfirmSeed: noop,
  };
}

function renderView(props: DemoGuideViewProps = baseProps()) {
  render(
    <I18nProvider>
      <DemoGuideView {...props} />
    </I18nProvider>,
  );
}

function LocaleSwitcher() {
  const { setLocale } = useLocale();
  return (
    <button type="button" onClick={() => setLocale('en')}>
      to-en
    </button>
  );
}

describe('DemoGuideView (pure props)', () => {
  it('renders the current step with expected/actual checks and nav buttons', () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Escaneo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    const items = screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(items.some((t) => t.includes('Esperado: green · Obtenido: green'))).toBe(true);
    expect(items.some((t) => t.includes('Falló'))).toBe(true);
  });

  it('shows the confirm prompt with Confirm/Cancel when seed aborted', () => {
    renderView({ ...baseProps(), currentStep: null, confirmReset: true });
    expect(
      screen.getByText('Ya hay datos guardados. ¿Querés reemplazarlos con los datos de la demo?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('shows the completed summary with recorded passes after step 6', () => {
    renderView({
      ...baseProps(),
      currentStep: null,
      completed: true,
      completedChecks: { [DEMO_STEPS.datos]: true },
    });
    expect(screen.getByRole('button', { name: 'Reiniciar demo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir de la demo' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('listitem')
        .map((li) => li.textContent ?? '')
        .join(' '),
    ).toContain('Correcto');
  });

  it('toggles step copy from es to en via getByRole queries', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LocaleSwitcher />
        <DemoGuideView {...baseProps()} />
      </I18nProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Escaneo' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'to-en' }));
    expect(await screen.findByRole('heading', { name: 'Scan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});
