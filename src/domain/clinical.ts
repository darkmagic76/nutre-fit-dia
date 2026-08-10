/**
 * Clinical constants shared across features.
 *
 * These thresholds are sourced from AESAN 2022, PREDIMED-Plus,
 * and WHO guidelines. Do not modify without a clinical source citation.
 */

/** Cereal max rations per day under caloric restriction (AESAN 2022 / INFORME_ADR FR-2.1) */
export const CEREAL_RESTRICTED_MAX = 4;

// ─── Nutritional thresholds ───

/** Cereal minimum rations before deficit nudge triggers (AESAN 2022 / INFORME_ADR FR-2) */
export const CEREAL_MIN_RATIONS = 3;

/** Minimum vegetable rations before nudge triggers (PREDIMED-Plus) */
export const VEGETABLE_MIN_RATIONS = 3;

/** Afternoon hour after which vegetable deficit nudge fires — 2PM allows time to correct (Clinical protocol) */
export const VEGETABLE_NUDGE_HOUR_THRESHOLD = 14;

/** Fruit minimum rations before deficit nudge triggers (SPECS_RF §5) */
export const FRUIT_MIN_RATIONS = 2;

/** Minimum water rations before hydration nudge fires (WHO hydration guidelines) */
export const WATER_MIN_RATIONS = 4;

// ─── Behavioral thresholds ───

/** Animal protein rations above this triggers dairy/calcium nudge (PREDIMED-Plus protein guidelines) */
export const ANIMAL_PROTEIN_NUDGE_THRESHOLD = 2;

/** Glucose mg/dL threshold for hyperglycemia nudge (ADA glycemic targets) */
export const HYPERGLYCEMIA_THRESHOLD_MG_DL = 180;

/** Day-of-week threshold (Thu=4) after which legumes check activates (PREDIMED-Plus) */
export const LEGUMES_CHECK_DAY_THRESHOLD = 4;

/** Minimum legumes count for weekly check (PREDIMED-Plus legume guidance) */
export const LEGUMES_MIN_WEEKLY_CHECK = 1;

/** Fish rations above this triggers white meat restriction nudge (AESAN 2022) */
export const FISH_EXCESS_THRESHOLD = 7;

/** WHO minimum weekly activity minutes (WHO physical activity) */
export const WEEKLY_ACTIVITY_MINUTES_TARGET = 150;

// ─── Sustainability thresholds ───

/** Max substitution alternatives to include in nudge body (UX constraint) */
export const MAX_ALTERNATIVES_TO_SHOW = 3;

/** Environmental score below this triggers sustainable substitution nudge (Carbon footprint threshold) */
export const LOW_ENVIRONMENTAL_SCORE_THRESHOLD = 30;

// ─── Nuts thresholds (AESAN 2022: frutos secos) ───

/** Minimum nuts count per week (AESAN 2022: ≥3 raciones/semana de frutos secos) */
export const NUTS_MIN_WEEKLY = 3;

/** Maximum nuts per day (AESAN 2022: máx 1 ración diaria de frutos secos) */
export const NUTS_MAX_DAILY = 1;
