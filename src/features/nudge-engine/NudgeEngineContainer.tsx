import { useEffect } from 'react';
import { useT } from '@shared/i18n';
import { Card } from '@shared/ui';
import { useNudgeTrigger } from '@shared/hooks/useNudgeTrigger';
import { useNudgeStore } from '@shared/stores';
import { NudgeEngineView } from './NudgeEngineView';

export function NudgeEngineContainer() {
  const pending = useNudgeStore((s) => s.pending);
  const history = useNudgeStore((s) => s.history);
  const dismiss = useNudgeStore((s) => s.dismiss);
  const t = useT();
  const trigger = useNudgeTrigger();

  // Evaluate nudges on mount so initial conditions (water, glucose, weight, activity) are checked
  useEffect(() => {
    trigger();
  }, []);

  return (
    <Card title={t['nudges.title']} description={t['nudges.description']}>
      <NudgeEngineView pending={pending} history={history} onDismiss={dismiss} translate={t} />
    </Card>
  );
}
