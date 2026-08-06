import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTarget } from './calculateTarget';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { Translations } from '@shared/i18n/types';
import { es as DEFAULT_TRANSLATIONS } from '@shared/i18n/es';

// ─── In-memory fake BiomarkerRepository ────────────────────────────────────

interface FakeBiomarkerRepo extends BiomarkerRepository {
  glucoseReadings: Array<{ value: number; timestamp: number; context: 'fasting' | 'postprandial' }>;
  weightReadings: Array<{ weight: number; height: number }>;
  thresholdCrossing: 'crossed_above' | 'crossed_below' | null;
}

function makeFakeBiomarkerRepo(
  thresholdCrossing: 'crossed_above' | 'crossed_below' | null = null,
): FakeBiomarkerRepo {
  return {
    glucoseReadings: [],
    weightReadings: [],
    thresholdCrossing,
    recordGlucose(input) {
      this.glucoseReadings.push(input);
    },
    recordWeight(weight, height) {
      this.weightReadings.push({ weight, height });
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

function t(): Translations {
  return DEFAULT_TRANSLATIONS;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('calculateTarget (use case)', () => {
  let repo: FakeBiomarkerRepo;

  beforeEach(() => {
    repo = makeFakeBiomarkerRepo();
  });

  // ── Happy path ─────────────────────────────────────────────────────────

  it('returns CaloricTargetOutput for valid male input with IMC > 25', () => {
    const result = calculateTarget(defaultInput(), repo, t());

    expect(result.caloricTarget).not.toBeNull();
    expect(result.caloricTarget!.bmr).toBeGreaterThan(0);
    expect(result.caloricTarget!.tdee).toBeGreaterThan(0);
    expect(result.caloricTarget!.target).toBeGreaterThanOrEqual(1200);
    // IMC = 80/(1.7^2) ≈ 27.7 → restriction active
    expect(result.caloricRestrictionActive).toBe(true);
    expect(result.profileError).toBeNull();
  });

  it('records glucose via the biomarker repository', () => {
    calculateTarget(defaultInput({ glucose: '110' }), repo, t());

    expect(repo.glucoseReadings).toHaveLength(1);
    expect(repo.glucoseReadings[0].value).toBe(110);
    expect(repo.glucoseReadings[0].context).toBe('fasting');
    expect(repo.glucoseReadings[0].timestamp).toBeGreaterThan(0);
  });

  it('records weight and height via the biomarker repository', () => {
    calculateTarget(defaultInput({ weight: '85', height: '175' }), repo, t());

    expect(repo.weightReadings).toHaveLength(1);
    expect(repo.weightReadings[0].weight).toBe(85);
    expect(repo.weightReadings[0].height).toBe(175);
  });

  it('returns IMC threshold crossing message when crossing detected', () => {
    const crossingRepo = makeFakeBiomarkerRepo('crossed_above');
    const result = calculateTarget(defaultInput(), crossingRepo, t());

    expect(result.profileError).not.toBeNull();
    expect(result.profileError!.message).toContain('IMC');
  });

  // ── Edge cases ─────────────────────────────────────────────────────────

  it('returns profileError when weight is invalid (non-numeric)', () => {
    const result = calculateTarget(defaultInput({ weight: 'abc' }), repo, t());

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
  });

  it('returns profileError when glucose is empty', () => {
    const result = calculateTarget(defaultInput({ glucose: '' }), repo, t());

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.message).toContain('glucosa es obligatoria');
  });

  it('returns profileError when glucose is NaN or non-positive', () => {
    const result = calculateTarget(defaultInput({ glucose: 'abc' }), repo, t());

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.message).toContain('valor positivo');
  });

  it('returns profileError when diagnosisAge exceeds current age', () => {
    const result = calculateTarget(defaultInput({ age: '40', diagnosisAge: '45' }), repo, t());

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.message).toContain('edad de diagnóstico');
  });

  it('accepts diagnosisAge equal to current age', () => {
    const result = calculateTarget(defaultInput({ age: '50', diagnosisAge: '50' }), repo, t());

    expect(result.caloricTarget).not.toBeNull();
    expect(result.profileError).toBeNull();
  });

  it('does not activate restriction when IMC <= 25', () => {
    const result = calculateTarget(defaultInput({ weight: '65', height: '170' }), repo, t());

    expect(result.caloricRestrictionActive).toBe(false);
    expect(result.caloricTarget!.deficit).toBe(0);
  });

  // ── Triangulation: different inputs/different paths ────────────────────

  it('handles female profile correctly', () => {
    const result = calculateTarget(defaultInput({ gender: 'female' }), repo, t());

    expect(result.caloricTarget).not.toBeNull();
    // Female BMR differs from male (MSJ formula with different offset)
    expect(result.caloricTarget!.bmr).toBeGreaterThan(0);
  });

  it('passes through ValidationError from parseNumeric directly', () => {
    // parseNumeric throws ValidationError for "abc" — use case returns it directly
    const result = calculateTarget(defaultInput({ weight: 'abc' }), repo, t());

    expect(result.profileError).toBeInstanceOf(Error);
    expect(result.profileError!.message).toContain('Valor numérico');
  });

  it('handles extremes: very high weight', () => {
    const result = calculateTarget(
      defaultInput({ weight: '200', height: '180', glucose: '95' }),
      repo,
      t(),
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
      t(),
    );

    expect(result.caloricTarget).toBeNull();
    expect(result.profileError).toBeInstanceOf(Error);
  });

  // ── Architecture constraints ────────────────────────────────────────────

  it('is testable with in-memory fake (zero Zustand, zero jsdom)', () => {
    // This test exists to prove the architecture contract.
    // The fake repo has no Zustand or Web API imports.
    const result = calculateTarget(defaultInput(), repo, t());

    expect(result.caloricTarget).not.toBeNull();
    expect(repo.glucoseReadings).toHaveLength(1);
    expect(repo.weightReadings).toHaveLength(1);
  });
});
