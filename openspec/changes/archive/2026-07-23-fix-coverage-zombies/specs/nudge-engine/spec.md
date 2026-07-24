# Delta for nudge-engine (Cleanup)

**ADR-001**: Scope Rule — code used by 1 feature stays local; 2+ features → `shared/`. Zombie files violate this.

## REMOVED Artifacts

### Zombie duplicate files in features/nudge-engine/

Four files that are identical copies of their canonical counterparts in `shared/` MUST be removed from `src/features/nudge-engine/`. These files have zero production imports and exist only due to incomplete cleanup during the nudge-engine extraction refactor.

The following files SHALL be deleted:

| File | Canonical counterpart |
|------|----------------------|
| `store/nudgeStore.ts` | `shared/stores/nudgeStore.ts` |
| `cooldownTracker.ts` | `shared/nudge/cooldownTracker.ts` |
| `types.ts` | `shared/nudge/types.ts` |
| `cooldownDurations.ts` | `shared/nudge/cooldownDurations.ts` |

(Reason: Untested zombie duplicates dilute coverage metrics to 94.48%. Their removal restores accurate reporting and Scope Rule compliance.)

#### Scenario: Coverage restored after zombie deletion

- GIVEN zombie files exist and `pnpm test:coverage` reports 94.48% function coverage
- WHEN the 4 zombie files are deleted and test imports redirected to `@shared/nudge`
- THEN function coverage MUST return to 100%
- AND statements, branches, functions, and lines coverage MUST all be ≥ 80%

#### Scenario: Barrels remain intact after deletion

- GIVEN `index.ts` re-exports from `@shared/nudge` and `store/index.ts` re-exports from `@shared/stores/nudgeStore`
- WHEN zombie files are deleted
- THEN both barrel files MUST be unchanged
- AND the nudge-engine public API MUST remain identical

#### Scenario: All tests pass after import redirection

- GIVEN 5 test imports point to local zombie paths (`./cooldownTracker`, `./types`)
- WHEN those imports are redirected to `@shared/nudge`
- THEN `pnpm test:run` MUST exit 0 with all 545+ tests passing
- AND `pnpm verify` (lint, typecheck, tests, build) MUST exit 0

#### Scenario: Zombie files confirmed zero-production-import

- GIVEN the 4 zombie files exist in `features/nudge-engine/`
- WHEN the codebase is searched for non-test imports of these files
- THEN zero production files MUST import from the local zombie paths
- AND all consumers use `@shared/nudge` or `@shared/stores` barrels

#### Scenario: Edge case — stale barrel still references deleted file

- GIVEN a barrel file that directly re-exports from a zombie path (e.g. `export * from './cooldownTracker'`)
- THEN such a barrel MUST NOT exist after cleanup
- AND `pnpm typecheck` MUST catch any stale re-exports before verify passes
