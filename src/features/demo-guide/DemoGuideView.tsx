import { DEMO_STEP_ORDER, type DemoCheckResult, type DemoGuideViewProps } from './types';
import type { DemoStep } from './types';
import type { ReactNode } from 'react';
import { useT } from '@shared/i18n';
import type { Translations } from '@shared/i18n/types';
import { useDraggablePanel, type DragHandleProps } from './hooks/useDraggablePanel';

/** Ephemeral drag-handle props threaded to each section header (View-local). */
interface DraggableSection {
  dragHandleProps: DragHandleProps;
  isDragging: boolean;
}

function handleClassName(isDragging: boolean): string {
  return `${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none select-none`;
}

/** Step copy keys — presentational concern; the Container keeps the tab map. */
const STEP_COPY: Record<DemoStep, { title: keyof Translations; hint: keyof Translations }> = {
  datos: { title: 'demo.steps.1.title', hint: 'demo.steps.1.hint' },
  perfil: { title: 'demo.steps.2.title', hint: 'demo.steps.2.hint' },
  escaneo: { title: 'demo.steps.3.title', hint: 'demo.steps.3.hint' },
  recomendacion: { title: 'demo.steps.4.title', hint: 'demo.steps.4.hint' },
  sustitucion: { title: 'demo.steps.5.title', hint: 'demo.steps.5.hint' },
  validaciones: { title: 'demo.steps.6.title', hint: 'demo.steps.6.hint' },
};

function ConfirmResetPrompt({
  onConfirmSeed,
  onExit,
  dragHandleProps,
  isDragging,
}: Pick<DemoGuideViewProps, 'onConfirmSeed' | 'onExit'> & DraggableSection) {
  const t = useT();
  return (
    <section className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4 sm:p-6 space-y-4">
      <header {...dragHandleProps} className={handleClassName(isDragging)}>
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-400">
          {t['demo.title']}
        </h2>
      </header>
      <p className="text-stone-600 dark:text-zinc-300 text-sm">{t['demo.confirmReset']}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirmSeed}
          className="flex-1 min-h-[44px] bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.confirm']}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex-1 min-h-[44px] bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 py-2 rounded-lg text-sm font-medium hover:bg-stone-300 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.cancel']}
        </button>
      </div>
    </section>
  );
}

interface StepContentProps
  extends
    Pick<DemoGuideViewProps, 'checks' | 'onNext' | 'onBack' | 'onReplay' | 'onExit'>,
    DraggableSection {
  step: DemoStep;
}

function StepContent({
  step,
  checks,
  onNext,
  onBack,
  onReplay,
  onExit,
  dragHandleProps,
  isDragging,
}: StepContentProps) {
  const t = useT();
  const isFirst = DEMO_STEP_ORDER.indexOf(step) === 0;
  return (
    <section className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4 sm:p-6 space-y-4">
      <header {...dragHandleProps} className={handleClassName(isDragging)}>
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-400">
          {t[STEP_COPY[step].title]}
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">{t[STEP_COPY[step].hint]}</p>
      </header>
      <ul className="space-y-2">
        {checks
          .filter((c: DemoCheckResult) => c.step === step)
          .map((c, i) => (
            <li
              key={`${c.step}-${i}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                c.passed
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
              }`}
            >
              {`${t['demo.expected']}: ${c.expected} · ${t['demo.actual']}: ${c.actual} · ${c.passed ? t['demo.pass'] : t['demo.fail']}`}
            </li>
          ))}
      </ul>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={isFirst}
          onClick={onBack}
          className="flex-1 min-h-[44px] min-w-[44px] bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-stone-300 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.back']}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 min-h-[44px] min-w-[44px] bg-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.next']}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="flex-1 min-h-[44px] min-w-[44px] bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 py-2 px-3 rounded-lg text-sm font-medium hover:bg-stone-300 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.replay']}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex-1 min-h-[44px] min-w-[44px] bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 py-2 px-3 rounded-lg text-sm font-medium hover:bg-stone-300 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.exit']}
        </button>
      </div>
    </section>
  );
}

function CompletedSummary({
  completedChecks,
  onReplay,
  onExit,
  dragHandleProps,
  isDragging,
}: Pick<DemoGuideViewProps, 'completedChecks' | 'onReplay' | 'onExit'> & DraggableSection) {
  const t = useT();
  return (
    <section className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4 sm:p-6 space-y-4">
      <header {...dragHandleProps} className={handleClassName(isDragging)}>
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-400">
          {t['demo.title']}
        </h2>
      </header>
      <ul className="space-y-2">
        {DEMO_STEP_ORDER.map((step) => (
          <li
            key={step}
            className={`rounded-lg px-3 py-2 text-sm ${
              completedChecks[step]
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
            }`}
          >{`${t[STEP_COPY[step].title]}: ${completedChecks[step] ? t['demo.pass'] : t['demo.fail']}`}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="flex-1 min-h-[44px] bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.replay']}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex-1 min-h-[44px] bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 py-2 rounded-lg text-sm font-medium hover:bg-stone-300 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
        >
          {t['demo.exit']}
        </button>
      </div>
    </section>
  );
}

/**
 * Pure presentational tour UI — props only, `useT()` strings only,
 * zero store imports (container/presentational).
 */
export function DemoGuideView(props: DemoGuideViewProps) {
  const { currentStep, completed, confirmReset } = props;
  const t = useT();
  const { panelStyle, isDragging, dragHandleProps } = useDraggablePanel();
  let content: ReactNode;
  if (confirmReset)
    content = (
      <ConfirmResetPrompt
        onConfirmSeed={props.onConfirmSeed}
        onExit={props.onExit}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      />
    );
  else if (completed || currentStep === null) {
    if (completed)
      content = (
        <CompletedSummary
          completedChecks={props.completedChecks}
          onReplay={props.onReplay}
          onExit={props.onExit}
          dragHandleProps={dragHandleProps}
          isDragging={isDragging}
        />
      );
    else
      content = (
        <section className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4 sm:p-6">
          <header {...dragHandleProps} className={handleClassName(isDragging)}>
            <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {t['demo.title']}
            </h2>
          </header>
        </section>
      );
  } else
    content = (
      <StepContent
        step={currentStep}
        checks={props.checks}
        onNext={props.onNext}
        onBack={props.onBack}
        onReplay={props.onReplay}
        onExit={props.onExit}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      />
    );
  return (
    <div
      style={panelStyle}
      className="w-[calc(100%-2rem)] sm:w-full sm:max-w-lg mx-auto my-4 sm:my-8 max-h-[85dvh] overflow-y-auto rounded-2xl"
    >
      {content}
    </div>
  );
}
