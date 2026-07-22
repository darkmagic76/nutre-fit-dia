import { FoodCategory } from '@shared/domain';
import type { Food } from '@shared/domain';
import type { CaloricTargetOutput } from '@shared/services/caloricTargetService';
import type { UserMetricsFormState } from '@shared/domain/metrics';
import type { ValidationResult, RationViolation } from '@shared/services/rationValidator';

// ---------------------------------------------------------------------------
// Food fixtures
// ---------------------------------------------------------------------------

export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'test-food',
    name: 'Test Food',
    category: FoodCategory.VEGETABLES,
    gramsPerRation: 100,
    kcalPer100g: 100,
    proteinPer100g: 5,
    carbsPer100g: 10,
    fiberPer100g: 2,
    fatPer100g: 2,
    saturatedFatPer100g: 0.5,
    addedSugarsPer100g: 0,
    harmfulIngredients: [],
    hasTransFats: false,
    isProcessed: false,
    isSeasonal: false,
    ...overrides,
  };
}

export function makeEntries(category: FoodCategory, times = 1): Food[] {
  return Array.from({ length: times }, (_, i) =>
    makeFood({
      id: `test-${category}-${i}`,
      name: `Test ${category}`,
      category,
    }),
  );
}

// ---------------------------------------------------------------------------
// Caloric target fixture
// ---------------------------------------------------------------------------

/** Mifflin-St Jeor defaults: female, 70kg, 165cm, 45yo, sedentary → BMR ~1400, TDEE ~1680 */
export function makeCaloricTargetOutput(
  overrides: Partial<CaloricTargetOutput> = {},
): CaloricTargetOutput {
  return {
    bmr: 1400,
    tdee: 1680,
    deficit: 600,
    target: 1680,
    restrictionActive: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Metrics form state fixture
// ---------------------------------------------------------------------------

const noop = () => {};

export function makeMetricsFormState(
  overrides: Partial<UserMetricsFormState> = {},
): UserMetricsFormState {
  return {
    weight: '70',
    height: '165',
    age: '45',
    gender: 'female',
    paf: '1.2',
    diagnosisAge: '',
    glucose: '',
    glucoseContext: 'fasting',
    setWeight: noop,
    setHeight: noop,
    setAge: noop,
    setGender: noop,
    setPaf: noop,
    setDiagnosisAge: noop,
    setGlucose: noop,
    setGlucoseContext: noop,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Validation result fixture
// ---------------------------------------------------------------------------

export function makeViolation(overrides: Partial<RationViolation> = {}): RationViolation {
  return {
    category: FoodCategory.CEREALS as unknown as RationViolation['category'],
    current: 5,
    limit: 4,
    direction: 'over',
    unit: 'day',
    message: 'Test violation',
    ...overrides,
  };
}

export function makeValidationResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    valid: true,
    violations: [],
    animalProteinCount: 0,
    ...overrides,
  };
}
