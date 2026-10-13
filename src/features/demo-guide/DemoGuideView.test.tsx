import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useLocale } from '@shared/i18n';
import { DEMO_STEP_ORDER, DEMO_STEPS, type DemoGuideViewProps } from './types';
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

  it('moves the panel by dragging the header handle, keeping buttons working', () => {
    const { container } = render(
      <I18nProvider>
        <DemoGuideView {...baseProps()} />
      </I18nProvider>,
    );
    const panel = container.firstElementChild as HTMLElement;
    const handle = screen.getByRole('heading').closest('header') as HTMLElement;
    expect(handle.className).toContain('cursor-grab');
    expect(panel.style.transform).toBe('');

    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
    expect(handle.className).toContain('cursor-grabbing');
    fireEvent.pointerMove(window, { clientX: 160, clientY: 130 });
    expect(panel.style.transform).toBe('translate(60px, 30px)');
    fireEvent.pointerUp(window);
    expect(handle.className).toContain('cursor-grab');

    // Inner buttons keep working after a drag: Next still fires its handler.
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /siguiente|next/i }));
    });
    expect(noop).toHaveBeenCalled();
  });
});

describe('DemoGuideView drag handle coverage (every tour panel)', () => {
  function renderAndDrag(props: DemoGuideViewProps): { transform: string; handleClass: string } {
    const { container, unmount } = render(
      <I18nProvider>
        <DemoGuideView {...props} />
      </I18nProvider>,
    );
    const panel = container.firstElementChild as HTMLElement;
    const handle = screen.getByRole('heading').closest('header') as HTMLElement;
    const handleClass = handle.className;
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(window, { clientX: 160, clientY: 130 });
    const transform = panel.style.transform;
    fireEvent.pointerUp(window);
    unmount();
    return { transform, handleClass };
  }

  it.each(DEMO_STEP_ORDER)('step %s drags from its header handle', (step) => {
    const { transform, handleClass } = renderAndDrag({ ...baseProps(), currentStep: step });
    expect(handleClass).toContain('cursor-grab');
    expect(transform).toBe('translate(60px, 30px)');
  });

  it('completed summary drags from its header handle', () => {
    const { transform } = renderAndDrag({
      ...baseProps(),
      currentStep: null,
      completed: true,
      completedChecks: { [DEMO_STEPS.datos]: true },
    });
    expect(transform).toBe('translate(60px, 30px)');
  });

  it('confirm-reset prompt drags from its header handle', () => {
    const { transform } = renderAndDrag({
      ...baseProps(),
      currentStep: null,
      confirmReset: true,
    });
    expect(transform).toBe('translate(60px, 30px)');
  });

  it('null-step fallback drags from its header handle', () => {
    const { transform } = renderAndDrag({ ...baseProps(), currentStep: null });
    expect(transform).toBe('translate(60px, 30px)');
  });

  it('keeps the drag offset when the step changes mid-tour', () => {
    const { container, rerender } = render(
      <I18nProvider>
        <DemoGuideView {...baseProps()} />
      </I18nProvider>,
    );
    const panel = container.firstElementChild as HTMLElement;
    const handle = screen.getByRole('heading').closest('header') as HTMLElement;
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(window, { clientX: 160, clientY: 130 });
    fireEvent.pointerUp(window);
    rerender(
      <I18nProvider>
        <DemoGuideView {...baseProps()} currentStep={DEMO_STEPS.perfil} />
      </I18nProvider>,
    );
    expect(panel.style.transform).toBe('translate(60px, 30px)');
    // Locale-independent: the es→en toggle test leaks locale via the
    // module-singleton I18nProvider, so only assert the step-2 heading exists.
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
