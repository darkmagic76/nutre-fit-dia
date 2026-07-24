# Proposal: Fix Zero-Coverage Zombie Files

## Intent

Restore 100% function coverage by deleting 4 zombie duplicate files in `features/nudge-engine/` left over from the nudge-engine extraction. These files are identical copies of canonical counterparts in `shared/` and have zero production imports — only stale test imports reference them.

## Scope

### In Scope
- Delete 4 zombie files: `store/nudgeStore.ts`, `cooldownTracker.ts`, `types.ts`, `cooldownDurations.ts`
- Fix 5 test import paths (4 test files) to point to `@shared/nudge` and `@shared/stores/nudgeStore`
- Verify coverage returns to 100% functions after cleanup

### Out of Scope
- Updating stale Scope Rule clause in `nudge-engine/spec.md` (separate spec audit)
- Fixing the `NotificationDurations.ts` ghost — cache artifact, self-resolving
- Any refactoring beyond import path redirection

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Approach

1. **Delete zombies**: Remove 4 files (~160 lines). The `store/index.ts` barrel survives — already re-exports from `@shared/stores/nudgeStore`.
2. **Fix test imports** (5 lines):
   - `cooldownTracker.test.ts`: `'./cooldownTracker'` → `'@shared/nudge'`
   - `engine.test.ts`: two imports → `'@shared/nudge'`
   - `nudgeEngine.integration.test.ts`: `'./cooldownTracker'` → `'@shared/nudge'`
   - `rules.test.ts`: `'./types'` → `'@shared/nudge'`
3. **Verify**: Run `pnpm test:coverage` — zombie files dropped from report, function coverage returns to 100%.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/nudge-engine/store/nudgeStore.ts` | Removed | Zombie — 0 production imports |
| `src/features/nudge-engine/cooldownTracker.ts` | Removed | Zombie — only test imports |
| `src/features/nudge-engine/types.ts` | Removed | Zombie — only type-imported by tests |
| `src/features/nudge-engine/cooldownDurations.ts` | Removed | Zombie — 0 imports |
| `src/features/nudge-engine/cooldownTracker.test.ts` | Modified | Import path → `@shared/nudge` |
| `src/features/nudge-engine/engine.test.ts` | Modified | 2 import paths → `@shared/nudge` |
| `src/features/nudge-engine/nudgeEngine.integration.test.ts` | Modified | Import path → `@shared/nudge` |
| `src/features/nudge-engine/rules.test.ts` | Modified | Import path → `@shared/nudge` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Test import breaks barrel resolution | Low | `@shared/nudge` already exports `CooldownTracker` and types; verified in exploration |
| Zombie deletion affects barrel re-exports | Low | `store/index.ts`, `index.ts`, `engine.ts` barrels remain intact — re-export from `@shared/` |

## Rollback Plan

`git revert` the commit. All 4 deleted files and 5 import changes revert atomically. No DB migrations, no config changes.

## Dependencies

None

## Success Criteria

- [ ] 4 zombie files deleted from `features/nudge-engine/`
- [ ] 5 test imports redirected to `@shared/nudge` / `@shared/stores`
- [ ] `pnpm test:coverage` exits 0 with 100% functions coverage
- [ ] `pnpm verify` passes (lint + typecheck + tests + build)
