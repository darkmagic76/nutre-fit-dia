# Tasks: H3 — Sustainability Scoring Core

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~334 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Sustainability scoring module + RecipeEngine integration | PR 1 | Single PR — already implemented and verified |

**Note**: Implementation was executed in two git commits (scaffold → core implementation) but delivered as a single reviewable unit. Types already scaffolded in `0f0781b`; core logic, tests, and integration in `e8c8d7d`.

## Phase 1: Foundation — Domain Types (already scaffolded)

- [x] 1.1 Create `src/shared/sustainability/types.ts` with `Seasonality`, `Proximity`, `PackagingLevel` enums + `EnvironmentalScore` interface
- [x] 1.2 Create `src/shared/sustainability/index.ts` with barrel exports for types

## Phase 2: Core Implementation — Scoring Service

- [x] 2.1 Create `src/shared/sustainability/constants.ts` with 6 export groups: `PROTEIN_EMISSION_RATIOS`, `CARBON_THRESHOLDS`, `CARBON_CATEGORY_SCORES`, `SCORING_WEIGHTS`, `SEASONALITY_SCORES`, `PROXIMITY_SCORES`
- [x] 2.2 Write `src/shared/sustainability/scoringService.test.ts` with 14 test cases (TDD RED)
- [x] 2.3 Create `src/shared/sustainability/scoringService.ts` with `computeEnvironmentalScore()` + private `categorizeCarbon()` (TDD GREEN)
- [x] 2.4 Update `src/shared/sustainability/index.ts` to export `constants` and `scoringService` APIs

## Phase 3: Integration — RecipeEngine

- [x] 3.1 Modify `src/features/recipe-engine/services/planGenerator.ts`: rename `pickFood` → `pickSustainableFood`, add sustainability sorting via `computeEnvironmentalScore()`

## Phase 4: Verification

- [x] 4.1 Run `pnpm quality` — lint 0, typecheck clean, 14 tests green
- [x] 4.2 Verify planGenerator integration: plan remains valid with sustainable food selection
