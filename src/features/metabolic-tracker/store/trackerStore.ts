import { create } from 'zustand'
import { z } from 'zod'
import { ValidationError } from '@shared/errors'
import { computeIMC, parseNumeric } from '@shared/utils'
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
  profileError: ValidationError | null

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
  profileError: null,

  setWeight: v => set({ weight: v }),
  setHeight: v => set({ height: v }),
  setAge: v => set({ age: v }),

  setGender: v => {
    try {
      const parsed = genderSchema.parse(v)
      set({ gender: parsed, profileError: null })
    } catch (e) {
      set({
        profileError: new ValidationError(
          `Género no válido: ${(e as Error).message}`,
          { value: v },
        ),
      })
    }
  },

  setPaf: v => set({ paf: v }),
  setRestrictionActive: v => set({ restrictionActive: v }),

  calculateTarget: () => {
    const { weight, height, age, gender, paf } = get()

    let w: number, h: number, a: number, p: number
    try {
      w = parseNumeric(weight, 300, 30)
      h = parseNumeric(height, 250, 100)
      a = parseNumeric(age, 120, 18)
      p = parseNumeric(paf, 2.5, 1.0)
    } catch (e) {
      set({
        profileError:
          e instanceof ValidationError
            ? e
            : new ValidationError(`Error al procesar: ${(e as Error).message}`),
      })
      return
    }

    const imc = computeIMC(w, h)
    const target = computeCaloricTarget({
      weight: w,
      height: h,
      age: a,
      gender,
      physicalActivityFactor: p,
      imc,
    })
    set({ caloricTarget: target, restrictionActive: target.restrictionActive, profileError: null })
  },
}))
