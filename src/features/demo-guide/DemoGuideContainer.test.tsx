import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { I18nProvider } from '@shared/i18n';
import { ContainerProvider } from '@shared/context/ContainerContext';
import type { Container } from '@application/ports/container';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import { calculateTarget as calculateTargetUseCase } from '@application/use-cases/calculateTarget';
import { generateWeeklyPlan } from '@application/services/planGenerator';
import { DEMO_METRICS_INPUT, DEMO_TRIGGER_FOOD_ID } from '@application/services/demoDataset';
import { suggestAlternative } from '@domain/sustainability/substitutionService';
import { foods, foodsById } from '@shared/data/foods';
import { DemoGuideContainer } from './DemoGuideContainer';

// Seeded values MUST satisfy domain truth (verify-2A carry-forward): the stub
// port returns the REAL calculateTarget output for DEMO_METRICS_INPUT.
const fakeBiomarkerRepo = {
  recordGlucose: vi.fn(),
  recordWeight: vi.fn(),
  detectIMCThresholdCrossing: vi.fn().mockReturnValue(null),
} as unknown as BiomarkerRepository;
const realTarget = calculateTargetUseCase(DEMO_METRICS_INPUT, fakeBiomarkerRepo);

function makeStub() {
  return {
    seedDemo: vi.fn().mockResolvedValue({ seeded: true, aborted: false }),
    resetDemo: vi.fn().mockResolvedValue(undefined),
    calculateTarget: vi.fn().mockReturnValue(realTarget),
  };
}

function renderContainer(stub: ReturnType<typeof makeStub>) {
  const onNavigate = vi.fn();
  const onExit = vi.fn();
  render(
    <ContainerProvider value={stub as unknown as Container}>
      <I18nProvider>
        <DemoGuideContainer onNavigate={onNavigate} onExit={onExit} />
      </I18nProvider>
    </ContainerProvider>,
  );
  return { onNavigate, onExit };
}

async function setup() {
  const user = userEvent.setup();
  const stub = makeStub();
  const handlers = renderContainer(stub);
  await screen.findByRole('heading', { name: 'Datos iniciales' });
  return { user, stub, ...handlers };
}

async function advance(user: UserEvent, n: number) {
  for (let i = 0; i < n; i += 1)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
}

function checkTexts(): string[] {
  return screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
}

const CONFIRM_MSG = 'Ya hay datos guardados. ¿Querés reemplazarlos con los datos de la demo?';

