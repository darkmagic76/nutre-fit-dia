import { create } from 'zustand'
import { z } from 'zod'
import { ValidationError } from '@shared/errors'
import { computeIMC, parseNumeric } from '@shared/utils'
import {
  computeCaloricTarget,
  type CaloricTargetOutput,
} from '../services/caloricTargetService'

const genderSchema = z.enum(['male', 'female'])

const DEFAULT_WEIGHT = '80'
const DEFAULT_HEIGHT = '170'
const DEFAULT_AGE = '55'
const DEFAULT_PAF = '1.2'

const WEIGHT_MIN = 30
const WEIGHT_MAX = 300
const HEIGHT_MIN = 100
const HEIGHT_MAX = 250
const AGE_MIN = 18
const AGE_MAX = 120
const PAF_MIN = 1.0
const PAF_MAX = 2.5

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
  weight: DEFAULT_WEIGHT,
  height: DEFAULT_HEIGHT,
  age: DEFAULT_AGE,
  gender: 'male',
  paf: DEFAULT_PAF,
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
      w = parseNumeric(weight, WEIGHT_MAX, WEIGHT_MIN)
      h = parseNumeric(height, HEIGHT_MAX, HEIGHT_MIN)
      a = parseNumeric(age, AGE_MAX, AGE_MIN)
      p = parseNumeric(paf, PAF_MAX, PAF_MIN)
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
