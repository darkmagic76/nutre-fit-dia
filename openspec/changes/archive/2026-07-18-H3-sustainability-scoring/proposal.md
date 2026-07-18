# Proposal: H3 - Sustainability Scoring Core

## Intent

Provide a composable environmental score (0–100) for food items to enable dual qualification (health + sustainability) across Scanner, RecipeEngine, and NudgeEngine. Required by INFORME_ADR FR-2.2, SPECS_TECH §4/§7, and RNF-03.

## Scope

### In Scope
- Domain types: `EnvironmentalScore`, `Seasonality`, `Proximity`, `PackagingLevel`
- Carbon footprint thresholds and category scoring (AESAN 2022 / EAT-Lancet)
- Protein emission ratios (legumes baseline 1×, beef 50×)
- Weighted composite algorithm: carbon 50%, seasonality 30%, proximity 20%
- `computeEnvironmentalScore(food)` → `EnvironmentalScore` service with 14 unit tests
- `pickSustainableFood()` in `planGenerator.ts` for sustainability-ranked food selection

### Out of Scope
- Water footprint scoring (V2)
- Packaging level scoring (V2)
- Substitution service (`suggestAlternative`) — tracked as M1
- Nudge integration (`environmentalScore < 30` trigger) — tracked as M2

## Capabilities

### New Capabilities
- `sustainability-scoring`: Core scoring module — types, reference constants, and composite scoring algorithm for food sustainability, exposed via `@shared/sustainability`

### Modified Capabilities
- None — RecipeEngine integration is internal sorting only, no spec-level behavior change to plan-store

## Approach

V1 simplified weighted composite per ADR-007:
- **Carbon** (50%): Maps `carbonFootprint` to thresholds (very_low < 0.5 → low < 1.5 → moderate < 3.0 → high < 5.0 → very_high). Missing data → neutral 50.
- **Seasonality** (30%): `isSeasonal` → in_season (100), else out_of_season (30)
- **Proximity** (20%): Inferred from seasonality — seasonal → km0 (100), non-seasonal → national (60)
- **Packaging** / **Water**: Defaults to BULK / 0 for V1, deferred to V2

Module placed in `shared/sustainability/` per ADR-001 Scope Rule (consumed by 4+ features). Reference data from AESAN 2022 and EAT-Lancet as static constants — auditable, configurable, no magic numbers.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/sustainability/types.ts` | New | Enums + EnvironmentalScore interface |
| `src/shared/sustainability/constants.ts` | New | AESAN ratios, thresholds, weights, scores |
| `src/shared/sustainability/scoringService.ts` | New | Composite scoring algorithm |
| `src/shared/sustainability/scoringService.test.ts` | New | 14 unit tests (all ✅) |
| `src/shared/sustainability/index.ts` | New | Public API surface |
| `src/features/recipe-engine/services/planGenerator.ts` | Modified | pickFood → pickSustainableFood (internal sort) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Carbon thresholds inaccurate for local produce | Low | AESAN 2022 reference; constants are configurable |
| Seasonality binary (true/false) too coarse | Med | V2 can add month-based calendar |
| Score weights are clinical decision | Med | Defaults documented; needs dietitian review for production |

## Rollback Plan

1. Remove `computeEnvironmentalScore` import from `planGenerator.ts`
2. Restore `pickFood` to original sequential/random selection
3. Delete `src/shared/sustainability/` directory
4. All 14 tests removed; existing plan tests unaffected

## Dependencies

None — independent module with zero external dependencies.

## Success Criteria

- [ ] `computeEnvironmentalScore` returns 0–100 for all food categories
- [ ] Best-case food (vegetable, seasonal, low carbon) scores ≥ 80
- [ ] Worst-case food (red meat, non-seasonal, high carbon) scores ≤ 40
- [ ] `pickSustainableFood` returns lower-carbon foods first in weekly plan
- [ ] 14 unit tests passing (already ✅)
