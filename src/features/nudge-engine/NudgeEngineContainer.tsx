import { useEffect, useRef } from 'react';
import { useT } from '@shared/i18n';
import { Card } from '@shared/ui';
import { useNudgeTrigger } from '@infrastructure/hooks/useNudgeTrigger';
import { useNudgeStore } from '@infrastructure/stores';
import { NudgeEngineView } from './NudgeEngineView';

export function NudgeEngineContainer() {
  const pending = useNudgeStore((s) => s.pending);
  const history = useNudgeStore((s) => s.history);
  const dismiss = useNudgeStore((s) => s.dismiss);
  const t = useT();
  const trigger = useNudgeTrigger();
  const triggerRef = useRef(trigger);

  useEffect(() => {
    triggerRef.current = trigger;
  }, [trigger]);

  useEffect(() => {
    triggerRef.current();
  }, []);

  return (
    <Card title={t['nudges.title']} description={t['nudges.description']}>
      <NudgeEngineView pending={pending} history={history} onDismiss={dismiss} translate={t} />
    </Card>
  );
}
