# Tasks: Centralize Clinical Thresholds & Feature Barrels

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~96 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-always |
| Decision needed before apply | Yes |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Clinical Threshold Centralization

- [ ] 1.1 Run `pnpm test:run` to establish baseline — all 578 tests must be green
- [ ] 1.2 Append 13 exported `const` declarations to `src/shared/constants/clinical.ts` with JSDoc (copy from `rules.ts` lines 17-41, prefix with `export`, preserve `export` on `VEGETABLE_NUDGE_HOUR_THRESHOLD`)
- [ ] 1.3 Run `pnpm typecheck` — verify clinical.ts compiles without errors
- [ ] 1.4 In `src/shared/nudge/rules.ts`: remove lines 14-41 (13 module-scoped consts) and replace with a named import from `@shared/constants/clinical` for all 14 constants
- [ ] 1.5 In `src/shared/nudge/index.ts`: replace `VEGETABLE_NUDGE_HOUR_THRESHOLD` re-export source from `'./rules'` to `'@shared/constants/clinical'`
- [ ] 1.6 Run `pnpm typecheck && pnpm test:run` — verify zero type errors, all 578 tests green

## Phase 2: Consumer Import Rewire

- [ ] 2.1 In `src/features/med-diet-validator/components/DailyViolations.tsx`: change `VEGETABLE_NUDGE_HOUR_THRESHOLD` import from `@shared/nudge` to `@shared/constants/clinical`
- [ ] 2.2 In `src/features/med-diet-validator/components/DailyViolations.test.tsx`: change `VEGETABLE_NUDGE_HOUR_THRESHOLD` import from `@shared/nudge` to `@shared/constants/clinical`
- [ ] 2.3 Run `pnpm test:run -- src/features/med-diet-validator` — verify DailyViolations tests still pass

## Phase 3: Feature Barrels

- [ ] 3.1 Create `src/features/nutritional-traffic-light/index.ts` — export `NutritionalTrafficLightContainer`
- [ ] 3.2 Create `src/features/med-diet-validator/index.ts` — export `MedDietValidatorContainer`
- [ ] 3.3 Create `src/features/metabolic-tracker/index.ts` — export `MetabolicTrackerContainer`
- [ ] 3.4 Create `src/features/recipe-engine/index.ts` — export `RecipeEngineContainer`
- [ ] 3.5 Create `src/features/sustainability/index.ts` — export `SustainabilityContainer`
- [ ] 3.6 In `src/features/nudge-engine/index.ts`: add `export { NudgeEngineContainer } from './NudgeEngineContainer'`
- [ ] 3.7 Run `pnpm typecheck` — verify all barrels resolve

## Phase 4: App.tsx Import Rewire

- [ ] 4.1 In `src/App.tsx`: replace 5 deep-feature imports with barrel imports (`@features/nutritional-traffic-light`, `@features/med-diet-validator`, `@features/metabolic-tracker`, `@features/recipe-engine`, `@features/sustainability`)
- [ ] 4.2 In `src/App.tsx`: replace `NudgeEngineContainer` deep import with `@features/nudge-engine` barrel import
- [ ] 4.3 Run `pnpm typecheck` — verify zero errors after all import path changes

## Phase 5: Final Verification

- [ ] 5.1 Run `pnpm test:run` — all 578 tests green, zero regressions
- [ ] 5.2 Run `pnpm lint` — zero warnings
- [ ] 5.3 Run `pnpm verify` — typecheck + lint + tests + build all green
- [ ] 5.4 Manual check: `VEGETABLE_NUDGE_HOUR_THRESHOLD` importable from both `@shared/nudge` and `@shared/constants/clinical`
- [ ] 5.5 Manual check: `CEREAL_RESTRICTED_MAX` value = 4 in clinical.ts, unchanged
