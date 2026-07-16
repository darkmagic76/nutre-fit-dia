# Tasks: Phase 2 — Container/Presentational Split

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400–500 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Scanner + DailyLog → PR 2: MetabolicTracker + Plan |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Scanner + DailyLog splits | PR 1 | Independent features; `pnpm test:run` passes after each extract |
| 2 | MetabolicTracker + Plan splits | PR 2 | Same pattern; standalone or stacked on PR 1 |

## Phase 1: Scanner Feature Split

- [ ] 1.1 Create `src/features/nutritional-traffic-light/ScannerView.tsx` — presentational component with `TRAFFIC_COLORS`/`TRAFFIC_LABELS`, receives data and callbacks as props
- [ ] 1.2 Refactor `ScannerContainer.tsx` — strip JSX, wire `ScannerView`, keep store imports and handlers

## Phase 2: MetabolicTracker Feature Split

- [ ] 2.1 Create `src/features/metabolic-tracker/MetabolicTrackerView.tsx` — presentational component for profile form and caloric target display
- [ ] 2.2 Refactor `MetabolicTrackerContainer.tsx` — strip JSX, wire `MetabolicTrackerView`, keep `useTrackerStore` and `calculateTarget`

## Phase 3: DailyLog Feature Split

- [ ] 3.1 Create `src/features/med-diet-validator/DailyLogView.tsx` — presentational component for log list, caloric summary, validation feedback
- [ ] 3.2 Refactor `DailyLogContainer.tsx` — strip JSX, wire `DailyLogView`, keep `useLogStore` and `totalKcal` computation

## Phase 4: Plan Feature Split

- [ ] 4.1 Create `src/features/recipe-engine/PlanView.tsx` — presentational component for week plan, restriction toggle, violation details
- [ ] 4.2 Refactor `PlanContainer.tsx` — strip JSX, wire `PlanView`, keep store selectors and `generatePlan`

## Phase 5: Verification

- [ ] 5.1 `pnpm typecheck` — no TypeScript errors in new Views or modified containers
- [ ] 5.2 `pnpm lint` — no violations; confirm zero store hooks in View files
- [ ] 5.3 `pnpm test:run` — all 68 existing tests pass unchanged
- [ ] 5.4 Audit: each View has zero `use*Store` imports; each container has zero `TRAFFIC_*` constants
