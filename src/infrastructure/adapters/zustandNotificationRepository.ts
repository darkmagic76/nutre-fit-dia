import type { NotificationRepository } from '@application/ports/notificationRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';

/**
 * Zustand-backed adapter for NotificationRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to `useNudgeStore.getState()`.
 * Zero new logic, zero React hooks, zero Zustand import surface
 * beyond the store module.
 */
export function createZustandNotificationRepository(): NotificationRepository & StateExporter {
  return {
    getPending: () => useNudgeStore.getState().pending,
    getHistory: () => useNudgeStore.getState().history,
    enqueue: (n) => useNudgeStore.getState().enqueue(n),
    acknowledge: (id) => useNudgeStore.getState().acknowledge(id),
    dismiss: (id) => useNudgeStore.getState().dismiss(id),
    getCooldowns: () => useNudgeStore.getState().cooldowns,
    registerCooldown: (id, timestamp) => useNudgeStore.getState().registerCooldown(id, timestamp),
    resetCooldown: (id) => useNudgeStore.getState().resetCooldown(id),
    getState: () => useNudgeStore.getState() as unknown as Record<string, unknown>,
  };
}
