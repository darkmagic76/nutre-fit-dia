# Design: Fix Zero-Coverage Zombie Files

## Technical Approach

Pure cleanup: delete 4 byte-identical zombie files in `features/nudge-engine/`, then fix 5 stale test import paths to point at the canonical `@shared/nudge` barrel. No new code, no architecture changes — the canonical files already exist in `src/shared/nudge/` and `src/shared/stores/nudgeStore.ts`. Verify with `pnpm test:coverage` returning 100% functions.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| A) Fix imports first, then delete zombies | Tests never break; zombies deleted silently; cannot prove they had zero production impact | Rejected |
| B) Delete zombies first, then fix imports | Tests break as safety check proving zombies had 0 production consumers; then fix imports restores green | **Chosen** |

**Rationale**: Deleting first acts as a validation gate — if any production code breaks, the zombie claim is false and we roll back. Since only 5 test import lines reference the zombies (confirmed via grep across the full source tree), the breakage is isolated and intentional.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/nudge-engine/store/nudgeStore.ts` | Delete | Zombie — identical to `shared/stores/nudgeStore.ts`, 0 production imports |
| `src/features/nudge-engine/cooldownTracker.ts` | Delete | Zombie — identical to `shared/nudge/cooldownTracker.ts`, only stale test imports |
| `src/features/nudge-engine/types.ts` | Delete | Zombie — identical to `shared/nudge/types.ts`, only type-imported by 2 tests |
| `src/features/nudge-engine/cooldownDurations.ts` | Delete | Zombie — identical to `shared/nudge/cooldownDurations.ts`, 0 imports at all |
| `src/features/nudge-engine/cooldownTracker.test.ts:2` | Modify | `'./cooldownTracker'` → `'@shared/nudge'` |
| `src/features/nudge-engine/engine.test.ts:3` | Modify | `'./cooldownTracker'` → `'@shared/nudge'` |
| `src/features/nudge-engine/engine.test.ts:9` | Modify | `'./types'` → `'@shared/nudge'` |
| `src/features/nudge-engine/nudgeEngine.integration.test.ts:3` | Modify | `'./cooldownTracker'` → `'@shared/nudge'` |
| `src/features/nudge-engine/rules.test.ts:6` | Modify | `'./types'` → `'@shared/nudge'` |

**No new files created. No files modified beyond the 5 import lines above.**

## Barrel Integrity Check

### `@shared/nudge/index.ts` — exports the names tests need after redirect:

```ts
export { CooldownTracker } from './cooldownTracker';         // ✅ 3 test imports
export { NUDGE_RULES } from './rules';
export { buildNudgeContext, evaluateRules, evaluateAndEnqueue } from './engine';
export type { NudgeRule, SafetyRule, NudgeContext, NudgeEvaluation } from './types';  // ✅ 2 test imports
```

### `features/nudge-engine/store/index.ts` — survives deletion, re-exports from canonical:

```ts
export { useNudgeStore } from '@shared/stores/nudgeStore';   // ✅ integration test import './store' resolves here
```

### `features/nudge-engine/index.ts` — feature barrel untouched, already re-exports from `@shared/`:

No changes needed. Already imports `CooldownTracker` and types from `@shared/nudge`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | All 4 affected test files | `pnpm test:run` — must pass after import fix |
| Coverage | Function coverage | `pnpm test:coverage` — must show 100% functions, zombie files absent from report |
| Integration | Full pipeline | `pnpm verify` (lint + typecheck + tests + build) — must exit 0 |

## Migration / Rollout

No migration required. Rollback: `git revert` — atomically restores 4 deleted files and 5 import lines.

## Open Questions

None. All dependencies confirmed: `@shared/nudge` barrel exports every name redirected, `store/index.ts` survives independently, and grep confirms zero production consumers of the 4 zombies.
