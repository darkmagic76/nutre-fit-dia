import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyFood } from '@domain/classification';
import { generateWeeklyPlan } from '@application/services/planGenerator';
import { suggestAlternative } from '@domain/sustainability/substitutionService';
import { countRations, validateRations, validateWeeklyRations } from '@domain/rationValidator';
import type { CountByCategory } from '@domain/rationValidator';
import { calculateTarget as calculateTargetUseCase } from '@application/use-cases/calculateTarget';
import { DEMO_ENTRY_IDS, DEMO_METRICS_INPUT } from '@application/services/demoDataset';
import { DEMO_EXPECTED } from '@application/services/demoExpectations';
import { TrafficLightColor } from '@domain/trafficLight';
import type { Container } from '@application/ports/container';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import { foodsById } from '@shared/data/foods';
import { makeFood } from '@/test/fixtures';
import { computeDemoChecks } from './DemoGuideContainer';
import { DEMO_STEPS } from './types';

vi.mock('@domain/classification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/classification')>();
  return { ...actual, classifyFood: vi.fn(actual.classifyFood) };
});

vi.mock('@application/services/planGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@application/services/planGenerator')>();
  return { ...actual, generateWeeklyPlan: vi.fn(actual.generateWeeklyPlan) };
});

vi.mock('@domain/sustainability/substitutionService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@domain/sustainability/substitutionService')>();
  return { ...actual, suggestAlternative: vi.fn(actual.suggestAlternative) };
});

vi.mock('@domain/rationValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/rationValidator')>();
  return {
    ...actual,
    countRations: vi.fn(actual.countRations),
    validateRations: vi.fn(actual.validateRations),
    validateWeeklyRations: vi.fn(actual.validateWeeklyRations),
  };
});

/** Real implementations, restored before every test so drift is opt-in per test. */
let real: {
  ration: typeof import('@domain/rationValidator');
  classification: typeof import('@domain/classification');
};

function realTarget(): ReturnType<Container['calculateTarget']> {
  const repo = {
    recordGlucose: () => {},
    recordWeight: () => ({ value: 70, timestamp: 0, imc: 25.7 }),
    detectIMCThresholdCrossing: () => null,
  } as unknown as BiomarkerRepository;
  return calculateTargetUseCase(DEMO_METRICS_INPUT, repo);
}

/**
 * Feeds drifted ration counts for the demo entries only. The plan generator
 * counts its own daily menus through the same function, so every other call
 * keeps the real behaviour.
 */
function driftDemoCounts(extra: Partial<CountByCategory>): void {
  const demoEntries = DEMO_ENTRY_IDS.map((id) => foodsById.get(id)).filter(
    (food): food is NonNullable<typeof food> => food !== undefined,
  );
  const base = real.ration.countRations(demoEntries);
  vi.mocked(countRations).mockImplementation((entries) =>
    demoEntries.every((food) => entries.includes(food))
      ? { ...base, ...extra }
      : real.ration.countRations(entries),
  );
}

function checkFor(
  checks: ReturnType<typeof computeDemoChecks>,
  step: (typeof DEMO_STEPS)[keyof typeof DEMO_STEPS],
  expected: string,
) {
  const found = checks.find((c) => c.step === step && c.expected === expected);
  if (!found) throw new Error(`No check for ${step} expected "${expected}"`);
  return found;
}

describe('computeDemoChecks — clinical drift canaries', () => {
  beforeEach(async () => {
    real = {
      ration:
        await vi.importActual<typeof import('@domain/rationValidator')>('@domain/rationValidator'),
      classification:
        await vi.importActual<typeof import('@domain/classification')>('@domain/classification'),
    };
    vi.mocked(classifyFood).mockImplementation(real.classification.classifyFood);
    vi.mocked(countRations).mockImplementation(real.ration.countRations);
    vi.mocked(validateRations).mockImplementation(real.ration.validateRations);
    vi.mocked(validateWeeklyRations).mockImplementation(real.ration.validateWeeklyRations);
  });

  it('passes every step against the canonical demo dataset', () => {
    const checks = computeDemoChecks(true, realTarget());

    expect(checks).toHaveLength(8);
    expect(checks.filter((c) => !c.passed)).toEqual([]);
  });

  it('freezes the target line extracted from DEMO_EXPECTED', () => {
    const checks = computeDemoChecks(true, realTarget());
    const perfil = checks.find((c) => c.step === DEMO_STEPS.perfil);

    expect(perfil?.expected).toBe('BMR 1345 kcal · TDEE 1614 kcal');
    expect(perfil?.actual).toBe('BMR 1345 kcal · TDEE 1614 kcal');
  });

  it('fails step 2 when the target BMR drifts', () => {
    const target = realTarget();
    const drifted = {
      ...target,
      caloricTarget: { ...target.caloricTarget!, bmr: target.caloricTarget!.bmr + 10 },
    };

    const perfil = computeDemoChecks(true, drifted).find((c) => c.step === DEMO_STEPS.perfil);

    expect(perfil?.passed).toBe(false);
    expect(perfil?.expected).toContain(`BMR ${DEMO_EXPECTED.bmr}`);
    expect(perfil?.actual).toContain(`BMR ${target.caloricTarget!.bmr + 10}`);
  });

  it('fails step 3 when a food changes traffic light', () => {
    vi.mocked(classifyFood).mockReturnValue(TrafficLightColor.ORANGE);

    const checks = computeDemoChecks(true, realTarget());

    expect(checkFor(checks, DEMO_STEPS.escaneo, DEMO_EXPECTED.oil).passed).toBe(false);
    expect(checkFor(checks, DEMO_STEPS.escaneo, DEMO_EXPECTED.cola).passed).toBe(false);
  });

  it('fails step 4 when the generated plan degrades', () => {
    const base = generateWeeklyPlan(true, 4);
    vi.mocked(generateWeeklyPlan).mockReturnValueOnce({
      ...base,
      valid: false,
      days: base.days.slice(0, 6),
    });

    const checks = computeDemoChecks(true, realTarget());

    expect(checkFor(checks, DEMO_STEPS.recomendacion, 'valid · 7 days')).toMatchObject({
      passed: false,
      actual: 'invalid · 6 days',
    });
  });

  it('fails step 5 when substitutions leave the 1-3 range', () => {
    vi.mocked(suggestAlternative).mockReturnValueOnce([
      makeFood(),
      makeFood(),
      makeFood(),
      makeFood(),
    ]);

    const checks = computeDemoChecks(true, realTarget());

    expect(checkFor(checks, DEMO_STEPS.sustitucion, '1-3 alternatives')).toMatchObject({
      passed: false,
      actual: '4 alternatives',
    });
  });

  it('fails step 6 when daily violations drift', () => {
    driftDemoCounts({ dairy: 9 });

    const checks = computeDemoChecks(true, realTarget());

    expect(checkFor(checks, DEMO_STEPS.validaciones, '5 daily violations')).toMatchObject({
      passed: false,
      actual: '6 daily violations',
    });
    expect(checkFor(checks, DEMO_STEPS.validaciones, '3 weekly violations').passed).toBe(true);
  });

  it('fails step 6 when weekly violations drift', () => {
    driftDemoCounts({ eggs: 9 });

    const checks = computeDemoChecks(true, realTarget());

    expect(checkFor(checks, DEMO_STEPS.validaciones, '3 weekly violations')).toMatchObject({
      passed: false,
      actual: '4 weekly violations',
    });
    expect(checkFor(checks, DEMO_STEPS.validaciones, '5 daily violations').passed).toBe(true);
  });
});
