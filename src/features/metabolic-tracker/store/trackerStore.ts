import { create } from 'zustand'
import { z } from 'zod'
import { computeIMC, sanitizeNumeric } from '@shared/utils'
import {
  computeCaloricTarget,
  type CaloricTargetOutput,
} from '../services/caloricTargetService'

const genderSchema = z.enum(['male', 'female'])

interface TrackerState {
  weight: string
  height: string
  age: string
  gender: 'male' | 'female'
  paf: string
  caloricTarget: CaloricTargetOutput | null
  restrictionActive: boolean

  setWeight: (v: string) => void
  setHeight: (v: string) => void
  setAge: (v: string) => void
  setGender: (v: string) => void
  setPaf: (v: string) => void
  setRestrictionActive: (v: boolean) => void
  calculateTarget: () => void
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  weight: '80',
  height: '170',
  age: '55',
  gender: 'male',
  paf: '1.2',
  caloricTarget: null,
  restrictionActive: false,

  setWeight: v => set({ weight: v }),
  setHeight: v => set({ height: v }),
  setAge: v => set({ age: v }),
  setGender: v => {
    const parsed = genderSchema.safeParse(v)
    if (parsed.success) set({ gender: parsed.data })
  },
  setPaf: v => set({ paf: v }),
  setRestrictionActive: v => set({ restrictionActive: v }),

  calculateTarget: () => {
    const { weight, height, age, gender, paf } = get()
    const w = sanitizeNumeric(weight, 300, 30)
    const h = sanitizeNumeric(height, 250, 100)
    const a = sanitizeNumeric(age, 120, 18)
    const p = sanitizeNumeric(paf, 2.5, 1.0)
    if (!w || !h) return
    const imc = computeIMC(w, h)
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
}))
