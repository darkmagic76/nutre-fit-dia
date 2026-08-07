import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTarget } from './calculateTarget';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';

// ─── In-memory fake BiomarkerRepository ────────────────────────────────────

interface FakeBiomarkerRepo extends BiomarkerRepository {
  _glucoseReadings: Array<{
    value: number;
    timestamp: number;
    context: 'fasting' | 'postprandial';
  }>;
  _weightReadings: Array<{ weight: number; height: number }>;
  thresholdCrossing: 'crossed_above' | 'crossed_below' | null;
}

function makeFakeBiomarkerRepo(
  thresholdCrossing: 'crossed_above' | 'crossed_below' | null = null,
): FakeBiomarkerRepo {
  return {
    _glucoseReadings: [],
    _weightReadings: [],
    thresholdCrossing,
    getGlucoseHistory() {
      return this._glucoseReadings;
    },
    getWeightHistory() {
      return this._weightReadings.map((r) => ({
        value: r.weight,
        timestamp: Date.now(),
        imc: 0,
      }));
    },
    getTrend() {
      return {
        glucoseAvg7d: null,
        glucoseLatest: null,
        weightAvg7d: null,
        weightLatest: null,
        weightTrend: null,
      };
    },
    recordGlucose(input) {
      this._glucoseReadings.push(input);
    },
    recordWeight(weight, height) {
      this._weightReadings.push({ weight, height });
      return { value: weight, timestamp: Date.now(), imc: 0 };
    },
    detectIMCThresholdCrossing() {
      return this.thresholdCrossing;
    },
  };
}

// ─── Helper ────────────────────────────────────────────────────────────────

interface ProfileInput {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: string;
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}

function defaultInput(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    weight: '80',
    height: '170',
    age: '55',
    diagnosisAge: '55',
    gender: 'male',
    paf: '1.2',
    glucose: '100',
    glucoseContext: 'fasting',
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('calculateTarget (use case)', () => {
  let repo: FakeBiomarkerRepo;

  beforeEach(() => {
    repo = makeFakeBiomarkerRepo();
  });

  // ── Happy path ─────────────────────────────────────────────────────────

  it('returns CaloricTargetOutput for valid male input with IMC > 25', () => {
    const result = calculateTarget(defaultInput(), repo);

    expect(result.caloricTarget).not.toBeNull();
    expect(result.caloricTarget!.bmr).toBeGreaterThan(0);
    expect(result.caloricTarget!.tdee).toBeGreaterThan(0);
    expect(result.caloricTarget!.target).toBeGreaterThanOrEqual(1200);
    // IMC = 80/(1.7^2) ≈ 27.7 → restriction active
    expect(result.caloricRestrictionActive).toBe(true);
    expect(result.profileError).toBeNull();
  });

  it('records glucose via the biomarker repository', () => {
    calculateTarget(defaultInput({ glucose: '110' }), repo);

    expect(repo._glucoseReadings).toHaveLength(1);
    expect(repo._glucoseReadings[0].value).toBe(110);
    expect(repo._glucoseReadings[0].context).toBe('fasting');
    expect(repo._glucoseReadings[0].timestamp).toBeGreaterThan(0);
  });

  it('records weight and height via the biomarker repository', () => {
    calculateTarget(defaultInput({ weight: '85', height: '175' }), repo);

    expect(repo._weightReadings).toHaveLength(1);
    expect(repo._weightReadings[0].weight).toBe(85);
    expect(repo._weightReadings[0].height).toBe(175);
  });

  it('returns IMC threshold crossing error code when crossing detected', () => {
    const crossingRepo = makeFakeBiomarkerRepo('crossed_above');
    const result = calculateTarget(defaultInput(), crossingRepo);

    expect(result.profileError).not.toBeNull();
    expect(result.profileError!.code).toBe('IMC_THRESHOLD_CROSSED');
    expect(result.profileError!.context).toHaveProperty('direction', 'crossed_above');
  });

  // ── Edge cases ─────────────────────────────────────────────────────────

  it('returns profileError when weight is invalid (non-numeric)', () => {
    const result = calculateTarget(defaultInput({ weight: 'abc' }), repo);

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.code).toBe('INVALID_NUMERIC_INPUT');
  });

  it('returns profileError with GLUCOSE_REQUIRED code when glucose is empty', () => {
    const result = calculateTarget(defaultInput({ glucose: '' }), repo);

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.code).toBe('GLUCOSE_REQUIRED');
  });

  it('returns profileError with GLUCOSE_MUST_BE_POSITIVE code when glucose is NaN', () => {
    const result = calculateTarget(defaultInput({ glucose: 'abc' }), repo);

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.code).toBe('GLUCOSE_MUST_BE_POSITIVE');
  });

  it('returns profileError with DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE code when diagnosisAge exceeds current age', () => {
    const result = calculateTarget(defaultInput({ age: '40', diagnosisAge: '45' }), repo);

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.code).toBe('DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE');
    expect(result.profileError!.context).toEqual({ diagnosisAge: 45, currentAge: 40 });
  });

  it('accepts diagnosisAge equal to current age', () => {
    const result = calculateTarget(defaultInput({ age: '50', diagnosisAge: '50' }), repo);

    expect(result.caloricTarget).not.toBeNull();
    expect(result.profileError).toBeNull();
  });

  it('does not activate restriction when IMC <= 25', () => {
    const result = calculateTarget(defaultInput({ weight: '65', height: '170' }), repo);

    expect(result.caloricRestrictionActive).toBe(false);
    expect(result.caloricTarget!.deficit).toBe(0);
  });

  // ── Triangulation: different inputs/different paths ────────────────────

  it('handles female profile correctly', () => {
    const result = calculateTarget(defaultInput({ gender: 'female' }), repo);

    expect(result.caloricTarget).not.toBeNull();
    // Female BMR differs from male (MSJ formula with different offset)
    expect(result.caloricTarget!.bmr).toBeGreaterThan(0);
  });

  it('returns ValidationError with INVALID_NUMERIC_INPUT code for non-numeric weight', () => {
    const result = calculateTarget(defaultInput({ weight: 'abc' }), repo);

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.code).toBe('INVALID_NUMERIC_INPUT');
    expect(result.profileError!.context).toEqual({ value: 'abc', max: 300, min: 30 });
  });

  it('handles extremes: very high weight', () => {
    const result = calculateTarget(
      defaultInput({ weight: '200', height: '180', glucose: '95' }),
      repo,
    );

    expect(result.caloricTarget).not.toBeNull();
    expect(result.caloricRestrictionActive).toBe(true);
  });

  it('returns null caloricTarget on insufficient fields but does not crash', () => {
    const result = calculateTarget(
      {
        weight: '',
        height: '170',
        age: '55',
        diagnosisAge: '55',
        gender: 'male',
        paf: '1.2',
        glucose: '100',
        glucoseContext: 'fasting',
      },
      repo,
    );

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
  });

  // ── Architecture constraints ────────────────────────────────────────────

  it('is testable with in-memory fake (zero Zustand, zero jsdom, zero Translations)', () => {
    // This test exists to prove the architecture contract.
    // The fake repo has no Zustand or Web API imports.
    // The use case does NOT receive Translations parameter.
    const result = calculateTarget(defaultInput(), repo);

    expect(result.caloricTarget).not.toBeNull();
    expect(repo._glucoseReadings).toHaveLength(1);
    expect(repo._weightReadings).toHaveLength(1);
  });
});
