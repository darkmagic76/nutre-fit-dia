import type { WeeklyPlan } from '@features/recipe-engine/services/planGenerator';

/** PlanRepository — application port for meal plan access. */
export interface PlanRepository {
  /** Get the current weekly plan, or null if none generated. */
  getPlan(): WeeklyPlan | null;

  /** Generate a new weekly plan based on current tracker state. */
  generatePlan(): void;
}
