import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import type { SystemNotification } from '@shared/domain';

interface NudgeState {
  pending: SystemNotification[];
  history: SystemNotification[];
  cooldowns: Record<string, number>;

  enqueue: (notification: SystemNotification) => void;
  acknowledge: (id: string) => void;
  dismiss: (id: string) => void;
  clearPending: () => void;
  registerCooldown: (id: string) => void;
  resetCooldown: (id?: string) => void;
}

// Zod schema for persisted state (structural integrity only — not business rules)
const NudgeStateSchema = z.object({
  pending: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      severity: z.string(),
      target: z.string(),
      title: z.string(),
      body: z.string(),
      ruleSource: z.string(),
      triggeredAt: z.union([z.string(), z.date()]),
      acknowledgedAt: z.union([z.string(), z.date()]).optional(),
      dismissedAt: z.union([z.string(), z.date()]).optional(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      severity: z.string(),
      target: z.string(),
      title: z.string(),
      body: z.string(),
      ruleSource: z.string(),
      triggeredAt: z.union([z.string(), z.date()]),
      acknowledgedAt: z.union([z.string(), z.date()]).optional(),
      dismissedAt: z.union([z.string(), z.date()]).optional(),
    }),
  ),
  cooldowns: z.record(z.string(), z.number()),
});

export const useNudgeStore = create<NudgeState>()(
  persist(
    (set) => ({
      pending: [],
      history: [],
      cooldowns: {},

      enqueue: (notification) =>
        set((state) => ({
          pending: [...state.pending, notification],
        })),

      acknowledge: (id) =>
        set((state) => ({
          pending: state.pending.filter((n) => n.id !== id),
          history: [
            ...state.history,
            ...state.pending
              .filter((n) => n.id === id)
              .map((n) => ({ ...n, acknowledgedAt: new Date() })),
          ],
        })),

      dismiss: (id) =>
        set((state) => ({
          pending: state.pending.filter((n) => n.id !== id),
          history: [
            ...state.history,
            ...state.pending
              .filter((n) => n.id === id)
              .map((n) => ({ ...n, dismissedAt: new Date() })),
          ],
        })),

      clearPending: () => set({ pending: [] }),

      registerCooldown: (id) =>
        set((state) => ({
          cooldowns: { ...state.cooldowns, [id]: Date.now() },
        })),

      resetCooldown: (id) =>
        set((state) => {
          if (!id) return { cooldowns: {} };
          const { [id]: _, ...rest } = state.cooldowns;
          return { cooldowns: rest };
        }),
    }),
    {
      ...createPersistConfig('nudge'),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state) {
          const parsed = NudgeStateSchema.safeParse(state);
          if (!parsed.success) {
            useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
          }
        }
      },
    },
  ),
);
