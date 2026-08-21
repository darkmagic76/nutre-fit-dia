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

/** Afternoon hour after which vegetable deficit nudge fires — 2PM allows time to correct (Internal design decision — no clinical source) */
export const VEGETABLE_NUDGE_HOUR_THRESHOLD = 14;

/** Fruit minimum rations before deficit nudge triggers (SPECS_RF §5) */
export const FRUIT_MIN_RATIONS = 2;

/** Minimum water rations before hydration nudge fires (Internal design decision — no clinical source) */
export const WATER_MIN_RATIONS = 4;

// ─── Behavioral thresholds ───

/** Animal protein rations above this triggers dairy/calcium nudge (Internal design decision — no clinical source) */
export const ANIMAL_PROTEIN_NUDGE_THRESHOLD = 2;

/** Glucose mg/dL threshold for hyperglycemia nudge (ADA glycemic targets) */
export const HYPERGLYCEMIA_THRESHOLD_MG_DL = 180;

/** Day-of-week threshold (Thu=4) after which legumes check activates (Internal design decision — day-of-week index, not clinical value) */
export const LEGUMES_CHECK_DAY_THRESHOLD = 4;

/** Minimum legumes count for weekly check (Internal design decision — AESAN requires ≥4/week, this is a nudge trigger) */
export const LEGUMES_MIN_WEEKLY_CHECK = 1;

/** Fish rations above this triggers white meat restriction nudge (Internal design decision — AESAN 2022 specifies ≥3/week with no maximum) */
export const FISH_EXCESS_THRESHOLD = 7;

/** WHO minimum weekly activity minutes (WHO physical activity) */
export const WEEKLY_ACTIVITY_MINUTES_TARGET = 150;

// ─── Sustainability thresholds ───

/** Max substitution alternatives to include in nudge body (UX constraint) */
export const MAX_ALTERNATIVES_TO_SHOW = 3;

/** Environmental score below this triggers sustainable substitution nudge (Internal design decision — no clinical source) */
export const LOW_ENVIRONMENTAL_SCORE_THRESHOLD = 30;

// ─── Nuts thresholds (AESAN 2022: frutos secos) ───

/** Minimum nuts count per week (AESAN 2022: ≥3 raciones/semana de frutos secos) */
export const NUTS_MIN_WEEKLY = 3;

/** Maximum nuts per day (AESAN 2022: máx 1 ración diaria de frutos secos) */
export const NUTS_MAX_DAILY = 1;
