# Proposal: Extract Magic Numbers to Named Constants

## Intent

Audit found hardcoded numeric literals with business meaning scattered across 5 modules. These numbers are domain thresholds (glucose, activity, ration limits) that must be self-documenting and maintainable. Zero behavior change — pure refactor.

## Scope

### In Scope
- Extract all business-logic literals to named `const` in each file
- Covers: `planGenerator.ts`, `rules.ts`, `rationValidator.ts`
- Verify 510 existing tests pass unchanged

### Out of Scope
- Structural refactors (no new files, no export/import changes)
- Behavior or spec-level changes — this is code-only
- `engine.ts` and `caloricTargetService.ts` — already clean or constant-free

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Approach

Replace each literal with a `const` at the top of its module. Each constant name encodes domain meaning (e.g., `HYPERGLYCEMIA_THRESHOLD_MG_DL`). Run full test suite between each change group to confirm zero regressions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/recipe-engine/services/planGenerator.ts` | Modified | 3 literals → named constants |
| `src/features/nudge-engine/rules.ts` | Modified | 9 literals → named constants |
| `src/shared/services/rationValidator.ts` | Modified | 1 literal → named constant |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Wrong constant value | Low | 510-test safety net catches mismatches |
| Missed literal | Medium | Manual scan of each file — confirm no overlooks |

## Rollback Plan

`git checkout -- src/` reverts all changes. Tests confirm exact behavior.

## Dependencies

None.

## Success Criteria

- [ ] 510 tests pass (same count as baseline)
- [ ] `pnpm typecheck` clean
- [ ] No `pnpm lint` regressions
