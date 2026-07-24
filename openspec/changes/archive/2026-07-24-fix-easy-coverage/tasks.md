# Tasks: Fix Remaining Easy Statement Coverage Gaps

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 80–100 |
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

None needed — change fits comfortably in one PR.

## Phase 1: RED — Write Failing Tests

- [x] 1.1 `useInstallPrompt.test.ts`: test `install()` returns early when `deferredPrompt` is null (no `beforeinstallprompt` dispatched). Assert no throw, `isInstallable` remains `false`.
- [x] 1.2 `rationValidator.test.ts`: test `validateRations` with an unknown category key injected into `RATION_LIMITS` via `as any`. Assert no throw, fallback branch executes. Wrap in try/finally for cleanup.
- [x] 1.3 `rationValidator.test.ts`: test `validateFoodPortions` with a food whose category is absent from `AESAN_GRAM_STANDARDS` (`'nonexistent' as any` via `makeFood`). Assert returns `[]`, no throw.
- [x] 1.4 `planGenerator.test.ts`: test `generateWeeklyPlan(false)` verifies Bacalao (`isHighPriority: true`) appears in FISH selections. Assert isHighPriority flag set, Bacalao present.
- [x] 1.5 `planGenerator.test.ts`: test `enforceAOVE` skips silently when no `OLIVE_OIL` foods exist in catalog. Mutate `foods` array with try/finally restore. Assert returns original entries only, no throw.

## Phase 2: GREEN — Verify Individual Tests Pass

- [x] 2.1 Run `pnpm vitest run src/shared/hooks/useInstallPrompt.test.ts` — confirm new test passes (existing branch already handles null guard).
- [x] 2.2 Run `pnpm vitest run src/shared/services/rationValidator.test.ts` — confirm both new tests pass (validator already has fallback and skip branches).
- [x] 2.3 Run `pnpm vitest run src/features/recipe-engine/services/planGenerator.test.ts` — confirm both new tests pass (priority sort and empty catalog branches already exist).

## Phase 3: VERIFY — Full Suite + Coverage

- [x] 3.1 Run `pnpm test:run` — all 536+ tests pass with zero failures.
- [x] 3.2 Run `pnpm test:coverage` — confirm 100% statement coverage threshold met.
- [x] 3.3 Run `pnpm quality` — lint, typecheck, and test suite all green.
