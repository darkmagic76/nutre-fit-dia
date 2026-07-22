import { create } from 'zustand';
import type { Food } from '@shared/domain';
import { useTrackerStore } from '@shared/stores/trackerStore';
import {
  countRations,
  validateRations,
  type ValidationResult,
} from '@shared/services/rationValidator';

interface LogState {
  todayLog: Food[];
  todayValidation: ValidationResult | null;

  addFoodToLog: (food: Food) => void;
  removeFoodFromLog: (index: number) => void;
}

function evaluateLog(log: Food[]) {
  const { restrictionActive } = useTrackerStore.getState();
  const counts = countRations(log);
  return validateRations(counts, restrictionActive);
}

export const useLogStore = create<LogState>((set, get) => ({
  todayLog: [],
  todayValidation: null,

  addFoodToLog: (food) => {
    const { todayLog } = get();
    const log = [...todayLog, food];
    set({ todayLog: log, todayValidation: evaluateLog(log) });
  },

  removeFoodFromLog: (index) => {
    const { todayLog } = get();
    const log = todayLog.filter((_, i) => i !== index);
    set({ todayLog: log, todayValidation: evaluateLog(log) });
  },
}));
