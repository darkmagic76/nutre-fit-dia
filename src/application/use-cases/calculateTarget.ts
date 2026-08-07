import type { CaloricTargetOutput } from '@domain/caloricTargetService';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import { ValidationError } from '@domain/errors';
import { parseNumeric } from '@domain/inputParsing';
import { computeIMC } from '@domain/imc';
import { validateProfile } from '@domain/profileService';
import { computeCaloricTarget } from '@domain/caloricTargetService';
import type { GlucoseInput } from '@domain/glucoseInput';
import { GlucoseInput as coerceGlucoseInput } from '@domain/glucoseInput';

// ─── Constants (extracted from trackerStore) ───────────────────────────────

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

// ─── Types ─────────────────────────────────────────────────────────────────

/** Input shape for the calculateTarget use case — raw form fields. */
export interface ProfileInput {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: 'male' | 'female';
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}

export interface CalculateTargetResult {
  caloricTarget: CaloricTargetOutput | null;
  caloricRestrictionActive: boolean;
  profileError: ValidationError | null;
}

// ─── Use Case ──────────────────────────────────────────────────────────────

export function calculateTarget(
  input: ProfileInput,
  biomarkerRepo: BiomarkerRepository,
): CalculateTargetResult {
  const { weight, height, age, diagnosisAge, gender, paf, glucose, glucoseContext } = input;

  // 1. Parse numeric fields
  let w: number, h: number, a: number, p: number, da: number;
  try {
    w = parseNumeric(weight, WEIGHT_MAX, WEIGHT_MIN);
    h = parseNumeric(height, HEIGHT_MAX, HEIGHT_MIN);
    a = parseNumeric(age, AGE_MAX, AGE_MIN);
    p = parseNumeric(paf, PAF_MAX, PAF_MIN);
    da = parseNumeric(diagnosisAge, DIAGNOSIS_AGE_MAX, DIAGNOSIS_AGE_MIN);
  } catch (e) {
    return {
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError:
        e instanceof ValidationError
          ? e
          : new ValidationError('INVALID_NUMERIC_INPUT', { error: (e as Error).message }),
    };
  }

  // 2. Glucose required
  const glucoseTrimmed = glucose.trim();
  if (glucoseTrimmed === '') {
    return {
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: new ValidationError('GLUCOSE_REQUIRED'),
    };
  }

  const rawGlucose = parseFloat(glucoseTrimmed);
  const g: GlucoseInput = coerceGlucoseInput(rawGlucose);
  if (g <= 0) {
    return {
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: new ValidationError('GLUCOSE_MUST_BE_POSITIVE'),
    };
  }

  // 3. Profile validation
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
    return {
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: new ValidationError('DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE', {
        diagnosisAge: da,
        currentAge: a,
      }),
    };
  }

  // 4. Side effects via port (was: useBiomarkerStore.getState())
  biomarkerRepo.recordGlucose({ value: g, timestamp: Date.now(), context: glucoseContext });

  // 5. Compute
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

  // 6. Record weight + detect threshold crossing
  biomarkerRepo.recordWeight(w, h);
  const crossing = biomarkerRepo.detectIMCThresholdCrossing();

  if (crossing) {
    return {
      caloricTarget: target,
      caloricRestrictionActive: target.caloricRestrictionActive,
      profileError: new ValidationError('IMC_THRESHOLD_CROSSED', {
        direction: crossing,
        prevIMC: 'see history',
      }),
    };
  }

  return {
    caloricTarget: target,
    caloricRestrictionActive: target.caloricRestrictionActive,
    profileError: null,
  };
}
