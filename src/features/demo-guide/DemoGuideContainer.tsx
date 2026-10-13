import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEMO_ENTRY_IDS,
  DEMO_METRICS_INPUT,
  DEMO_TRIGGER_FOOD_ID,
} from '@application/services/demoDataset';
import { generateWeeklyPlan } from '@application/services/planGenerator';
import type { Container } from '@application/ports/container';
import { countRations, validateRations, validateWeeklyRations } from '@domain/rationValidator';
import { suggestAlternative } from '@domain/sustainability/substitutionService';
import { TrafficLightColor } from '@domain/trafficLight';
import type { Food } from '@domain/food';
import { classifyFood } from '@features/nutritional-traffic-light/services/classificationService';
import { foods, foodsById } from '@shared/data/foods';
import { useContainer } from '@shared/context/useContainer';
import type { Tab } from '@shared/hooks/useTabNavigation';
import {
  DEMO_STEP_ORDER,
  DEMO_STEPS,
  type DemoCheckResult,
  type DemoGuideContainerProps,
  type DemoStep,
} from './types';
import { DemoGuideView } from './DemoGuideView';

/** Port-bound target type (container.calculateTarget returns Error, not ValidationError). */
type DemoTarget = ReturnType<Container['calculateTarget']>;

/** Step → App tab for onNavigate (datos has no tab; App owns useTabNavigation). */
const STEP_TAB: Record<DemoStep, Tab | null> = {
  datos: null,
  perfil: 'metabolic',
  escaneo: 'scanner',
  recomendacion: 'plan',
  sustitucion: 'sustainability',
  validaciones: 'log',
};

/**
 * Advisory per-step checks from domain truth (never hardcoded strings alone).
 * Clinical drift surfaces as FAIL so e2e goes red by design.
 */
function row(step: DemoStep, passed: boolean, expected: string, actual: string): DemoCheckResult {
  return { step, passed, expected, actual };
}

export function computeDemoChecks(seeded: boolean, target: DemoTarget | null): DemoCheckResult[] {
  const restriction = target?.caloricRestrictionActive ?? false;
  const bmr = target?.caloricTarget ? String(target.caloricTarget.bmr) : '—';
  const tdee = target?.caloricTarget ? String(target.caloricTarget.tdee) : '—';
  const perfilValue = `BMR ${bmr} kcal · TDEE ${tdee} kcal`;
  const oil = foodsById.get('oil-aove');
  const cola = foodsById.get('proc-refresco-cola');
  const trigger = foodsById.get(DEMO_TRIGGER_FOOD_ID);
  const plan = generateWeeklyPlan(restriction, 4);
  const entries = DEMO_ENTRY_IDS.map((id) => foodsById.get(id)).filter(
    (entry): entry is Food => entry !== undefined,
  );
  const counts = countRations(entries);
  const daily = validateRations(counts, restriction);
  const weekly = validateWeeklyRations(counts);
  const alternatives = trigger ? suggestAlternative(trigger, foods) : [];
  const green = TrafficLightColor.GREEN;
  const red = TrafficLightColor.RED;
  const { datos, perfil, escaneo, recomendacion, sustitucion, validaciones } = DEMO_STEPS;
  return [
    row(datos, seeded, 'seeded', seeded ? 'seeded' : 'empty'),
    row(perfil, target !== null && target.profileError === null, perfilValue, perfilValue),
    row(
      escaneo,
      oil !== undefined && classifyFood(oil) === green,
      green,
      oil ? classifyFood(oil) : 'missing',
    ),
    row(
      escaneo,
      cola !== undefined && classifyFood(cola) === red,
      red,
      cola ? classifyFood(cola) : 'missing',
    ),
    row(
      recomendacion,
      plan.valid && plan.days.length === 7,
      'valid · 7 days',
      `${plan.valid ? 'valid' : 'invalid'} · ${plan.days.length} days`,
    ),
    row(
      sustitucion,
      alternatives.length >= 1 && alternatives.length <= 3,
      '1-3 alternatives',
      `${alternatives.length} alternatives`,
    ),
    row(validaciones, true, 'listed', `${daily.violations.length} daily violations`),
    row(validaciones, true, 'listed', `${weekly.violations.length} weekly violations`),
  ];
}

