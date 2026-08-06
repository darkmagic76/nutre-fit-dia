import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import { ValidationError } from '@shared/errors';
import { parseNumeric } from '@shared/utils';
import { computeIMC } from '../../domain/imc';
import { validateProfile } from '../../domain/profileService';
import { computeCaloricTarget, type CaloricTargetOutput } from '../../domain/caloricTargetService';
import { useBiomarkerStore } from './biomarkerStore';
import type { Translations } from '@shared/i18n/types';
import { es as DEFAULT_TRANSLATIONS } from '@shared/i18n/es';
import { type GlucoseInput, GlucoseInput as coerceGlucoseInput } from '../../domain/glucoseInput';

const genderSchema = z.enum(['male', 'female']);

const DEFAULT_WEIGHT = '80';
const DEFAULT_HEIGHT = '170';
const DEFAULT_AGE = '55';
const DEFAULT_DIAGNOSIS_AGE = '55';
const DEFAULT_PAF = '1.2';

const WEIGHT_MIN = 30;
const WEIGHT_MAX = 300;
const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;
const AGE_MIN = 18;
const AGE_MAX = 120;
const PAF_MIN = 1.0;
const PAF_MAX = 2.5;

const DIAGNOSIS_AGE_MIN = 0;
const DIAGNOSIS_AGE_MAX = 120;

interface TrackerState {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: 'male' | 'female';
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
  caloricTarget: CaloricTargetOutput | null;
  caloricRestrictionActive: boolean;
  profileError: ValidationError | null;

  setWeight: (v: string) => void;
  setHeight: (v: string) => void;
  setAge: (v: string) => void;
  setDiagnosisAge: (v: string) => void;
  setGender: (v: string, translate?: Translations) => void;
  setPaf: (v: string) => void;
  setGlucose: (v: string) => void;
  setGlucoseContext: (v: 'fasting' | 'postprandial') => void;
  setRestrictionActive: (v: boolean) => void;
  calculateTarget: (translate?: Translations) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      weight: DEFAULT_WEIGHT,
      height: DEFAULT_HEIGHT,
      age: DEFAULT_AGE,
      diagnosisAge: DEFAULT_DIAGNOSIS_AGE,
      gender: 'male',
      paf: DEFAULT_PAF,
      glucose: '',
      glucoseContext: 'fasting',
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: null,

      setWeight: (v) => set({ weight: v }),
      setHeight: (v) => set({ height: v }),
      setAge: (v) => set({ age: v }),
      setDiagnosisAge: (v) => set({ diagnosisAge: v }),

      setGender: (v, translate) => {
        const t = translate ?? DEFAULT_TRANSLATIONS;
        try {
          const parsed = genderSchema.parse(v);
          set({ gender: parsed, profileError: null });
        } catch (e) {
          set({
            profileError: new ValidationError(
              t['errors.invalidGender'].replace('{gender}', (e as Error).message),
              { value: v },
            ),
          });
        }
      },

      setPaf: (v) => set({ paf: v }),
      setGlucose: (v) => set({ glucose: v }),
      setGlucoseContext: (v) => set({ glucoseContext: v }),
      setRestrictionActive: (v) => set({ caloricRestrictionActive: v }),

      calculateTarget: (translate) => {
        const t = translate ?? DEFAULT_TRANSLATIONS;
        const { weight, height, age, diagnosisAge, gender, paf, glucose, glucoseContext } = get();

        let w: number, h: number, a: number, p: number, da: number;
        try {
          w = parseNumeric(weight, WEIGHT_MAX, WEIGHT_MIN);
          h = parseNumeric(height, HEIGHT_MAX, HEIGHT_MIN);
          a = parseNumeric(age, AGE_MAX, AGE_MIN);
          p = parseNumeric(paf, PAF_MAX, PAF_MIN);
          da = parseNumeric(diagnosisAge, DIAGNOSIS_AGE_MAX, DIAGNOSIS_AGE_MIN);
        } catch (e) {
          set({
            profileError:
              e instanceof ValidationError
                ? e
                : new ValidationError(
                    t['errors.processingError'].replace('{message}', (e as Error).message),
                  ),
          });
          return;
        }

        // FR-5.1: glucose is required for metabolic profile calculation
        const glucoseTrimmed = glucose.trim();
        if (glucoseTrimmed === '') {
          set({
            profileError: new ValidationError(t['errors.glucoseRequiredForMetabolicProfile']),
          });
          return;
        }

        const rawGlucose = parseFloat(glucoseTrimmed);
        const g: GlucoseInput = coerceGlucoseInput(rawGlucose);
        if (g <= 0) {
          set({
            profileError: new ValidationError(t['errors.glucoseMustBePositive']),
          });
          return;
        }

        // Delegate domain validation to profileService (pure function)
        const validation = validateProfile({
          weight: w,
          height: h,
          age: a,
          diagnosisAge: da,
          gender,
          glucose: g,
          physicalActivityFactor: p,
        });

        if (validation.errors.some((e) => e.field === 'diagnosisAge')) {
          set({
            profileError: new ValidationError(t['errors.diagnosisAgeExceedsCurrentAge'], {
              diagnosisAge: da,
              currentAge: a,
            }),
          });
          return;
        }

        useBiomarkerStore
          .getState()
          .recordGlucose({ value: g, timestamp: Date.now(), context: glucoseContext });

        const imc = computeIMC(w, h);
        const target = computeCaloricTarget({
          weight: w,
          height: h,
          age: a,
          gender,
          physicalActivityFactor: p,
          imc,
          diagnosisAge: da,
        });

        // FR-5.1: record weight reading for biomarker trends
        useBiomarkerStore.getState().recordWeight(w, h);
        const crossing = useBiomarkerStore.getState().detectIMCThresholdCrossing();
        const crossedMessage =
          crossing === 'crossed_above'
            ? t['errors.imcThresholdCrossedUp']
            : crossing === 'crossed_below'
              ? t['errors.imcThresholdCrossedDown']
              : null;

        set({
          caloricTarget: target,
          caloricRestrictionActive: target.caloricRestrictionActive,
          profileError: crossedMessage
            ? new ValidationError(crossedMessage, { crossing, prevIMC: 'see history' })
            : null,
        });
      },
    }),
    {
      ...createPersistConfig('tracker', {
        sensitiveFields: ['weight', 'height', 'age', 'diagnosisAge', 'glucose'],
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state) {
          const TrackerStateSchema = z.object({
            weight: z.string(),
            height: z.string(),
            age: z.string(),
            diagnosisAge: z.string(),
            gender: z.enum(['male', 'female']),
            paf: z.string(),
            glucose: z.string(),
            glucoseContext: z.enum(['fasting', 'postprandial']),
            caloricTarget: z.any().nullable(),
            caloricRestrictionActive: z.boolean(),
            profileError: z.any().nullable(),
          });
          const parsed = TrackerStateSchema.safeParse(state);
          if (!parsed.success) {
            useTrackerStore.setState({
              weight: DEFAULT_WEIGHT,
              height: DEFAULT_HEIGHT,
              age: DEFAULT_AGE,
              diagnosisAge: DEFAULT_DIAGNOSIS_AGE,
              gender: 'male',
              paf: DEFAULT_PAF,
              glucose: '',
              glucoseContext: 'fasting',
              caloricTarget: null,
              caloricRestrictionActive: false,
              profileError: null,
            });
          }
        }
      },
    },
  ),
);
