import { useEffect, useRef } from 'react';
import { useT } from '@shared/i18n';
import { useNudgeTrigger } from '@infrastructure/hooks/useNudgeTrigger';
import { useNudgeEngineState } from './hooks/useNudgeEngineState';
import { NudgeEngineView } from './NudgeEngineView';

export function NudgeEngineContainer() {
  const { pending, history, dismiss } = useNudgeEngineState();
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
    <NudgeEngineView
      pending={pending}
      history={history}
      onDismiss={dismiss}
      translate={t}
      title={t['nudges.title']}
      description={t['nudges.description']}
    />
  );
}
