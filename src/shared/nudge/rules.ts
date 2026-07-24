import { NotificationType, NotificationSeverity, FoodCategory } from '@shared/domain';
import { CEREAL_RESTRICTED_MAX } from '@shared/constants/clinical';
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

// ─── Threshold constants ───

/** Cereal minimum rations before deficit nudge triggers */
const CEREAL_MIN_RATIONS = 3;
/** Minimum vegetable rations before nudge triggers */
const VEGETABLE_MIN_RATIONS = 3;
/** Afternoon hour after which vegetable deficit nudge fires (2PM — allows time to correct) */
export const VEGETABLE_NUDGE_HOUR_THRESHOLD = 14;
/** Fruit minimum rations before deficit nudge triggers */
const FRUIT_MIN_RATIONS = 2;
/** Animal protein rations above this triggers dairy/calcium nudge */
const ANIMAL_PROTEIN_NUDGE_THRESHOLD = 2;
/** Minimum water rations before hydration nudge fires */
const WATER_MIN_RATIONS = 4;
/** Glucose mg/dL threshold for hyperglycemia nudge */
const HYPERGLYCEMIA_THRESHOLD_MG_DL = 180;
/** Day-of-week threshold (Thu=4) after which legumes check activates */
const LEGUMES_CHECK_DAY_THRESHOLD = 4;
/** Minimum legumes count for weekly check */
const LEGUMES_MIN_WEEKLY_CHECK = 1;
/** Fish rations above this triggers white meat restriction nudge */
const FISH_EXCESS_THRESHOLD = 7;
/** WHO minimum weekly activity minutes */
const WEEKLY_ACTIVITY_MINUTES_TARGET = 150;
/** Max substitution alternatives to include in nudge body */
const MAX_ALTERNATIVES_TO_SHOW = 3;
/** Environmental score below this triggers sustainable substitution nudge */
const LOW_ENVIRONMENTAL_SCORE_THRESHOLD = 30;

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
      ctx.restrictionActive && ctx.counts[FoodCategory.CEREALS] > CEREAL_RESTRICTED_MAX,
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
