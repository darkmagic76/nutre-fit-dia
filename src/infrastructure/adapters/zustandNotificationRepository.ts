import type { StoreApi } from 'zustand';
import type { NotificationRepository } from '@application/ports/notificationRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useNudgeStore, type NudgeState } from '@infrastructure/stores/nudgeStore';

/**
 * Zustand-backed adapter for NotificationRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to the injected store. Defaults to the
 * global persisted store; `createContainer()` injects an ephemeral one.
 * Zero new logic, zero React hooks, zero Zustand import surface beyond types
 * and the default store.
 */
export function createZustandNotificationRepository(
  store: StoreApi<NudgeState> = useNudgeStore,
): NotificationRepository & StateExporter {
  return {
    getPending: () => store.getState().pending,
    getHistory: () => store.getState().history,
    enqueue: (n) => store.getState().enqueue(n),
    acknowledge: (id) => store.getState().acknowledge(id),
    dismiss: (id) => store.getState().dismiss(id),
    getCooldowns: () => store.getState().cooldowns,
    registerCooldown: (id, timestamp) => store.getState().registerCooldown(id, timestamp),
    resetCooldown: (id) => store.getState().resetCooldown(id),
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
