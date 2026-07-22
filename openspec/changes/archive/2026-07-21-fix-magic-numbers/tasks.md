# Tasks: Extract Magic Numbers to Named Constants

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80-100 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

## Phase 1: rationValidator

- [x] 1.1 Add `CEREAL_RESTRICTED_MAX = 4` const; replace `effectiveMax = 4` literal

## Phase 2: planGenerator

- [x] 2.1 Add `DAYS_IN_WEEK = 7`, `CEREAL_NON_DINNER_RATIONS = 3`, `BASE_MEAL_COUNT = 3`; replace 3 literals

## Phase 3: rules

- [x] 3.1 Add `CEREAL_RESTRICTED_MAX`, `VEGETABLE_MIN_RATIONS`, `VEGETABLE_NUDGE_HOUR_THRESHOLD`; replace 3 literals
- [x] 3.2 Add `ANIMAL_PROTEIN_NUDGE_THRESHOLD`, `WATER_MIN_RATIONS`, `HYPERGLYCEMIA_THRESHOLD_MG_DL`; replace 3 literals
- [x] 3.3 Add `LEGUMES_CHECK_DAY_THRESHOLD`, `LEGUMES_MIN_WEEKLY_CHECK`, `FISH_EXCESS_THRESHOLD`; replace 3 literals
- [x] 3.4 Add `WEEKLY_ACTIVITY_MINUTES_TARGET`, `MAX_ALTERNATIVES_TO_SHOW`, `LOW_ENVIRONMENTAL_SCORE_THRESHOLD`; replace 3 literals

## Phase 4: Verify

- [x] 4.1 `pnpm test:run` — all 510 pass
- [x] 4.2 `pnpm typecheck` — clean
