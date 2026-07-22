# Proposal: Fix Shared Store Architecture

## Intent

ADR-009 §92-104 mandates per-feature stores. Two shared stores violate the Scope Rule by importing from features (reverse dependency). Zero behavioral changes — pure relocation to restore architectural integrity.

## Scope

### In Scope
- Move `activityStore.ts` → `features/activity-tracker/` (depends on activity-tracker types)
- Move `planStore.ts` + `planStore.test.ts` → `features/recipe-engine/` (depends on planGenerator service, used by 1 feature)
- Update `shared/stores/index.ts` barrel to remove re-exports
- Update ~10 import paths across 9 files

### Out of Scope
- `trackerStore.ts` and `logStore.ts` — correctly placed (no feature imports, used by 3+ features)
- Behavioral changes, API changes, or logic refactoring

## Capabilities

### New Capabilities
None

### Modified Capabilities
None — pure refactor, no spec-level requirement changes

## Approach

File relocation with updated internal imports (feature→feature via `./` paths or `@features/` alias):

| Violation | Move From | Move To | Import Fix |
|-----------|-----------|---------|------------|
| activityStore imports from `@features/activity-tracker/types` | `shared/stores/activityStore.ts` | `features/activity-tracker/activityStore.ts` | `../types` (relative) |
| planStore imports from `@features/recipe-engine/services/planGenerator` | `shared/stores/planStore.ts` | `features/recipe-engine/planStore.ts` | `./services/planGenerator` |

`nudge-engine/engine.ts` cross-feature import switches from `@shared/stores` to `@features/activity-tracker` (dependency direction: nudge-engine → activity-tracker, valid).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `shared/stores/activityStore.ts` | Removed | Moved to activity-tracker feature |
| `shared/stores/planStore.ts` | Removed | Moved to recipe-engine feature |
| `shared/stores/planStore.test.ts` | Removed | Moved alongside planStore |
| `shared/stores/index.ts` | Modified | Remove activityStore + planStore re-exports |
| `features/activity-tracker/` | Modified | New store file + updated hook/test/index imports |
| `features/recipe-engine/` | Modified | New store + test files + updated container import |
| `features/nudge-engine/engine.ts` | Modified | Re-target useActivityStore import |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Barrel `@shared/stores` consumers break after remove | Low | Only 2 exports removed; grep confirms no other files use them through barrel |
| nudge-engine cross-feature import validation | Low | Direction is correct (nudge-engine depends on activity-tracker). Verify ADR-009 allows feature→feature deps |
| Test relocation might miss import update | Low | Read every file before editing; run `pnpm test:run` after |

## Rollback Plan

`git revert` the commit. Both stores return to `shared/stores/`, barrel re-exports restored, all imports point back to `@shared/stores`.

## Dependencies

None

## Success Criteria

- [ ] Zero shared stores import from feature paths (`grep -r "from '@features" src/shared/stores/` returns empty)
- [ ] `pnpm test:run` — all 41 test files pass (395 unit tests)
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm build` — succeeds
