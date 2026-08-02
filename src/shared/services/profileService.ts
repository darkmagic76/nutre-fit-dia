import { computeIMC } from '@shared/utils/imc';

/**
 * Input for profile validation — raw numeric values from form or store.
 */
export interface ProfileInput {
  weight: number;
  height: number;
  age: number;
  diagnosisAge: number;
  gender: 'male' | 'female';
  glucose: number;
  physicalActivityFactor: number;
}

/** Structure returned by validateProfile. */
export interface ValidationFieldError {
  field: keyof ProfileInput;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationFieldError[];
}

/**
 * Optional typed profile for building — omits the computed `imc` field.
 * Any unset field gets a sensible default.
 */
export type BuildProfileInput = Partial<Omit<ProfileInput, 'imc'> & { imc?: never }>;

/**
 * Result of buildProfile — a fully-populated profile with computed IMC.
 */
export interface BuiltProfile {
  weight: number;
  height: number;
  age: number;
  diagnosisAge: number;
  gender: 'male' | 'female';
  glucose: number;
  physicalActivityFactor: number;
  imc: number;
}

// Defaults
const DEFAULT_WEIGHT = 80;
const DEFAULT_HEIGHT = 170;
const DEFAULT_AGE = 55;
const DEFAULT_DIAGNOSIS_AGE = 55;
const DEFAULT_GENDER: 'male' | 'female' = 'male';
const DEFAULT_GLUCOSE = 0;
const DEFAULT_PAF = 1.2;

/**
 * Validate raw numeric profile fields against domain business rules.
 *
 * Returns structured errors for each field that violates a rule.
 * Pure function — no side effects, no framework imports.
 */
export function validateProfile(input: ProfileInput): ValidationResult {
  const errors: ValidationFieldError[] = [];

  if (input.weight <= 0) {
    errors.push({ field: 'weight', message: 'Weight must be greater than 0' });
  }

  if (input.height <= 0) {
    errors.push({ field: 'height', message: 'Height must be greater than 0' });
  }

  if (input.age <= 0) {
    errors.push({ field: 'age', message: 'Age must be greater than 0' });
  }

  if (input.diagnosisAge > input.age) {
    errors.push({
      field: 'diagnosisAge',
      message: 'Diagnosis age cannot exceed current age',
    });
  }

  if (input.glucose <= 0) {
    errors.push({
      field: 'glucose',
      message: 'Glucose must be a positive value (mg/dL)',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build a fully-populated metabolic profile from partial input.
 *
 * Any unset fields receive sensible defaults. The IMC is computed
 * from the provided weight and height — or from defaults if unset.
 *
 * Pure function — no side effects, no framework imports.
 */
export function buildProfile(input: BuildProfileInput): BuiltProfile {
  const weight = input.weight ?? DEFAULT_WEIGHT;
  const height = input.height ?? DEFAULT_HEIGHT;

  return {
    weight,
    height,
    age: input.age ?? DEFAULT_AGE,
    diagnosisAge: input.diagnosisAge ?? DEFAULT_DIAGNOSIS_AGE,
    gender: input.gender ?? DEFAULT_GENDER,
    glucose: input.glucose ?? DEFAULT_GLUCOSE,
    physicalActivityFactor: input.physicalActivityFactor ?? DEFAULT_PAF,
    imc: computeIMC(weight, height),
  };
}
