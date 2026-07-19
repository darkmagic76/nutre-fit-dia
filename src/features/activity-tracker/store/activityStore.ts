import { create } from 'zustand'
import type { ActivityEntry } from '../types'
import { DEFAULT_WEEKLY_GOAL } from '../types'

interface ActivityState {
  weeklyMinutes: number
  strengthSessions: number
  entries: ActivityEntry[]

  addEntry: (entry: ActivityEntry) => void
  resetWeek: () => void
}

export const useActivityStore = create<ActivityState>(set => ({
  weeklyMinutes: 0,
  strengthSessions: 0,
  entries: [],

  addEntry: entry =>
    set(state => ({
      entries: [...state.entries, entry],
      weeklyMinutes: state.weeklyMinutes + entry.moderateMinutes,
      strengthSessions: state.strengthSessions + entry.strengthSessions,
    })),

  resetWeek: () =>
    set({
      weeklyMinutes: 0,
      strengthSessions: 0,
      entries: [],
    }),
}))

export { DEFAULT_WEEKLY_GOAL }
