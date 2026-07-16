# Tasks: Phase 1 — God Store → Per-Feature Stores

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200-250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Phase 1: Shared Utilities

- [ ] 1.1 Create `src/shared/utils/sanitize.ts` — extract `sanitizeNumeric()` with split-on-`.` decimal fix, add `sanitizeGender()` with Zod parse
- [ ] 1.2 Create `src/shared/utils/imc.ts` — extract `computeIMC(weightKg, heightCm)` pure function
- [ ] 1.3 Modify `src/shared/domain/foodCategory.ts` — add `CATEGORY_DISPLAY_NAMES` `Record<FoodCategory, string>` with all 10 Spanish names

## Phase 2: Feature Stores

- [ ] 2.1 Create `src/features/metabolic-tracker/store/trackerStore.ts` — profile state, sanitize setters, `calculateTarget()` with `computeIMC()` + `computeCaloricTarget()`
- [ ] 2.2 Create `src/features/med-diet-validator/store/logStore.ts` — `todayLog` array, `addFoodToLog()`, `removeFoodFromLog()`, cross-store read via `getState()` to `trackerStore`
- [ ] 2.3 Create `src/features/recipe-engine/store/planStore.ts` — `restrictionActive` boolean, `generatePlan()` calling `generateWeeklyPlan()`
- [ ] 2.4 Create `src/features/nutritional-traffic-light/store/scannerStore.ts` — placeholder with empty `scanHistory` array

## Phase 3: Container Adapters

- [ ] 3.1 Modify `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` — swap `useAppStore()` → `useTrackerStore()`, remove old import
- [ ] 3.2 Modify `src/features/med-diet-validator/DailyLogContainer.tsx` — swap `useAppStore()` → `useLogStore()`, replace local `CATEGORY_NAMES` with import from `@shared/domain`
- [ ] 3.3 Modify `src/features/recipe-engine/PlanContainer.tsx` — swap `useAppStore()` → `usePlanStore()`, replace local `CATEGORY_NAMES` with import from `@shared/domain`
- [ ] 3.4 Modify `src/features/nutritional-traffic-light/ScannerContainer.tsx` — swap `useAppStore(s => s.addFoodToLog)` → `useLogStore(s => s.addFoodToLog)`, replace local `CATEGORY_NAMES` with import from `@shared/domain`

## Phase 4: Cleanup

- [ ] 4.1 Delete `src/shared/store/appStore.ts` — no remaining imports anywhere
- [ ] 4.2 Verify `pnpm typecheck` and `pnpm test:run` pass — all 68 existing tests green
- [ ] 4.3 Update `src/App.test.tsx` if it references appStore path — remove or update imports

## Implementation Order

Shared utils first (zero deps) → feature stores (depend on utils) → container wiring (depends on stores) → delete old store (depends on nothing importing it). Each phase is safe to commit after verification.
