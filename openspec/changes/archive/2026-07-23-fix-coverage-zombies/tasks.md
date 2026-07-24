# Tasks: Fix Zero-Coverage Zombie Files

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~165 (110 deletions, 10 modified lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | single-pr |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full cleanup: delete zombies + fix imports + verify | PR 1 (single) | 9 file changes, ~165 lines; well under budget |

## Phase 1: RED — Delete Zombie Files (Tests Intentionally Break)

- [x] 1.1 Delete `src/features/nudge-engine/store/nudgeStore.ts` (zombie — byte-identical to `@shared/stores/nudgeStore`, 0 production imports)
- [x] 1.2 Delete `src/features/nudge-engine/cooldownTracker.ts` (zombie — byte-identical to `@shared/nudge/cooldownTracker`, only stale test imports)
- [x] 1.3 Delete `src/features/nudge-engine/types.ts` (zombie — byte-identical to `@shared/nudge/types`, imported by 2 tests only)
- [x] 1.4 Delete `src/features/nudge-engine/cooldownDurations.ts` (zombie — byte-identical to `@shared/nudge/cooldownDurations`, zero imports total)
- [x] 1.5 Run `pnpm test:run` → EXPECT FAILURES in 5 test imports (proves zombies had zero production consumers)

## Phase 2: GREEN — Redirect Test Imports to Canonical Sources

- [x] 2.1 Fix `src/features/nudge-engine/cooldownTracker.test.ts:2`: `'./cooldownTracker'` → `'@shared/nudge'`
- [x] 2.2 Fix `src/features/nudge-engine/engine.test.ts:3`: `'./cooldownTracker'` → `'@shared/nudge'`
- [x] 2.3 Fix `src/features/nudge-engine/engine.test.ts:9`: `'./types'` → `'@shared/nudge'`
- [x] 2.4 Fix `src/features/nudge-engine/nudgeEngine.integration.test.ts:3`: `'./cooldownTracker'` → `'@shared/nudge'`
- [x] 2.5 Fix `src/features/nudge-engine/rules.test.ts:6`: `'./types'` → `'@shared/nudge'`
- [x] 2.6 Run `pnpm test:run` → ALL 545+ tests MUST pass (exit 0)

## Phase 3: VERIFY — Full Pipeline and Coverage Restoration

- [x] 3.1 Run `pnpm quality` (lint + typecheck + test:run) → MUST exit 0
- [x] 3.2 Run `pnpm verify` (quality + build) → MUST exit 0
- [x] 3.3 Run `pnpm test:coverage` → function coverage MUST be 100% (was 94.48%)
- [x] 3.4 Confirm zombie files are absent from coverage report (no feature/nudge-engine direct sources)
- [x] 3.5 AAA validation: confirm `src/features/nudge-engine/index.ts` and `src/features/nudge-engine/store/index.ts` barrels are unchanged
