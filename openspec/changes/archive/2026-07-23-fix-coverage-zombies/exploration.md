## Exploration: Fix Zero-Coverage Zombie Files

### Current State
The coverage report shows 3 entries with 0% function coverage — 2 zombie duplicate files and 1 ghost cache artifact. These are leftovers from the nudge-engine extraction that moved shared logic to `shared/nudge/` and `shared/stores/nudgeStore.ts`.

### Affected Areas

**Zombies to delete (identical duplicates):**
- `src/features/nudge-engine/store/nudgeStore.ts` — 44 lines, identical to `shared/stores/nudgeStore.ts`, zero direct imports
- `src/features/nudge-engine/cooldownTracker.ts` — 28 lines, identical to `shared/nudge/cooldownTracker.ts`, only tests import it
- `src/features/nudge-engine/types.ts` — 66 lines, identical to `shared/nudge/types.ts`, only tests import types from it
- `src/features/nudge-engine/cooldownDurations.ts` — 22 lines, identical to `shared/nudge/cooldownDurations.ts`, zero imports

**Tests to patch (import path redirects):**
- `src/features/nudge-engine/cooldownTracker.test.ts` — imports CooldownTracker from zombie
- `src/features/nudge-engine/engine.test.ts` — imports CooldownTracker + NudgeContext from zombies
- `src/features/nudge-engine/nudgeEngine.integration.test.ts` — imports CooldownTracker from zombie
- `src/features/nudge-engine/rules.test.ts` — imports NudgeContext type from zombie

**Ghost file (no action):**
- NotificationDurations.ts — does not exist on disk; coverage cache artifact that disappears after next run

### Verified Findings

**nudgeStore — IMPORT VERIFICATION:**
- `features/nudge-engine/store/index.ts` re-exports from `@shared/stores/nudgeStore` (correct — canonical)
- `nudgeEngine.integration.test.ts` imports `useNudgeStore` from `./store` → resolves to `store/index.ts` → canonical
- `App.tsx` imports `NudgeEngineContainer` from `@features/nudge-engine/NudgeEngineContainer`
- `NudgeEngineContainer.tsx` imports `evaluateAndEnqueue` from `@shared/nudge` and `useNudgeStore` from `@shared/stores`
- Zero files import directly from `features/nudge-engine/store/nudgeStore.ts`
- **Verdict: True zombie — 0 direct imports, safe to delete**

**cooldownTracker — IMPORT VERIFICATION:**
- `features/nudge-engine/index.ts` re-exports `CooldownTracker` from `@shared/nudge` (correct)
- `features/nudge-engine/engine.ts` is barrel re-export from `@shared/nudge/engine` (uses shared cooldownTracker)
- 3 test files import directly from `./cooldownTracker` (the zombie):
  - `cooldownTracker.test.ts` (its own test — logically tests the class, should import from shared)
  - `engine.test.ts` (uses it for evaluateRules unit tests)
  - `nudgeEngine.integration.test.ts` (uses it for integration tests)
- No production code imports the zombie
- **Verdict: Zombie — must fix 3 test imports before deletion**

**store/ directory contents:**
- `store/nudgeStore.ts` — zombie (to delete)
- `store/index.ts` — barrel re-export (to keep)
- After deletion: `store/` still has `index.ts` — directory survives

**features/nudge-engine/ directory check:**
Total 15 files. After cleanup: 4 deletions → 11 files remain.
No other zombie files found.

**shared/nudge/ vs features/nudge-engine/ comparison:**
| File | shared/nudge/ | features/nudge-engine/ | Verdict |
|------|--------------|----------------------|---------|
| cooldownTracker.ts | ✅ canonical | ✅ identical duplicate | DELETE zombie |
| cooldownDurations.ts | ✅ canonical | ✅ identical duplicate | DELETE zombie |
| types.ts | ✅ canonical | ✅ identical duplicate | DELETE zombie |
| engine.ts | ✅ canonical | barrel re-export only | KEEP barrel |
| rules.ts | ✅ canonical | barrel re-export only | KEEP barrel |
| index.ts | ✅ canonical | barrel re-export only | KEEP barrel |

### Cleanup Plan

**Files to delete (4 files, 160 lines):**
1. `src/features/nudge-engine/store/nudgeStore.ts` (44 lines)
2. `src/features/nudge-engine/cooldownTracker.ts` (28 lines)
3. `src/features/nudge-engine/types.ts` (66 lines)
4. `src/features/nudge-engine/cooldownDurations.ts` (22 lines)

**Files to update (4 files, minimal import changes):**
1. `src/features/nudge-engine/cooldownTracker.test.ts:2` — change `'./cooldownTracker'` → `'@shared/nudge'`
2. `src/features/nudge-engine/engine.test.ts:3` — change `'./cooldownTracker'` → `'@shared/nudge'`
3. `src/features/nudge-engine/engine.test.ts:9` — change `'./types'` → `'@shared/nudge'`
4. `src/features/nudge-engine/nudgeEngine.integration.test.ts:3` — change `'./cooldownTracker'` → `'@shared/nudge'`
5. `src/features/nudge-engine/rules.test.ts:6` — change `'./types'` → `'@shared/nudge'`

**Total changed lines:** ~165 (160 deletions + 5 import edits)

### Risk Assessment
- **No production code affected** — all zombies are unreachable from production paths
- Only test import paths change; runtime behavior is identical
- After cleanup, coverage should increase because 0%-coverage zombie files are removed
- The ghost NotificationDurations.ts disappears automatically on next coverage run (no action needed)
- All exports available through `features/nudge-engine/index.ts` remain unchanged (public API intact)
- Risk: LOW — straightforward deletion of dead code with test import fix

### Ready for Proposal
Yes. The exploration confirms 4 zombie files to delete and 4 test files to patch. The total effort is ~165 lines of changes, well within the 400-line budget. Chained PRs not needed.
