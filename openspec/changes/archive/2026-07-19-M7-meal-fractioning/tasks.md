# Tasks: M7 — Meal Fractioning (3–6 tomas diarias)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~315 (additions + deletions) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: MealType + Schema (spec REQ-1)

- [x] 1.1 Add `MealType` enum + `MealSlot` interface to `planGenerator.ts`
- [x] 1.2 Add optional `mealType?: MealType` to `MealEntry` with default `BREAKFAST`
- [x] 1.3 Replace `TemplateSlot.rations` with `TemplateSlot.mealSlots: MealSlot[]`
- [x] 1.4 Test: verify MealType values, verify default on entries without mealType

## Phase 2: Distribution Algorithm (spec REQ-2, REQ-4)

- [x] 2.1 Write RED tests: 4-meal standard, restrictionActive, 3-meal, 6-meal, weekly alternation, water
- [x] 2.2 Extend `buildDailyTemplate()` with `mealCount` param and per-category distribution heuristics
- [x] 2.3 Extend `getWeeklySlots()` to assign alternating `mealType` (LUNCH/DINNER) to weekly items
- [x] 2.4 Wire mealSlots expansion in `generateWeeklyPlan()` — produce MealEntry[] with mealType
- [x] 2.5 GREEN: all distribution tests pass

## Phase 3: AOVE Enforcement (spec REQ-3)

- [x] 3.1 Write RED tests: AOVE present (no-op), AOVE missing (auto-add), empty catalog (graceful)
- [x] 3.2 Implement `enforceAOVE()` post-processing in `generateWeeklyPlan()`
- [x] 3.3 GREEN: all AOVE tests pass

## Phase 4: PlanView Meal Structure (spec REQ-6)

- [x] 4.1 Write RED tests: correct meal order, empty group skipped, existing features preserved
- [x] 4.2 Add `MEAL_ORDER` + `MEAL_LABELS` constants to `PlanView.tsx`
- [x] 4.3 Group `day.entries` by `mealType`; render meal headers with food entries per group
- [x] 4.4 Filter empty meal groups (SNACK omitted when mealCount=3)
- [x] 4.5 GREEN: all PlanView structure tests pass

## Phase 5: Kcal Display (spec REQ-5)

- [x] 5.1 Write RED tests: kcal happy path, null caloricTarget, zero target
- [x] 5.2 Implement `computeMealKcal(entries)`: Σ(kcalPer100g × gramsPerRation / 100 × rations)
- [x] 5.3 Read `caloricTarget` from trackerStore; display kcal + % per meal header
- [x] 5.4 Guard null/zero target → display `"—"`
- [x] 5.5 GREEN: all kcal display tests pass

## Phase 6: Final Verification

- [x] 6.1 Run `pnpm test:run` — verify all 353+ existing + new tests green
- [x] 6.2 Run `pnpm quality` — lint + typecheck + test:run + build pass
- [x] 6.3 Verify AOVE ≥1 per B/L/D across all 7 days
- [x] 6.4 Verify PlanView shows meal groups with headers and kcal/% display
