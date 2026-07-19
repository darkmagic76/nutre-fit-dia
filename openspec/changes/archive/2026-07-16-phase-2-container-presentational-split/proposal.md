# Proposal: Phase 2 — Container/Presentational Split

## Intent

ADR-001 §3 mandates Container/Presentational separation. Phase 1 extracted shared UI primitives and domain data. Phase 2 splits the 4 mixed containers into logic containers + pure presentational Views.

## Scope

### In Scope
- 4 View components: `ScannerView`, `MetabolicTrackerView`, `DailyLogView`, `PlanView`
- 4 containers stripped of JSX, delegating rendering to Views via props/callbacks
- `TRAFFIC_COLORS`, `TRAFFIC_LABELS` → move into `ScannerView`
- Containers keep: store imports, state, handlers, business logic, calculations

### Out of Scope
- Service-layer changes (classification, caloric target, ration validation, plan gen)
- Store-layer changes (scanner, tracker, log, plan stores)
- New features or UI changes
- Further Views (App shell header/footer remain in App.tsx)

## Capabilities

> Pure refactor. No spec-level behavior changes — only code organization per ADR-001.

### New Capabilities
None.

### Modified Capabilities
None.

## Approach

Per-container: extract JSX into `{Feature}View.tsx`, receive data as props and actions as callbacks. Container becomes a thin wrapper that wires store → View. No functional changes — snapshots and tests pass unchanged.

```
Container (logic)                   View (presentation)
  ├── store imports                    ├── props only
  ├── useState / handlers              ├── no store imports
  ├── calculations                     ├── render JSX
  └── <View data={...} onAction={...}  └── display constants (TRAFFIC_*)
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/nutritional-traffic-light/ScannerContainer.tsx` | Modified | Strip JSX, wire ScannerView |
| `src/features/nutritional-traffic-light/ScannerView.tsx` | New | Receives food data, result, callbacks; owns TRAFFIC_COLORS/LABELS |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` | Modified | Strip JSX, wire MetabolicTrackerView |
| `src/features/metabolic-tracker/MetabolicTrackerView.tsx` | New | Receives profile state, caloric target, setters as callbacks |
| `src/features/med-diet-validator/DailyLogContainer.tsx` | Modified | Strip JSX, wire DailyLogView |
| `src/features/med-diet-validator/DailyLogView.tsx` | New | Receives todayLog, validation, caloricTarget, onRemove |
| `src/features/recipe-engine/PlanContainer.tsx` | Modified | Strip JSX, wire PlanView |
| `src/features/recipe-engine/PlanView.tsx` | New | Receives weeklyPlan, restrictionActive, callbacks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed store import in View | Low | Add lint rule: no `use` store hooks in View files |
| Accidental behavior change | Low | 68 tests + `pnpm test:run` guard on every View extraction |

## Rollback Plan

Revert the commit that introduced View files and modified containers. Pure refactor — no data migration or state schema changes — so rollback is a clean `git revert`.

## Dependencies

None.

## Success Criteria

- [ ] 68 tests still pass after all 4 splits
- [ ] Each container imports zero UI constants (TRAFFIC_COLORS, TRAFFIC_LABELS)
- [ ] Each View has zero store imports (Zustand `use*Store` hooks)
- [ ] `pnpm test:run` passes on every intermediate commit
