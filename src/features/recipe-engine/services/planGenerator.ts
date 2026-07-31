// Backward-compat barrel — planGenerator is now a shared service (2+ consumers)
export {
  generateWeeklyPlan,
  enforceAOVE,
  getWeeklyCounts,
  MealType,
} from '@shared/services/planGenerator';
export type { MealEntry, DailyMeal, WeeklyPlan } from '@shared/services/planGenerator';
