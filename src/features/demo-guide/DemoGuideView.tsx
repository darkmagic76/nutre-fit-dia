import { DEMO_STEP_ORDER, type DemoCheckResult, type DemoGuideViewProps } from './types';
import type { DemoStep } from './types';
import { useT } from '@shared/i18n';
import type { Translations } from '@shared/i18n/types';

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
}: Pick<DemoGuideViewProps, 'onConfirmSeed' | 'onExit'>) {
  const t = useT();
  return (
    <section>
      <h2>{t['demo.title']}</h2>
      <p>{t['demo.confirmReset']}</p>
      <button type="button" onClick={onConfirmSeed}>
        {t['demo.confirm']}
      </button>
      <button type="button" onClick={onExit}>
        {t['demo.cancel']}
      </button>
    </section>
  );
}

interface StepContentProps extends Pick<
  DemoGuideViewProps,
  'checks' | 'onNext' | 'onBack' | 'onReplay' | 'onExit'
> {
  step: DemoStep;
}

function StepContent({ step, checks, onNext, onBack, onReplay, onExit }: StepContentProps) {
  const t = useT();
  const isFirst = DEMO_STEP_ORDER.indexOf(step) === 0;
  return (
    <section>
      <h2>{t[STEP_COPY[step].title]}</h2>
      <p>{t[STEP_COPY[step].hint]}</p>
      <ul>
        {checks
          .filter((c: DemoCheckResult) => c.step === step)
          .map((c, i) => (
            <li key={`${c.step}-${i}`}>
              {`${t['demo.expected']}: ${c.expected} · ${t['demo.actual']}: ${c.actual} · ${c.passed ? t['demo.pass'] : t['demo.fail']}`}
            </li>
          ))}
      </ul>
      <button type="button" disabled={isFirst} onClick={onBack}>
        {t['demo.back']}
      </button>
      <button type="button" onClick={onNext}>
        {t['demo.next']}
      </button>
      <button type="button" onClick={onReplay}>
        {t['demo.replay']}
      </button>
      <button type="button" onClick={onExit}>
        {t['demo.exit']}
      </button>
    </section>
  );
}

function CompletedSummary({
  completedChecks,
  onReplay,
  onExit,
}: Pick<DemoGuideViewProps, 'completedChecks' | 'onReplay' | 'onExit'>) {
  const t = useT();
  return (
    <section>
      <h2>{t['demo.title']}</h2>
      <ul>
        {DEMO_STEP_ORDER.map((step) => (
          <li
            key={step}
          >{`${t[STEP_COPY[step].title]}: ${completedChecks[step] ? t['demo.pass'] : t['demo.fail']}`}</li>
        ))}
      </ul>
      <button type="button" onClick={onReplay}>
        {t['demo.replay']}
      </button>
      <button type="button" onClick={onExit}>
        {t['demo.exit']}
      </button>
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
  if (confirmReset)
    return <ConfirmResetPrompt onConfirmSeed={props.onConfirmSeed} onExit={props.onExit} />;
  if (completed || currentStep === null) {
    if (completed)
      return (
        <CompletedSummary
          completedChecks={props.completedChecks}
          onReplay={props.onReplay}
          onExit={props.onExit}
        />
      );
    return (
      <section>
        <h2>{t['demo.title']}</h2>
      </section>
    );
  }
  return (
    <StepContent
      step={currentStep}
      checks={props.checks}
      onNext={props.onNext}
      onBack={props.onBack}
      onReplay={props.onReplay}
      onExit={props.onExit}
    />
  );
}
