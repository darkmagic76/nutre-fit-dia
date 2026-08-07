import type { Food } from './food';
import type { FoodCategory } from './foodCategory';
import type { RationValidationResult } from './rationValidator';

export const MealType = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
} as const;

export type MealType = (typeof MealType)[keyof typeof MealType];

export interface MealSlot {
  meal: MealType;
  rations: number;
}

/** Simplified meal plan entry. */
export interface MealEntry {
  food: Food;
  rations: number;
  mealType?: MealType;
}

export interface DailyMeal {
  day: number; // 1..7
  entries: MealEntry[];
}

export interface WeeklyPlan {
  days: DailyMeal[];
  dailyResults: RationValidationResult[];
  weeklyResult: RationValidationResult;
  valid: boolean;
}

export interface TemplateSlot {
  category: FoodCategory;
  mealSlots: MealSlot[];
}

export interface WeekPlanContext {
  dailyTemplate: TemplateSlot[];
  weeklySlots: {
    day: number;
    category: FoodCategory;
    rations: number;
    mealType: MealType;
  }[];
}
