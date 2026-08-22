import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import { ValidationError } from '@domain/errors';
import { calculateTarget as calculateTargetUseCase } from '@application/use-cases/calculateTarget';
import { CaloricTargetOutputSchema } from '@domain/caloricTargetService';
import type { Translations } from '@shared/i18n/types';
import { es as DEFAULT_TRANSLATIONS } from '@shared/i18n/es';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { CaloricTargetOutput } from '../../domain/caloricTargetService';

const genderSchema = z.enum(['male', 'female']);

const DEFAULT_WEIGHT = '80';
const DEFAULT_HEIGHT = '170';
const DEFAULT_AGE = '55';
const DEFAULT_DIAGNOSIS_AGE = '55';
const DEFAULT_PAF = '1.2';

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
  calculateTarget: (biomarkerRepo: BiomarkerRepository) => void;
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

      calculateTarget: (biomarkerRepo) => {
        const { weight, height, age, diagnosisAge, gender, paf, glucose, glucoseContext } = get();

        const result = calculateTargetUseCase(
          { weight, height, age, diagnosisAge, gender, paf, glucose, glucoseContext },
          biomarkerRepo,
        );

        set({
          caloricTarget: result.caloricTarget,
          caloricRestrictionActive: result.caloricRestrictionActive,
          profileError: result.profileError,
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
            caloricTarget: CaloricTargetOutputSchema.nullable(),
            caloricRestrictionActive: z.boolean(),
            // profileError is a serialized ValidationError (class instance). After
            // rehydration it is a plain object — we validate its SHAPE, not
            // reconstruct the class instance (instanceof is lost across the JSON
            // round-trip). calculateTarget() always produces a fresh ValidationError
            // at runtime; the persisted value is only used for structural integrity.
            // Extension point: add a .transform() here if instance reconstruction
            // is ever needed (ADR-014 slice 2).
            profileError: z
              .object({
                name: z.string(),
                message: z.string(),
                code: z.string(),
                context: z.unknown().optional(),
              })
              .nullable(),
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
