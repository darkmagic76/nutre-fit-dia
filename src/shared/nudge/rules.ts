import { NotificationType, NotificationSeverity, FoodCategory } from '@shared/domain';
import {
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
} from '@shared/constants/clinical';
import {
  COOLDOWN_24H,
  COOLDOWN_12H,
  COOLDOWN_6H,
  COOLDOWN_4H,
  COOLDOWN_3H,
  COOLDOWN_7D,
  COOLDOWN_NONE,
} from './cooldownDurations';
import type { SafetyRule } from './types';

/** All nudge rules evaluated by the engine. Titles and bodies use i18n keys resolved at display time. */
export const NUDGE_RULES: SafetyRule[] = [
  {
    id: 'CEREALS_RESTRICTION',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.HARD_BLOCK,
    cooldown: COOLDOWN_24H,
    title: 'nudge.title.cerealsRestriction',
    body: 'nudge.body.cerealsRestriction',
    condition: (ctx) =>
      ctx.caloricRestrictionActive && ctx.counts[FoodCategory.CEREALS] > CEREAL_RESTRICTED_MAX,
  },
  {
    id: 'CEREALS_DEFICIT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_6H,
    title: 'nudge.title.cerealsDeficit',
    body: 'nudge.body.cerealsDeficit',
    condition: (ctx) => ctx.counts[FoodCategory.CEREALS] < CEREAL_MIN_RATIONS,
  },
  {
    id: 'FRUITS_GLYCEMIC_ALERT',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.SOFT_WARN,
    cooldown: COOLDOWN_24H,
    title: 'nudge.title.fruitsGlycemicAlert',
    body: 'nudge.body.fruitsGlycemicAlert',
    condition: (ctx) => ctx.containsHighGlycemicFruit,
  },
  {
    id: 'FRUITS_DEFICIT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_6H,
    title: 'nudge.title.fruitsDeficit',
    body: 'nudge.body.fruitsDeficit',
    condition: (ctx) => ctx.counts[FoodCategory.FRUITS] < FRUIT_MIN_RATIONS,
  },
  {
    id: 'VEGETABLES_DEFICIT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_6H,
    title: 'nudge.title.vegetablesDeficit',
    body: 'nudge.body.vegetablesDeficit',
    condition: (ctx) =>
      ctx.counts[FoodCategory.VEGETABLES] < VEGETABLE_MIN_RATIONS &&
      ctx.currentHour >= VEGETABLE_NUDGE_HOUR_THRESHOLD,
  },

  // ─── PR2: BehavioralNudge rules ───

  {
    id: 'DAIRY_CALCIUM_NUDGE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_12H,
    title: 'nudge.title.dairyCalcium',
    body: 'nudge.body.dairyCalcium',
    condition: (ctx) => ctx.animalProteinCount > ANIMAL_PROTEIN_NUDGE_THRESHOLD,
  },
  {
    id: 'WATER_HYDRATION',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_3H,
    title: 'nudge.title.waterHydration',
    body: 'nudge.body.waterHydration',
    condition: (ctx) => ctx.waterRations < WATER_MIN_RATIONS,
  },
  {
    id: 'HYPERGLYCEMIA_NUDGE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_3H,
    title: 'nudge.title.hyperglycemia',
    body: 'nudge.body.hyperglycemia',
    condition: (ctx) =>
      ctx.latestGlucose !== null && ctx.latestGlucose > HYPERGLYCEMIA_THRESHOLD_MG_DL,
  },
  {
    id: 'ADHERENCE_GLUCOSE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'nudge.title.adherenceGlucose',
    body: 'nudge.body.adherenceGlucose',
    condition: (ctx) => {
      if (ctx.lastGlucoseTimestamp === null) return true;
      return ctx.now - ctx.lastGlucoseTimestamp > COOLDOWN_4H * 60 * 1000;
    },
  },
  {
    id: 'ADHERENCE_WEIGHT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'nudge.title.adherenceWeight',
    body: 'nudge.body.adherenceWeight',
    condition: (ctx) => {
      if (ctx.lastWeightTimestamp === null) return true;
      return ctx.now - ctx.lastWeightTimestamp > COOLDOWN_4H * 60 * 1000;
    },
  },

  // ─── PR3: SystemAction rules ───

  {
    id: 'AOVE_TAGGING',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'nudge.title.aoveTagging',
    body: 'nudge.body.aoveTagging',
    condition: (ctx) => ctx.counts[FoodCategory.OLIVE_OIL] === 0,
  },
  {
    id: 'LEGUMES_GLYCEMIC_BASE',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'nudge.title.legumesGlycemicBase',
    body: 'nudge.body.legumesGlycemicBase',
    condition: (ctx) =>
      ctx.dayOfWeek >= LEGUMES_CHECK_DAY_THRESHOLD &&
      ctx.counts[FoodCategory.LEGUMES] < LEGUMES_MIN_WEEKLY_CHECK,
  },
  {
    id: 'FISH_COD_TAG',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_NONE,
    title: 'nudge.title.fishCodTag',
    body: 'nudge.body.fishCodTag',
    condition: (ctx) => ctx.hasBacalao,
  },
  {
    id: 'EGGS_RED_MEAT_ALT',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_NONE,
    title: 'nudge.title.eggsRedMeatAlt',
    body: 'nudge.body.eggsRedMeatAlt',
    condition: (ctx) => ctx.counts[FoodCategory.RED_MEAT] > 0 && !ctx.hasEggs,
  },
  {
    id: 'WHITE_MEAT_RESTRICT',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_7D,
    title: 'nudge.title.whiteMeatRestrict',
    body: 'nudge.body.whiteMeatRestrict',
    condition: (ctx) =>
      ctx.counts[FoodCategory.FISH] > FISH_EXCESS_THRESHOLD &&
      ctx.counts[FoodCategory.WHITE_MEAT] > 0,
  },
  {
    id: 'HC_INACTIVITY_ADJUST',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'nudge.title.hcInactivityAdjust',
    body: 'nudge.body.hcInactivityAdjust',
    condition: (ctx) => ctx.weeklyActivityMinutes < WEEKLY_ACTIVITY_MINUTES_TARGET,
  },

  // ─── M2: smart substitution ───

  {
    id: 'SUSTAINABLE_SUBSTITUTION',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'nudge.title.sustainableSubstitution',
    body: (ctx) => {
      const names = ctx.alternatives?.slice(0, MAX_ALTERNATIVES_TO_SHOW).join(', ') ?? '';
      return `nudge.body.sustainableSubstitution|${names}`;
    },
    condition: (ctx) =>
      ctx.environmentalScore !== null &&
      ctx.environmentalScore < LOW_ENVIRONMENTAL_SCORE_THRESHOLD &&
      ctx.alternatives !== null &&
      ctx.alternatives.length > 0,
  },
];
