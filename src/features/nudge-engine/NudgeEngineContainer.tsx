import { useT } from '@shared/i18n';
import { Card } from '@shared/ui';
import { useNudgeStore } from './store';
import { NudgePanelView } from './NudgePanelView';

export function NudgeEngineContainer() {
  const pending = useNudgeStore((s) => s.pending);
  const history = useNudgeStore((s) => s.history);
  const dismiss = useNudgeStore((s) => s.dismiss);
  const t = useT();

  return (
    <Card title={t['nudges.title']} description={t['nudges.description']}>
      <NudgePanelView pending={pending} history={history} onDismiss={dismiss} />
    </Card>
  );
}
