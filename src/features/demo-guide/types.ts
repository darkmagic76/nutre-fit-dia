import type { Tab } from '@shared/hooks/useTabNavigation';

/**
 * Demo tour steps in fixed order (spec: datos-iniciales, perfil, escaneo,
 * recomendacion, sustitucion, validaciones).
 *
 * Const object + derived union — `erasableSyntaxOnly` forbids enums.
 */
export const DEMO_STEPS = {
  datos: 'datos',
  perfil: 'perfil',
  escaneo: 'escaneo',
  recomendacion: 'recomendacion',
  sustitucion: 'sustitucion',
  validaciones: 'validaciones',
} as const;

export type DemoStep = (typeof DEMO_STEPS)[keyof typeof DEMO_STEPS];

/** Ordered tour path — the Container advances along this list. */
export const DEMO_STEP_ORDER: readonly DemoStep[] = [
  DEMO_STEPS.datos,
  DEMO_STEPS.perfil,
  DEMO_STEPS.escaneo,
  DEMO_STEPS.recomendacion,
  DEMO_STEPS.sustitucion,
  DEMO_STEPS.validaciones,
];

/**
 * Advisory per-step check (design: never blocks advance).
 * `expected` is recomputed via domain truth so clinical drift fails loudly.
 */
export interface DemoCheckResult {
  step: DemoStep;
  passed: boolean;
  expected: string;
  actual: string;
}

/** Props for `DemoGuideContainer` (design contract — App owns navigation). */
export interface DemoGuideContainerProps {
  onNavigate: (tab: Tab) => void;
  onExit: () => void;
}

/** Pure props for `DemoGuideView` — no store imports (container/presentational). */
export interface DemoGuideViewProps {
  currentStep: DemoStep | null;
  completed: boolean;
  completedChecks: Partial<Record<DemoStep, boolean>>;
  checks: readonly DemoCheckResult[];
  seeded: boolean;
  confirmReset: boolean;
  onNext: () => void;
  onBack: () => void;
  onReplay: () => void;
  onExit: () => void;
  onConfirmSeed: () => void;
}