describe('DemoGuideContainer state machine', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    vi.clearAllMocks();
  });

  it('START seeds once on mount and leaves the URL alone (App owns deep-link)', async () => {
    window.history.replaceState(null, '', '/?demo=1');
    const { stub } = await setup();
    expect(stub.seedDemo).toHaveBeenCalledTimes(1);
    expect(stub.seedDemo).toHaveBeenCalledWith();
    expect(window.location.search).toBe('?demo=1');
  });

  it('aborted seed shows confirm; Confirm seeds flagged, Cancel exits', async () => {
    const user = userEvent.setup();
    const stub = makeStub();
    stub.seedDemo.mockResolvedValueOnce({ seeded: false, aborted: true });
    const { onExit } = renderContainer(stub);
    await screen.findByText(CONFIRM_MSG);
    expect(screen.queryByRole('heading', { name: 'Datos iniciales' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(stub.seedDemo).toHaveBeenLastCalledWith({ confirmed: true });
    await screen.findByRole('heading', { name: 'Datos iniciales' });
    expect(onExit).not.toHaveBeenCalled();
  });

  it('aborted seed Cancel exits without seeding', async () => {
    const user = userEvent.setup();
    const stub = makeStub();
    stub.seedDemo.mockResolvedValueOnce({ seeded: false, aborted: true });
    const { onExit } = renderContainer(stub);
    await screen.findByText(CONFIRM_MSG);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(stub.seedDemo).toHaveBeenCalledTimes(1);
  });

  it('NEXT/BACK move along steps and notify the App-owned navigator', async () => {
    const { user, onNavigate } = await setup();
    await advance(user, 1);
    await screen.findByRole('heading', { name: 'Perfil' });
    expect(onNavigate).toHaveBeenCalledWith('metabolic');
    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    await screen.findByRole('heading', { name: 'Datos iniciales' });
  });

  it('step 2 writes metrics once via port and shows calculateTarget truth', async () => {
    const { user, stub } = await setup();
    await advance(user, 1);
    await screen.findByRole('heading', { name: 'Perfil' });
    await waitFor(() => expect(stub.calculateTarget).toHaveBeenCalledTimes(1));
    expect(stub.calculateTarget).toHaveBeenCalledWith(DEMO_METRICS_INPUT);
    const bmr = String(realTarget.caloricTarget?.bmr);
    const tdee = String(realTarget.caloricTarget?.tdee);
    expect(checkTexts().some((t) => t.includes(`BMR ${bmr}`) && t.includes(`TDEE ${tdee}`))).toBe(
      true,
    );
  });

  it('escaneo checks come from classifyFood truth; Next stays enabled', async () => {
    const { user } = await setup();
    await advance(user, 2);
    await screen.findByRole('heading', { name: 'Escaneo' });
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    const items = checkTexts();
    expect(items.some((t) => t.includes('Esperado: green · Obtenido: green'))).toBe(true);
    expect(items.some((t) => t.includes('Esperado: red · Obtenido: red'))).toBe(true);
  });

  it('later steps match generateWeeklyPlan and ration truth', async () => {
    const { user } = await setup();
    await advance(user, 3);
    await screen.findByRole('heading', { name: 'Recomendación' });
    const truth = generateWeeklyPlan(realTarget.caloricRestrictionActive, 4);
    expect(truth.valid).toBe(true);
    expect(truth.days).toHaveLength(7);
    expect(checkTexts().some((t) => t.includes('valid · 7 days'))).toBe(true);
    await advance(user, 2);
    await screen.findByRole('heading', { name: 'Validaciones' });
    expect(checkTexts().length).toBeGreaterThanOrEqual(2);
  });

  it('step 5 shows suggestAlternative truth for the trigger food', async () => {
    const { user } = await setup();
    await advance(user, 4);
    await screen.findByRole('heading', { name: 'Sustitución' });
    const trigger = foodsById.get(DEMO_TRIGGER_FOOD_ID);
    expect(trigger).toBeDefined();
    const alternatives = suggestAlternative(trigger!, foods);
    expect(alternatives.length).toBeGreaterThanOrEqual(1);
    expect(alternatives.length).toBeLessThanOrEqual(3);
    expect(
      checkTexts().some(
        (t) => t.includes('1-3 alternatives') && t.includes(`${alternatives.length} alternatives`),
      ),
    ).toBe(true);
  });

  it('REPLAY resets then seeds from scratch at step 1', async () => {
    const { user, stub } = await setup();
    await advance(user, 1);
    await user.click(screen.getByRole('button', { name: 'Reiniciar demo' }));
    await screen.findByRole('heading', { name: 'Datos iniciales' });
    expect(stub.resetDemo).toHaveBeenCalledTimes(1);
    expect(stub.seedDemo).toHaveBeenCalledTimes(2);
  });

  it('REPLAY aborted returns to the confirm prompt', async () => {
    const user = userEvent.setup();
    const stub = makeStub();
    const { onExit } = renderContainer(stub);
    await screen.findByRole('heading', { name: 'Datos iniciales' });
    stub.seedDemo.mockResolvedValueOnce({ seeded: false, aborted: true });
    await user.click(screen.getByRole('button', { name: 'Reiniciar demo' }));
    await screen.findByText(CONFIRM_MSG);
    expect(stub.resetDemo).toHaveBeenCalledTimes(1);
    expect(onExit).not.toHaveBeenCalled();
  });

  it('EXIT closes via onExit and never wipes seeded data', async () => {
    const { user, stub, onExit } = await setup();
    await user.click(screen.getByRole('button', { name: 'Salir de la demo' }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(stub.resetDemo).not.toHaveBeenCalled();
  });

  it('NEXT past step 6 completes and lists recorded advisory checks', async () => {
    const { user } = await setup();
    await advance(user, 6);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Reiniciar demo' })).toBeInTheDocument(),
    );
    expect(checkTexts().join(' ')).toContain('Correcto');
  });
});
