# Design: Fix Shared Store Architecture

## Technical Approach

Pure structural refactor — relocate `activityStore.ts` and `planStore.ts` from `shared/stores/` into their respective feature directories. Zero behavioral changes. Same Zustand stores, same exports, same APIs. Only import paths change.

## Architecture Decisions

### Decision: Direct feature-root placement (not `store/` subdirectory)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `features/activity-tracker/activityStore.ts` | Simpler path, fewer directories for single-store features | **Chosen** |
| `features/activity-tracker/store/activityStore.ts` | Consistency with nudge-engine, but adds nesting for one file | Rejected |

**Rationale**: nudge-engine uses `store/nudgeStore.ts` because it's a multi-module feature with cooldown tracker, rules, and engine alongside the store. activity-tracker and recipe-engine each have a single store — a `store/` subdirectory adds nesting without organization benefit. The proposal and spec explicitly specify root placement.

### Decision: Relative imports intra-feature, `@features/` alias cross-feature

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `./activityStore` within feature, `@features/activity-tracker/activityStore` from nudge-engine | Clear dependency direction, follows existing patterns | **Chosen** |
| All `@features/` imports everywhere | Symmetric but loses locality signal for intra-feature files | Rejected |

**Rationale**: Intra-feature imports use relative paths (`../activityStore`, `./services/planGenerator`) following the project's existing convention. The one cross-feature import (nudge-engine → activity-tracker) uses `@features/activity-tracker/activityStore` to make the cross-feature dependency explicit.

## Data Flow

```
activity-tracker/                     nudge-engine/
  activityStore.ts ──(zustand)──→       engine.ts
       │                              buildNudgeContext()
       │                                    │
  hooks/useActivityTracker.ts               │ reads weeklyMinutes
       │                                    ▼
  ActivityTrackerContainer              NudgeContext.weeklyActivityMinutes

recipe-engine/
  planStore.ts ──→ RecipeEngineContainer
       │
       │ reads restrictionActive
       ▼
  @shared/stores/trackerStore (valid shared dep)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/activity-tracker/activityStore.ts` | **Create** | Copy from `shared/stores/activityStore.ts`. Change `@features/activity-tracker/types` → `../types` |
| `src/features/recipe-engine/planStore.ts` | **Create** | Copy from `shared/stores/planStore.ts`. Change `@features/recipe-engine/services/planGenerator` → `./services/planGenerator` |
| `src/features/recipe-engine/planStore.test.ts` | **Create** | Copy from `shared/stores/planStore.test.ts`. Change `@shared/stores` → `../planStore` for `usePlanStore`, keep `@shared/stores` for `useTrackerStore` |
| `src/shared/stores/activityStore.ts` | **Delete** | Moved to activity-tracker |
| `src/shared/stores/planStore.ts` | **Delete** | Moved to recipe-engine |
| `src/shared/stores/planStore.test.ts` | **Delete** | Moved to recipe-engine |
| `src/shared/stores/index.ts` | **Modify** | Remove lines 3–5 (activityStore and planStore re-exports) |
| `src/features/activity-tracker/index.ts` | **Modify** | Line 1: `@shared/stores` → `./activityStore` |
| `src/features/activity-tracker/hooks/useActivityTracker.ts` | **Modify** | `@shared/stores` → `../activityStore` |
| `src/features/activity-tracker/hooks/useActivityTracker.test.ts` | **Modify** | `@shared/stores` → `../../activityStore` |
| `src/features/recipe-engine/RecipeEngineContainer.tsx` | **Modify** | `@shared/stores` → `../planStore` (keep `useTrackerStore` from `@shared/stores`) |
| `src/features/nudge-engine/engine.ts` | **Modify** | `@shared/stores` → split: `useActivityStore` from `@features/activity-tracker/activityStore`, keep `useTrackerStore`/`useLogStore` from `@shared/stores` |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | planStore (3 tests) | Relocate `planStore.test.ts`, fix imports, run |
| Unit | useActivityTracker (4 tests) | Fix imports only — no logic change |
| Unit | nudge-engine (8 test cases) | No import changes needed (doesn't import activityStore directly) |
| Integration | Full suite | `pnpm test:run` — all 41 files, ~395 tests must pass |

## Migration / Rollout

No migration required. Single commit: move files, update imports, verify. Rollback via `git revert`.

## Open Questions

None. All import paths confirmed via code audit. No ambiguous cases.
