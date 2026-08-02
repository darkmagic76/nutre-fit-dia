# Delta for store-architecture

## MODIFIED Requirements

### R1: Feature-Scoped Store Placement

Stores with exactly one feature consumer SHALL live in that feature's directory. After the nudge engine DI refactor, `activityStore` has exactly one feature consumer (`activity-tracker`) and SHALL move to `src/features/activity-tracker/store/activityStore.ts`. `nudgeStore` has exactly one feature consumer (`nudge-engine`) and SHALL move to `src/features/nudge-engine/store/nudgeStore.ts`. Barrel re-exports SHALL be preserved: `@features/{feature}/index.ts` re-exports the store hook.
(Previously: `activityStore` lived at `src/shared/stores/activityStore.ts` because `shared/nudge/engine.ts` was a second consumer. That consumer is removed by this refactor.)

#### Scenario: activityStore moves to feature directory

- GIVEN engine no longer imports `useActivityStore`
- AND `activity-tracker` is the sole feature consumer
- WHEN the refactor is complete
- THEN `activityStore.ts` MUST exist at `src/features/activity-tracker/store/activityStore.ts`
- AND the store test SHALL move with it
- AND `@features/activity-tracker/index.ts` SHALL re-export `useActivityStore`

#### Scenario: nudgeStore moves to feature directory

- GIVEN engine no longer imports `useNudgeStore` (CooldownTracker and engine both receive injected ops/callbacks)
- AND `nudge-engine` is the sole feature consumer
- WHEN the refactor is complete
- THEN `nudgeStore.ts` MUST exist at `src/features/nudge-engine/store/nudgeStore.ts`
- AND the store test SHALL move with it
- AND `@features/nudge-engine/index.ts` SHALL re-export `useNudgeStore`

### R3: Import Direction Integrity

No file in `src/shared/` SHALL import from `@features/`, with one transitional exception: `useExportData.ts` in `src/shared/hooks/` MAY import `useActivityStore` from `@features/activity-tracker/store/activityStore` and `useNudgeStore` from `@features/nudge-engine/store/nudgeStore` until `useExportData` is refactored to use a data registry pattern. This exception SHALL be removed when either store gains a second feature consumer (triggering relocation back to `shared/stores/`) or `useExportData` no longer directly imports store hooks.
(Previously: R3 was absolute — zero `@features/` imports within `shared/`.)

#### Scenario: useExportData imports from feature paths during transition

- GIVEN `activityStore` lives at `src/features/activity-tracker/store/activityStore.ts`
- AND `nudgeStore` lives at `src/features/nudge-engine/store/nudgeStore.ts`
- WHEN `useExportData.ts` needs store state
- THEN it SHALL import `useActivityStore` from `@features/activity-tracker/store/activityStore`
- AND `useNudgeStore` from `@features/nudge-engine/store/nudgeStore`
- AND lint SHALL NOT block these specific `@features/` imports from `useExportData.ts`

#### Scenario: Other shared files still blocked

- GIVEN a file under `src/shared/` that is NOT `useExportData.ts`
- WHEN it imports from `@features/`
- THEN `pnpm lint` SHALL fail
- AND `pnpm typecheck` SHALL fail (import path resolution blocked)
