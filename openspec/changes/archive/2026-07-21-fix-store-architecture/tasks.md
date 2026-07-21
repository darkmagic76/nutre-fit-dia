# Tasks: Fix Shared Store Architecture

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 20–30 (import paths only) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Relocate activityStore + planStore, update ~9 files, verify | Single PR | ~30 changed lines, pure refactor |

## Phase 1: activityStore Relocation

- [x] 1.1 Run `pnpm test:run` to establish green baseline
- [x] 1.2 Move `src/shared/stores/activityStore.ts` → `src/features/activity-tracker/activityStore.ts`. Change `@features/activity-tracker/types` → `./types` (not `../types` — file is AT feature root, not below)
- [x] 1.3 Update `src/features/activity-tracker/index.ts`: `@shared/stores` → `./activityStore`
- [x] 1.4 Update `src/features/activity-tracker/hooks/useActivityTracker.ts`: `@shared/stores` → `../activityStore`
- [x] 1.5 Update `src/features/activity-tracker/hooks/useActivityTracker.test.ts`: `@shared/stores` → `../activityStore` (design said `../../activityStore` but correct path is `../activityStore` — one level up from `hooks/` to feature root)
- [x] 1.6 Update `src/features/nudge-engine/engine.ts`: `useActivityStore` from `@features/activity-tracker/activityStore`; keep `useTrackerStore`/`useLogStore` from `@shared/stores`
- [x] 1.7 Run `pnpm test:run` — all tests must stay green

## Phase 2: planStore Relocation

- [x] 2.1 Move `src/shared/stores/planStore.ts` → `src/features/recipe-engine/planStore.ts`. Change `@features/recipe-engine/services/planGenerator` → `./services/planGenerator`
- [x] 2.2 Move `src/shared/stores/planStore.test.ts` → `src/features/recipe-engine/planStore.test.ts`. Change `@shared/stores` → `./planStore` for `usePlanStore` (design said `../planStore` but files are in same dir); keep `@shared/stores` for `useTrackerStore`
- [x] 2.3 Update `src/features/recipe-engine/RecipeEngineContainer.tsx`: `@shared/stores` → `./planStore` for `usePlanStore` (design said `../planStore` but container is in same dir); keep `useTrackerStore` from `@shared/stores`
- [x] 2.4 Update `src/shared/stores/index.ts`: remove lines re-exporting `activityStore` and `planStore`
- [x] 2.5 Run `pnpm test:run` — all tests must stay green

## Phase 3: Verification

- [x] 3.1 Run `pnpm test:run` — verify full suite (42 files, 410 tests) passes
- [x] 3.2 Run `pnpm typecheck` — verify zero type errors
- [x] 3.3 Run `pnpm verify` — verify lint + typecheck + tests + build all pass
- [x] 3.4 Verify `grep -r "from.*@features" src/shared/` returns empty (spec R3)
