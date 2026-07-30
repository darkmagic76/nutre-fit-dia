import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTrackerStore } from './trackerStore';
import { useBiomarkerStore } from './biomarkerStore';
import { z } from 'zod';

const defaults = {
  weight: '80',
  height: '170',
  age: '55',
  diagnosisAge: '55',
  gender: 'male' as const,
  paf: '1.2',
  glucose: '',
  glucoseContext: 'fasting' as const,
  caloricTarget: null,
  restrictionActive: false,
  profileError: null,
};

// --- Zod schema for persisted state (structural integrity only) ---
export const TrackerStateSchema = z.object({
  weight: z.string(),
  height: z.string(),
  age: z.string(),
  diagnosisAge: z.string(),
  gender: z.enum(['male', 'female']),
  paf: z.string(),
  glucose: z.string(),
  glucoseContext: z.enum(['fasting', 'postprandial']),
  caloricTarget: z
    .object({
      bmr: z.number(),
      tdee: z.number(),
      deficit: z.number(),
      target: z.number(),
      restrictionActive: z.boolean(),
    })
    .nullable(),
  restrictionActive: z.boolean(),
  profileError: z.any().nullable(),
});

describe('trackerStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackerStore.setState({ ...defaults });
    useBiomarkerStore.getState().resetBiomarkerHistory();
  });

  it('has default values', () => {
    const state = useTrackerStore.getState();
    expect(state.weight).toBe('80');
    expect(state.height).toBe('170');
    expect(state.age).toBe('55');
    expect(state.diagnosisAge).toBe('55');
    expect(state.glucose).toBe('');
    expect(state.glucoseContext).toBe('fasting');
    expect(state.gender).toBe('male');
    expect(state.paf).toBe('1.2');
    expect(state.caloricTarget).toBeNull();
    expect(state.restrictionActive).toBe(false);
    expect(state.profileError).toBeNull();
  });

  describe('setters', () => {
    it('updates weight', () => {
      useTrackerStore.getState().setWeight('75');
      expect(useTrackerStore.getState().weight).toBe('75');
    });

    it('updates height', () => {
      useTrackerStore.getState().setHeight('180');
      expect(useTrackerStore.getState().height).toBe('180');
    });

    it('updates age', () => {
      useTrackerStore.getState().setAge('45');
      expect(useTrackerStore.getState().age).toBe('45');
    });

    it('updates paf', () => {
      useTrackerStore.getState().setPaf('1.725');
      expect(useTrackerStore.getState().paf).toBe('1.725');
    });

    it('updates diagnosisAge', () => {
      useTrackerStore.getState().setDiagnosisAge('45');
      expect(useTrackerStore.getState().diagnosisAge).toBe('45');
    });

    it('updates glucose', () => {
      useTrackerStore.getState().setGlucose('120');
      expect(useTrackerStore.getState().glucose).toBe('120');
    });

    it('updates glucoseContext', () => {
      useTrackerStore.getState().setGlucoseContext('postprandial');
      expect(useTrackerStore.getState().glucoseContext).toBe('postprandial');
    });

    it('accepts valid gender', () => {
      useTrackerStore.getState().setGender('female');
      expect(useTrackerStore.getState().gender).toBe('female');
      expect(useTrackerStore.getState().profileError).toBeNull();
    });

    it('sets profileError on invalid gender', () => {
      useTrackerStore.getState().setGender('other');
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
      expect(state.profileError!.message).toContain('Género');
    });

    it('toggles restrictionActive', () => {
      useTrackerStore.getState().setRestrictionActive(true);
      expect(useTrackerStore.getState().restrictionActive).toBe(true);
      useTrackerStore.getState().setRestrictionActive(false);
      expect(useTrackerStore.getState().restrictionActive).toBe(false);
    });
  });

  describe('calculateTarget', () => {
    const setDefaults = () => {
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
    };

    it('calculates caloric target with default values', () => {
      setDefaults();
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.caloricTarget).not.toBeNull();
      expect(state.caloricTarget!.bmr).toBeGreaterThan(0);
      expect(state.caloricTarget!.tdee).toBeGreaterThan(0);
      expect(state.profileError).toBeNull();
    });

    it('sets profileError when weight is invalid', () => {
      useTrackerStore.getState().setWeight('abc');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
    });

    it('clears profileError on successful recalculate', () => {
      useTrackerStore.getState().setWeight('abc');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      expect(useTrackerStore.getState().profileError).not.toBeNull();

      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().calculateTarget();
      expect(useTrackerStore.getState().profileError).toBeNull();
    });

    it('activates restrictionActive when IMC > 25', () => {
      useTrackerStore.getState().setWeight('95');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      expect(useTrackerStore.getState().restrictionActive).toBe(true);
      expect(useTrackerStore.getState().caloricTarget!.deficit).toBeGreaterThan(0);
    });

    it('does not activate restrictionActive when IMC <= 25', () => {
      useTrackerStore.getState().setWeight('65');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      expect(useTrackerStore.getState().restrictionActive).toBe(false);
      expect(useTrackerStore.getState().caloricTarget!.deficit).toBe(0);
    });

    it('handles non-ValidationError from parseNumeric gracefully', async () => {
      const utils = await import('@shared/utils');
      vi.spyOn(utils, 'parseNumeric').mockImplementationOnce(() => {
        throw new Error('runtime error');
      });
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
      expect(state.profileError!.message).toContain('Error al procesar');
    });

    it('rejects diagnosisAge greater than current age', () => {
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setAge('40');
      useTrackerStore.getState().setDiagnosisAge('45');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
      expect(state.profileError!.message).toContain('edad de diagnóstico');
    });

    it('accepts diagnosisAge equal to current age', () => {
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setAge('50');
      useTrackerStore.getState().setDiagnosisAge('50');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.caloricTarget).not.toBeNull();
      expect(state.profileError).toBeNull();
    });

    it('sets profileError when glucose is empty (FR-5.1)', () => {
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
      expect(state.profileError!.message).toContain('glucosa es obligatoria');
    });

    it('sets profileError when glucose is NaN or non-positive (FR-5.1)', () => {
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('abc');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(Error);
      expect(state.profileError!.message).toContain('valor positivo');
    });
  });

  // --- PERSIST TESTS ---
  describe('persist', () => {
    const STORAGE_KEY = 'nutrefitdia-tracker';

    /** Await async persist flush (mock encryption is still async — needs microtask tick) */
    async function waitForPersist() {
      // The persist middleware writes via async setItem — flush microtask queue
      await new Promise((r) => setTimeout(r, 0));
    }

    function readStoredState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('No stored data');
      return JSON.parse(raw).state as Record<string, unknown>;
    }

    it('writes state to localStorage on change', async () => {
      // Change state away from defaults to trigger persist write
      useTrackerStore.setState({ weight: '82', gender: 'female' as const });

      await waitForPersist();
      const state = readStoredState();
      expect(state).toBeDefined();
      expect(Object.keys(state).length).toBeGreaterThan(0);
    });

    it('encrypts sensitive fields in localStorage', async () => {
      // Change weight to trigger persist write
      useTrackerStore.setState({ weight: '81' });

      await waitForPersist();
      const state = readStoredState();

      // weight SHOULD be encrypted (has __encrypted marker)
      expect(state.weight).toBeDefined();
      expect(typeof state.weight).toBe('object');
      expect((state.weight as Record<string, unknown>).__encrypted).toBe(true);

      // gender SHOULD be plaintext (not sensitive)
      expect(state.gender).toBe('male');
    });

    it('encrypts all listed sensitive fields', async () => {
      // Change multiple sensitive fields
      useTrackerStore.setState({ height: '180', age: '45', diagnosisAge: '50', glucose: '110' });

      await waitForPersist();
      const state = readStoredState();

      expect((state.height as Record<string, unknown>).__encrypted).toBe(true);
      expect((state.age as Record<string, unknown>).__encrypted).toBe(true);
      expect((state.diagnosisAge as Record<string, unknown>).__encrypted).toBe(true);
      expect((state.glucose as Record<string, unknown>).__encrypted).toBe(true);
    });

    it('excludes functions from serialized state', async () => {
      // Change weight to trigger persist
      useTrackerStore.setState({ weight: '75' });

      await waitForPersist();
      const state = readStoredState();

      const functionKeys = Object.keys(state).filter((k) => typeof state[k] === 'function');
      expect(functionKeys).toEqual([]);
    });

    it('uses defaults on fresh start with empty localStorage', () => {
      const state = useTrackerStore.getState();
      expect(state.weight).toBe('80');
      expect(state.height).toBe('170');
      expect(state.age).toBe('55');
      expect(state.gender).toBe('male');
      expect(state.paf).toBe('1.2');
    });
  });
});

describe('TrackerStateSchema', () => {
  it('accepts valid default state', () => {
    const result = TrackerStateSchema.safeParse({ ...defaults });
    expect(result.success).toBe(true);
  });

  it('accepts null caloricTarget', () => {
    const result = TrackerStateSchema.safeParse({
      ...defaults,
      caloricTarget: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing weight field', () => {
    const { weight: _, ...rest } = defaults;
    const result = TrackerStateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender value', () => {
    const result = TrackerStateSchema.safeParse({
      ...defaults,
      gender: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects number weight (should be string)', () => {
    const result = TrackerStateSchema.safeParse({
      ...defaults,
      weight: 80,
    });
    expect(result.success).toBe(false);
  });
});

describe('onRehydrateStorage', () => {
  it('resets to defaults when stored data fails schema validation', async () => {
    const STORAGE_KEY = 'nutrefitdia-tracker';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { weight: 'bad' }, version: 0 }));
    vi.resetModules();
    const mod = await import('./trackerStore');
    const state = mod.useTrackerStore.getState();
    expect(state.weight).toBe('80');
    expect(state.height).toBe('170');
    expect(state.gender).toBe('male');
  });
});
