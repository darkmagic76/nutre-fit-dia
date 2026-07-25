# Proposal: Centralize Clinical Thresholds & Feature Barrels

## Intent

Two low-risk maintainability refactorings:
1. **Threshold centralization**: 13 clinical/behavioral constants scattered in `src/shared/nudge/rules.ts` (lines 17-41) belong in the existing `src/shared/constants/clinical.ts`. Current clinical.ts only has `CEREAL_RESTRICTED_MAX = 4` — its declared purpose.
2. **Feature barrels**: 6 feature directories lack barrel `index.ts` files, forcing deep import paths in `App.tsx` (e.g., `../../features/recipe-engine/RecipeEngine`). Barrels simplify consumer imports.

## Scope

### In Scope
- Move 13 constants from `rules.ts` → `clinical.ts` (`VEGETABLE_NUDGE_HOUR_THRESHOLD`, `HIGH_GLYCEMIC`, `CEREAL_EXCESS_MAX`, `CEREAL_DEFICIT_MIN`, `FRUIT_DEFICIT_MIN`, `VEGETABLE_DEFICIT_MIN`, `LEGUME_DEFICIT_MIN`, `DAIRY_DEFICIT_MIN`, `PROTEIN_DEFICIT_MIN`, `FISH_DEFICIT_MIN`, `RED_MEAT_MAX`, `WHITE_MEAT_MAX`, `EGG_MIN`)
- Re-export `VEGETABLE_NUDGE_HOUR_THRESHOLD` through `@shared/nudge/index.ts` to preserve `vegetable-nudge-timegate` spec contract
- Create `index.ts` barrels in 6 feature dirs: nutritional-traffic-light, med-diet-validator, metabolic-tracker, recipe-engine, sustainability, nudge-engine
- Update `App.tsx` imports (7 deep imports → barrel imports)

### Out of Scope
- No behavioral changes to nudge rules, violations, or thresholds
- No test modifications — 578 existing tests unaffected
- No new features or UI changes
- No new OpenSpec capability specs

## Capabilities

### New Capabilities
None — pure refactoring, no new spec-level behavior.

### Modified Capabilities
None — `REQ-VEGETABLE-NUDGE-TIMEGATE-CONSTANT` (vegetable-nudge-timegate spec) requires export from `@shared/nudge`; the re-export preserves this contract unchanged.

## Approach

**Thresholds**: Move 13 `const` declarations from `rules.ts` to `clinical.ts` (append to existing file). Import them back into `rules.ts` from `@shared/constants/clinical`. Update 3 files: `rules.ts` (import source), `DailyViolations.tsx`, `DailyViolations.test.tsx` (both import `VEGETABLE_NUDGE_HOUR_THRESHOLD` from `@shared/nudge` — the re-export path stays the same).

**Barrels**: Each feature `index.ts` re-exports the Container component only. nudge-engine's existing `index.ts` already exports hooks/services — add the Container export.

**Scope Rule validation**: clinical.ts is in `shared/` because clinical thresholds are consumed by 2+ features (nudge-engine, daily-violations rendering). Barrel files are feature-local — no shared code.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/constants/clinical.ts` | Modified | Append 13 constants, existing `CEREAL_RESTRICTED_MAX` unchanged |
| `src/shared/nudge/rules.ts` | Modified | Replace inline constants with imports from clinical.ts |
| `src/shared/nudge/index.ts` | Modified | Add re-export of `VEGETABLE_NUDGE_HOUR_THRESHOLD` |
| `src/features/daily-violations/DailyViolations.tsx` | Modified | Import path unchanged (`@shared/nudge`) — no-op for this file |
| `src/features/*/index.ts` (6 dirs) | New | Barrel re-exporting Container component |
| `src/App.tsx` | Modified | Replace 7 deep imports with barrel imports |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Import breakage from path changes | Low | Only 3 files touched; TypeScript compiler catches at build |
| Re-export contract violation | Low | Preserve `@shared/nudge` export path; verify via `pnpm typecheck` |
| Barrel creates circular dependency | Low | Barrels export Container only; Containers import shared, not vice versa |

## Rollback Plan

`git revert` the single commit. Zero data migration, zero persistence impact.

## Dependencies

None. No external libraries, no API changes, no database migrations.

## Success Criteria

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm test:run` passes — all 578 tests green
- [ ] `pnpm lint` passes with zero warnings
- [ ] `src/App.tsx` uses barrel imports for all 7 feature Containers
- [ ] `VEGETABLE_NUDGE_HOUR_THRESHOLD` importable from `@shared/nudge` (re-export intact)
- [ ] `CEREAL_RESTRICTED_MAX` remains at its current value in clinical.ts
