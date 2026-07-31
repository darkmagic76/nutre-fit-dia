import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import type { ActivityEntry } from '@shared/domain/activity';
import { DEFAULT_WEEKLY_GOAL } from '@shared/domain/activity';

interface ActivityState {
  weeklyMinutes: number;
  strengthSessions: number;
  entries: ActivityEntry[];
  /** Consecutive weeks of 100% compliance */
  streak: number;

  addEntry: (entry: ActivityEntry) => void;
  resetWeek: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

// Zod schema for persisted state (structural integrity only — not business rules)
const ActivityStateSchema = z.object({
  weeklyMinutes: z.number(),
  strengthSessions: z.number(),
  entries: z.array(
    z.object({
      date: z.string(),
      moderateMinutes: z.number(),
      strengthSessions: z.number(),
    }),
  ),
  streak: z.number(),
});

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      weeklyMinutes: 0,
      strengthSessions: 0,
      entries: [],
      streak: 0,

      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, entry],
          weeklyMinutes: state.weeklyMinutes + entry.moderateMinutes,
          strengthSessions: state.strengthSessions + entry.strengthSessions,
        })),

      resetWeek: () =>
        set({
          weeklyMinutes: 0,
          strengthSessions: 0,
          entries: [],
          streak: 0,
        }),

      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
    }),
    {
      ...createPersistConfig('activity', {
        sensitiveFields: ['weeklyMinutes', 'strengthSessions'],
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state) {
          const parsed = ActivityStateSchema.safeParse(state);
          if (!parsed.success) {
            useActivityStore.setState({
              weeklyMinutes: 0,
              strengthSessions: 0,
              entries: [],
              streak: 0,
            });
          }
        }
      },
    },
  ),
);

export { DEFAULT_WEEKLY_GOAL };
