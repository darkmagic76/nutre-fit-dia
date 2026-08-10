import type { Food } from '@domain/index';

/** LogRepository — application port for daily food log access. */
export interface LogRepository {
  /** Get today's food log. */
  getTodayLog(): Food[];

  /** Add a food to today's log. */
  addFood(food: Food, caloricRestrictionActive: boolean): void;

  /** Remove a food from today's log by index. */
  removeFood(index: number, caloricRestrictionActive: boolean): void;

  /** Clear today's log. */
  clearLog(): void;
}
