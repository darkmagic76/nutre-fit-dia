import { create } from 'zustand';
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

export const useActivityStore = create<ActivityState>((set) => ({
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
}));

export { DEFAULT_WEEKLY_GOAL };