/**
 * Demo tour state machine: closed → step[1..6] → completed.
 * Logic only — all markup lives in DemoGuideView (container/presentational).
 */
export function DemoGuideContainer({ onNavigate, onExit }: DemoGuideContainerProps) {
  const { seedDemo, resetDemo, calculateTarget } = useContainer();
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null);
  const [completed, setCompleted] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [completedChecks, setCompletedChecks] = useState<Partial<Record<DemoStep, boolean>>>({});
  const [targetResult, setTargetResult] = useState<DemoTarget | null>(null);
  const startedRef = useRef(false);
  const targetRequestedRef = useRef(false);

  // START on mount (mount = open). ?demo=1 fires once: stripped via replaceState.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      params.delete('demo');
      const query = params.toString();
      const hash = window.location.hash;
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}${hash}`,
      );
    }
    void seedDemo().then((result) => {
      if (result.aborted) setConfirmReset(true);
      else {
        setSeeded(true);
        setCurrentStep(DEMO_STEP_ORDER[0]);
      }
    });
  }, [seedDemo]);

  // Step-2 metrics write: single calculateTarget port call (no duplicate writes).
  useEffect(() => {
    if (currentStep !== DEMO_STEPS.perfil || targetResult || targetRequestedRef.current) return;
    targetRequestedRef.current = true;
    setTargetResult(calculateTarget(DEMO_METRICS_INPUT));
  }, [currentStep, targetResult, calculateTarget]);

  const checks = useMemo(() => computeDemoChecks(seeded, targetResult), [seeded, targetResult]);

  function goToStep(step: DemoStep) {
    setCurrentStep(step);
    const tab = STEP_TAB[step];
    if (tab) onNavigate(tab);
  }

  function handleNext() {
    if (!currentStep) return;
    const passed = checks.filter((c) => c.step === currentStep).every((c) => c.passed);
    setCompletedChecks((prev) => ({ ...prev, [currentStep]: passed }));
    const index = DEMO_STEP_ORDER.indexOf(currentStep);
    if (index === DEMO_STEP_ORDER.length - 1) setCompleted(true);
    else goToStep(DEMO_STEP_ORDER[index + 1]);
  }

  function handleBack() {
    if (!currentStep) return;
    const index = DEMO_STEP_ORDER.indexOf(currentStep);
    if (index > 0) goToStep(DEMO_STEP_ORDER[index - 1]);
  }

  function handleConfirmSeed() {
    void seedDemo({ confirmed: true }).then((result) => {
      if (!result.aborted) {
        setSeeded(true);
        setConfirmReset(false);
        setCurrentStep(DEMO_STEP_ORDER[0]);
      }
    });
  }

  function handleReplay() {
    void resetDemo()
      .then(() => seedDemo())
      .then((result) => {
        setCompleted(false);
        setCompletedChecks({});
        setTargetResult(null);
        targetRequestedRef.current = false;
        if (result.aborted) {
          setSeeded(false);
          setConfirmReset(true);
          setCurrentStep(null);
        } else {
          setSeeded(true);
          setConfirmReset(false);
          setCurrentStep(DEMO_STEP_ORDER[0]);
        }
      });
  }

  return (
    <DemoGuideView
      currentStep={currentStep}
      completed={completed}
      completedChecks={completedChecks}
      checks={checks}
      seeded={seeded}
      confirmReset={confirmReset}
      onNext={handleNext}
      onBack={handleBack}
      onReplay={handleReplay}
      onExit={onExit}
      onConfirmSeed={handleConfirmSeed}
    />
  );
}
