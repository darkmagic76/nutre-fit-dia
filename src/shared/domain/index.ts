export {
  FoodCategory,
  FoodCategorySchema,
  ANIMAL_PROTEIN_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
} from './foodCategory';
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
export type {
  UserMetrics,
  UserMetricsFormData,
  UserMetricsFormSetters,
  UserMetricsFormState,
  UserProfile,
} from './metrics';
export { UserProfileSchema } from './metrics';
export { HIGH_GLYCEMIC_FRUIT_NAMES } from './glycemicFruits';
export type { ActivityEntry, WeeklyGoal } from './activity';
export { DEFAULT_WEEKLY_GOAL } from './activity';
