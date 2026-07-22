# Proposal: Fix Duplicate Code

## Intent

Eliminate two instances of duplicated code discovered during audit:
1. Overlapping sugar alias lists in `occultSugarDetector.ts` and `MockScannerAdapter.ts`
2. Identical `createLocalStorage()` and `createMatchMedia()` helpers in `App.test.tsx` and `App.integration.test.tsx`

Pure structural refactor — zero behavior changes.

## Scope

### In Scope
- Extract canonical sugar alias list to `src/shared/domain/sugarAliases.ts`
- Wire both consumers to shared list preserving their matching semantics (`includes` vs `has`)
- Extract `createLocalStorage()` and `createMatchMedia()` to `src/test/test-helpers.ts`
- Wire both test files to shared helpers
- Full test suite passes unchanged

### Out of Scope
- Normalizing the two sugar lists' contents (union approach only — no dedup)
- Changing matching logic (includes vs Set.has stays per-consumer)
- Adding new tests for the extracted code
- Any behavior change beyond DRY extraction

## Capabilities

### New Capabilities
None — pure refactor, no new behavioral capabilities.

### Modified Capabilities
None — no spec-level behavior changes.

## Approach

1. **Sugar aliases**: Create `src/shared/domain/sugarAliases.ts` exporting a `SUGAR_ALIASES` const array (union of both existing lists). Import it in both consumers.
2. **Test helpers**: Create `src/test/test-helpers.ts` exporting `createLocalStorage()` and `createMatchMedia()`. Import in both test files. Delete local duplicates.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/domain/sugarAliases.ts` | New | Canonical sugar alias list |
| `src/features/nutritional-traffic-light/services/occultSugarDetector.ts` | Modified | Import shared list instead of local const |
| `src/infrastructure/ml/MockScannerAdapter.ts` | Modified | Import shared list instead of local Set |
| `src/test/test-helpers.ts` | New | Shared test utilities |
| `src/App.test.tsx` | Modified | Import helpers from test-helpers, remove local defs |
| `src/App.integration.test.tsx` | Modified | Import helpers from test-helpers, remove local defs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Union list changes detection surface | Medium | 510 test safety net catches regressions |
| `concentrado de zumo` vs `zumo concentrado` variants | Low | Both included in union — no loss |
| Import path mistake | Low | TypeScript compiler catches it |

## Rollback Plan

Revert via `git revert <commit-hash>`. Changes are purely additive (new files) plus import swaps — no data loss risk.

## Dependencies

None.

## Success Criteria

- [ ] `pnpm test:run` passes (510 tests)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] No duplicate sugar alias lists in codebase
- [ ] No duplicate `createLocalStorage()`/`createMatchMedia()` in codebase
