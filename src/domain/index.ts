export { FoodCategory, FoodCategorySchema, ANIMAL_PROTEIN_CATEGORIES } from './foodCategory';
export type { FoodCategory as FoodCategoryType } from './foodCategory';
export { TrafficLightColor, TrafficLightColorSchema } from './trafficLight';
export type { TrafficLightColor as TrafficLightColorType } from './trafficLight';
export { FoodSchema, food, CulturalMetadataSchema } from './food';
export type { Food, CulturalMetadata } from './food';
export { NotificationType, NotificationSeverity } from './notification';
export type {
  NotificationType as NotificationTypeType,
  NotificationSeverity as NotificationSeverityType,
  SystemNotification,
} from './notification';
export type { UserMetrics, UserProfile } from './metrics';
export { UserProfileSchema } from './metrics';
export { HIGH_GLYCEMIC_FRUIT_NAMES } from './glycemicFruits';
export type { ActivityEntry, WeeklyGoal } from './activity';
export { DEFAULT_WEEKLY_GOAL } from './activity';
export { GlucoseInput } from './glucoseInput';
export type { GlucoseInput as GlucoseInputType } from './glucoseInput';
export { defineEnum } from './enum';
export type { ValuesOf } from './enum';

// Clinical constants
export {
  CEREAL_RESTRICTED_MAX,
  CEREAL_MIN_RATIONS,
  VEGETABLE_MIN_RATIONS,
  VEGETABLE_NUDGE_HOUR_THRESHOLD,
  FRUIT_MIN_RATIONS,
  ANIMAL_PROTEIN_NUDGE_THRESHOLD,
  WATER_MIN_RATIONS,
  HYPERGLYCEMIA_THRESHOLD_MG_DL,
  LEGUMES_CHECK_DAY_THRESHOLD,
  LEGUMES_MIN_WEEKLY_CHECK,
  FISH_EXCESS_THRESHOLD,
  WEEKLY_ACTIVITY_MINUTES_TARGET,
  MAX_ALTERNATIVES_TO_SHOW,
  LOW_ENVIRONMENTAL_SCORE_THRESHOLD,
} from './clinical';

// IMC utilities
export {
  computeIMC,
  isRestrictionCandidate,
  IMC_UNDERWEIGHT,
  IMC_NORMAL_MAX,
  IMC_OVERWEIGHT,
} from './imc';

// Plan types
export { MealType } from './plan';
export type {
  MealType as MealTypeType,
  MealSlot,
  MealEntry,
  DailyMeal,
  WeeklyPlan,
  TemplateSlot,
  WeekPlanContext,
} from './plan';

// Services
export { computeCaloricTarget, getDiagnosisModifier } from './caloricTargetService';
export type { CaloricTargetInput, CaloricTargetOutput } from './caloricTargetService';
export { validateProfile } from './profileService';
export { countRations, validateRations, defaultRationCounts } from './rationValidator';
export type {
  CountByCategory,
  RationValidationResult,
  RationViolation,
  SafetyAlert,
} from './rationValidator';
export type { BiomarkerTrend, GlucoseReading, WeightReading } from './biomarkerTypes';

// Nudge domain
export { CooldownTracker } from './cooldownTracker';
export type { CooldownOps } from './cooldownTracker';
export {
  COOLDOWN_24H,
  COOLDOWN_12H,
  COOLDOWN_6H,
  COOLDOWN_4H,
  COOLDOWN_3H,
  COOLDOWN_7D,
  COOLDOWN_NONE,
} from './cooldownDurations';
