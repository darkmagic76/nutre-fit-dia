import { useNudgeStore } from '@infrastructure/stores';
import type { SystemNotification } from '@domain/notification';

/**
 * Feature-local access hook for the nudge-engine store.
 *
 * Encapsulates the infrastructure store so the container depends on this
 * feature-owned hook instead of importing `@infrastructure/stores` directly
 * (ADR-014 slice 1 — Clean Architecture dependency rule + Scope Rule).
 */
export interface NudgeEngineState {
  pending: SystemNotification[];
  history: SystemNotification[];
  dismiss: (id: string) => void;
}

export function useNudgeEngineState(): NudgeEngineState {
  const pending = useNudgeStore((s) => s.pending);
  const history = useNudgeStore((s) => s.history);
  const dismiss = useNudgeStore((s) => s.dismiss);

  return { pending, history, dismiss };
}
