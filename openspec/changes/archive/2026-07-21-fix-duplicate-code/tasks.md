# Tasks: Fix Duplicate Code

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80-100 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Foundation — Shared Modules

- [x] 1.1 Create `src/shared/domain/sugarAliases.ts` with union of `OCCULT_SUGAR_PATTERNS` + `sugarAliases` (19 items, `string[]`)
- [x] 1.2 Create `src/test/test-helpers.ts` with `createLocalStorage()` and `createMatchMedia()` (copied identically from App.test.tsx)

## Phase 2: Wire Consumers — Sugar Aliases

- [x] 2.1 Modify `occultSugarDetector.ts` — remove local `OCCULT_SUGAR_PATTERNS`, import `SUGAR_ALIASES` from shared
- [x] 2.2 Modify `MockScannerAdapter.ts` — remove local `sugarAliases` Set, build Set from imported `SUGAR_ALIASES`

## Phase 3: Wire Consumers — Test Helpers

- [x] 3.1 Modify `App.test.tsx` — remove local `createLocalStorage`/`createMatchMedia`, import from `src/test/test-helpers`
- [x] 3.2 Modify `App.integration.test.tsx` — remove local `createLocalStorage`/`createMatchMedia`, import from `src/test/test-helpers`

## Phase 4: Verification

- [x] 4.1 Run `pnpm test:run` — 510 tests pass (53 files)
- [x] 4.2 Run `pnpm typecheck` — clean
- [x] 4.3 Run `pnpm lint` — clean
