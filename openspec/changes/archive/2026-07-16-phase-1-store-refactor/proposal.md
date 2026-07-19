# Proposal: Phase 1 — God Store → Per-Feature Stores

## Intent

Split the monolithic Zustand `appStore.ts` into per-feature stores per ADR-009, eliminate the bidirectional dependency `shared/↔features/` (ADR-001 violation), and fix 4 medium-severity issues found in exploration.

## Scope

### In Scope
- Create `trackerStore`, `logStore`, `planStore` in `src/features/*/store/`
- Create placeholder `scannerStore` structure
- Extract `sanitizeNumeric()` → `src/shared/utils/sanitize.ts` (fix multiple-decimal bug)
- Extract `computeIMC()` → `src/shared/utils/imc.ts`
- Extract `CATEGORY_DISPLAY_NAMES` → `src/shared/domain/foodCategory.ts`
- Fix `setGender` — replace type assertion with Zod schema validation
- Update 4 containers to use feature-specific stores
- Delete `src/shared/store/appStore.ts`

### Out of Scope
- Database persistence layer (deferred to Supabase integration)
- `scannerStore` full implementation (placeholder only)
- Container component refactoring — store adapters only
- New tests (existing 68 verify behavior; adapt imports)

## Capabilities

### New Capabilities
- `tracker-store`: Metabolic profile — weight, height, age, gender, PAF, caloricTarget
- `log-store`: Today's food log — entries, validation, add/remove
- `plan-store`: Weekly plan — restrictionActive flag, plan generation
- `scanner-store`: Placeholder for scan history (deferred to later phase)
- `shared-utils`: `sanitizeNumeric()` + `computeIMC()` as pure, testable functions
- `food-category-display`: Canonical Spanish display names for 10 FoodCategory groups

### Modified Capabilities
None — first SDD cycle, no existing specs.

## Approach

Mechanical refactor in 3 strata:
1. **Shared utils** (zero deps) — extract sanitize, IMC, category display names
2. **Per-feature stores** — each owns its state slice, imports only its domain services
3. **Container updates** — swap `useAppStore()` for feature-specific hook

Cross-feature reads (log reads caloricTarget from tracker) use Zustand `getState()`. Domain services unchanged — domain isolation preserved per ADR-001/ADR-004.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/store/appStore.ts` | Removed | Deleted after extraction |
| `src/shared/utils/sanitize.ts` | New | sanitizeNumeric + sanitizeGender |
| `src/shared/utils/imc.ts` | New | computeIMC pure function |
| `src/shared/domain/foodCategory.ts` | Modified | Add DISPLAY_NAMES constant |
| `src/features/*/store/*.ts` | New | 4 feature stores |
| `src/features/*/*Container.tsx` | Modified | Store import swap |
| `src/App.test.tsx` | Modified | Remove appStore import path |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regression in caloric calculation | Low | 68 existing tests + identical IMC formula |
| Cross-feature import cycle | Low | Zustand getState() avoids cycle |
| Container misses store slice | Low | TypeScript catches missing fields |

## Rollback Plan

Revert single squash commit: `git revert HEAD`. If merged incrementally, revert feature-store commits in reverse order. Old `appStore.ts` remains in git history for reference until archive.

## Dependencies

- TypeScript 6.0.2 (type safety across module boundaries)
- Zustand 5.0.8 (multiple stores supported natively)

## Success Criteria

- [ ] `src/shared/store/appStore.ts` deleted
- [ ] All 4 containers render identically before and after
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:run` passes (68 existing tests)
- [ ] No remaining `import ... from '@shared/store/appStore'` in feature code
- [ ] No remaining `import ... from '@features/*'` in `src/shared/`
