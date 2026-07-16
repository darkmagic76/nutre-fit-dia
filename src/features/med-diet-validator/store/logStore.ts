import { create } from 'zustand'
import type { Food } from '@shared/domain'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import {
  countRations,
  validateRations,
  type ValidationResult,
} from '@shared/services/rationValidator'

interface LogState {
  todayLog: Food[]
  todayValidation: ValidationResult | null

  addFoodToLog: (food: Food) => void
  removeFoodFromLog: (index: number) => void
  validateToday: () => void
}

export const useLogStore = create<LogState>((set, get) => ({
  todayLog: [],
  todayValidation: null,

  addFoodToLog: food => {
    const { todayLog } = get()
    const log = [...todayLog, food]
    const { restrictionActive } = useTrackerStore.getState()
    const counts = countRations(log)
    const validation = validateRations(counts, restrictionActive)
    set({ todayLog: log, todayValidation: validation })
  },

  removeFoodFromLog: index => {
    const { todayLog } = get()
    const log = todayLog.filter((_, i) => i !== index)
    const { restrictionActive } = useTrackerStore.getState()
    const counts = countRations(log)
    const validation = validateRations(counts, restrictionActive)
    set({ todayLog: log, todayValidation: validation })
  },

  validateToday: () => {
    const { todayLog } = get()
    const { restrictionActive } = useTrackerStore.getState()
    const counts = countRations(todayLog)
    set({ todayValidation: validateRations(counts, restrictionActive) })
  },
}))
