import { create } from 'zustand'
import type { Food } from '@shared/domain'
import { computeCaloricTarget } from '@features/metabolic-tracker/services/caloricTargetService'
import { generateWeeklyPlan } from '@features/recipe-engine/services/planGenerator'
import { countRations, validateRations } from '@features/med-diet-validator/services/rationValidator'
import type { CaloricTargetOutput } from '@features/metabolic-tracker/services/caloricTargetService'
import type { ValidationResult } from '@features/med-diet-validator/services/rationValidator'
import type { WeeklyPlan } from '@features/recipe-engine/services/planGenerator'

/** Sanitize numeric input: strip non-numeric chars, cap to reasonable range */
function sanitizeNumeric(value: string, max: number, min = 0): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  if (Number.isNaN(num)) return min
  return Math.max(min, Math.min(num, max))
}

interface AppState {
  // Metabolic profile
  weight: string
  height: string
  age: string
  gender: 'male' | 'female'
  paf: string
  caloricTarget: CaloricTargetOutput | null

  // Today's food log
  todayLog: Food[]
  todayValidation: ValidationResult | null

  // Weekly plan
  restrictionActive: boolean
  weeklyPlan: WeeklyPlan | null

  // Actions
  setWeight: (v: string) => void
  setHeight: (v: string) => void
  setAge: (v: string) => void
  setGender: (v: 'male' | 'female') => void
  setPaf: (v: string) => void
  calculateTarget: () => void
  addFoodToLog: (food: Food) => void
  removeFoodFromLog: (index: number) => void
  validateToday: () => void
  setRestrictionActive: (v: boolean) => void
  generatePlan: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  weight: '80',
  height: '170',
  age: '55',
  gender: 'male',
  paf: '1.2',
  caloricTarget: null,
  todayLog: [],
  todayValidation: null,
  restrictionActive: false,
  weeklyPlan: null,

  setWeight: v => set({ weight: v }),
  setHeight: v => set({ height: v }),
  setAge: v => set({ age: v }),
  setGender: v => set({ gender: v }),
  setPaf: v => set({ paf: v }),

  calculateTarget: () => {
    const { weight, height, age, gender, paf } = get()
    const w = sanitizeNumeric(weight, 300, 30)
    const h = sanitizeNumeric(height, 250, 100)
    const a = sanitizeNumeric(age, 120, 18)
    const p = sanitizeNumeric(paf, 2.5, 1.0)
    if (!w || !h) return
    const imc = Math.round((w / ((h / 100) ** 2)) * 10) / 10
    const target = computeCaloricTarget({
      weight: w,
      height: h,
      age: a || 55,
      gender,
      physicalActivityFactor: p || 1.2,
      imc,
    })
    set({ caloricTarget: target, restrictionActive: target.restrictionActive })
  },

  addFoodToLog: food => {
    const { todayLog, restrictionActive } = get()
    const log = [...todayLog, food]
    const counts = countRations(log)
    const validation = validateRations(counts, restrictionActive)
    set({ todayLog: log, todayValidation: validation })
  },

  removeFoodFromLog: index => {
    const { todayLog, restrictionActive } = get()
    const log = todayLog.filter((_, i) => i !== index)
    const counts = countRations(log)
    const validation = validateRations(counts, restrictionActive)
    set({ todayLog: log, todayValidation: validation })
  },

  validateToday: () => {
    const { todayLog, restrictionActive } = get()
    const counts = countRations(todayLog)
    set({ todayValidation: validateRations(counts, restrictionActive) })
  },

  setRestrictionActive: v => set({ restrictionActive: v }),

  generatePlan: () => {
    const { restrictionActive } = get()
    set({ weeklyPlan: generateWeeklyPlan(restrictionActive) })
  },
}))
