import { useEffect } from 'react';
import { useT } from '@shared/i18n';
import { Card } from '@shared/ui';
import { evaluateAndEnqueue } from '@shared/nudge';
import { useNudgeStore } from '@shared/stores';
import { NudgePanelView } from './NudgePanelView';

export function NudgeEngineContainer() {
  const pending = useNudgeStore((s) => s.pending);
  const history = useNudgeStore((s) => s.history);
  const dismiss = useNudgeStore((s) => s.dismiss);
  const t = useT();

  // Evaluate nudges on mount so initial conditions (water, glucose, weight, activity) are checked
  useEffect(() => {
    evaluateAndEnqueue();
  }, []);

  return (
    <Card title={t['nudges.title']} description={t['nudges.description']}>
      <NudgePanelView pending={pending} history={history} onDismiss={dismiss} />
    </Card>
  );
}
