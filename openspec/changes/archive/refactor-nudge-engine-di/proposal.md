# Proposal: Refactor Nudge Engine — Dependency Injection

## Intent

`shared/nudge/engine.ts` imports and calls `.getState()` on 4 Zustand stores directly, violating Domain Isolation (ADR-009: "El core NO depende de frameworks"). The engine must become pure domain logic receiving data via parameters, not reading framework state.

## Scope

### In Scope
- `buildNudgeContext()` → pure function receiving `ContextInput` POJO instead of calling `getState()`
- `evaluateAndEnqueue()` → receives `enqueue`, `acknowledge`, `pending` as callbacks
- `CooldownTracker` → receives cooldown read/write ops via constructor injection
- New `ContextInput` type (4 fields: `restrictionActive`, `todayLog`, `weeklyMinutes`, `getTrend()` result)
- Update 4 Container callers to read stores and pass data into engine

### Out of Scope
- Moving `activityStore` or `nudgeStore` out of `shared/` — blocked by `useExportData` (shared hook imports both)
- Rule logic changes — `evaluateRules()`, `NUDGE_RULES`, all conditions stay identical
- Type changes — `NudgeContext`, `NudgeEvaluation`, `SafetyRule` unchanged
- Test changes beyond adapting to new function signatures

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- **nudge-engine**: `buildNudgeContext()` signature changes (receives `ContextInput`); `evaluateAndEnqueue()` receives store callbacks; `CooldownTracker` constructor receives cooldown state interface. Pure functions only — zero Zustand imports in engine module.
- **store-architecture**: Scope ruling clarified — `activityStore` and `nudgeStore` remain shared (both consumed by `useExportData` in `shared/hooks/` + 1 feature each = 2 consumers)

## Approach

**Dependency Injection pattern**: all store reads become caller-provided parameters. Containers orchestrate reads; engine evaluates.

```
Before: engine.ts → Zustand stores (direct getState)
After:  Containers → read stores → pass data → engine (pure, no framework)
```

Three artifacts change:
1. `buildNudgeContext(input: ContextInput)` — receives flattened store data
2. `evaluateAndEnqueue(input, callbacks)` — receives `{enqueue, acknowledge, pending}`
3. `CooldownTracker(cooldownInterface)` — receives `{registerCooldown, cooldowns, resetCooldown}`

4 Container files (`NudgeEngineContainer`, `NutritionalTrafficLightContainer`, `MetabolicTrackerContainer`, `ActivityTrackerContainer`) become the orchestrators.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/nudge/engine.ts` | Modified | Remove Zustand imports; add parameter signatures |
| `src/shared/nudge/types.ts` | Modified | Add `ContextInput` type |
| `src/shared/nudge/cooldownTracker.ts` | Modified | Constructor injection for cooldown state |
| `src/shared/nudge/index.ts` | Modified | Re-export new types |
| `src/features/nudge-engine/NudgeEngineContainer.tsx` | Modified | Read stores, pass to engine |
| `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx` | Modified | Read stores, pass to engine |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` | Modified | Read stores, pass to engine |
| `src/features/activity-tracker/ActivityTrackerContainer.tsx` | Modified | Read stores, pass to engine |
| `src/features/nudge-engine/engine.test.ts` | Modified | Adapt to new signatures |
| `src/features/nudge-engine/nudgeEngine.integration.test.ts` | Modified | Adapt to new signatures |
| `src/features/nudge-engine/cooldownTracker.test.ts` | Modified | Constructor param change |
| Container test files (4) | Modified | Mock engine calls with new signatures |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `useExportData` depends on both stores — moving to features would create `shared/ → @features/` reverse dependency | High | Stores stay in `shared/` (2 consumers each: exportData + feature). Engine decoupling proceeds independently. |
| 4 Container files need coordinated signature changes | Low | Each Container change is mechanical — read stores, pass data. TDD gate catches drift. |
| `CooldownTracker` constructor change breaks tests that `new CooldownTracker()` | Low | Default no-arg ctor wraps `useNudgeStore` internally; DI constructor is opt-in for engine use |

## Rollback Plan

Revert `engine.ts` and `cooldownTracker.ts` to current state. Functions are pure — no structural coupling to undo. Git revert atomic.

## Dependencies

- `useExportData` (shared hook) must be refactored separately before either store can leave `shared/`
- Store-architecture spec (R2) already covers multi-consumer store placement

## Success Criteria

- [ ] `engine.ts` has zero Zustand imports
- [ ] `cooldownTracker.ts` has zero Zustand imports (in engine-use path)
- [ ] `evaluateRules()` signature unchanged (already pure)
- [ ] All 732 tests pass (`pnpm test:run`)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm build` succeeds
