import { create } from 'zustand'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import {
  generateWeeklyPlan,
  type WeeklyPlan,
} from '../services/planGenerator'

interface PlanState {
  weeklyPlan: WeeklyPlan | null

  generatePlan: () => void
}

export const usePlanStore = create<PlanState>(set => ({
  weeklyPlan: null,

  generatePlan: () => {
    const { restrictionActive } = useTrackerStore.getState()
    set({ weeklyPlan: generateWeeklyPlan(restrictionActive) })
  },
}))
