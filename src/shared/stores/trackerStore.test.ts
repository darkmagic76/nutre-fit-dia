import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTrackerStore } from '@shared/stores';
import { ValidationError } from '@shared/errors';
import * as utils from '@shared/utils';
import { resetBiomarkerHistory } from '@shared/services/biomarkerTrackingService';

describe('trackerStore', () => {
  beforeEach(() => {
    resetBiomarkerHistory();
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
      expect(state.profileError).toBeInstanceOf(ValidationError);
      expect(state.profileError!.code).toBe('VALIDATION_ERROR');
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
      expect(state.profileError).toBeInstanceOf(ValidationError);
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

    it('handles non-ValidationError from parseNumeric gracefully', () => {
      vi.spyOn(utils, 'parseNumeric').mockImplementationOnce(() => {
        throw new Error('runtime error');
      });
      useTrackerStore.getState().setWeight('80');
      useTrackerStore.getState().setHeight('170');
      useTrackerStore.getState().setGlucose('100');
      useTrackerStore.getState().calculateTarget();
      const state = useTrackerStore.getState();
      expect(state.profileError).toBeInstanceOf(ValidationError);
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
      expect(state.profileError).toBeInstanceOf(ValidationError);
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
  });
});
