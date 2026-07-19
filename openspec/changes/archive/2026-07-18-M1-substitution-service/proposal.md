# Proposal: M1 — Sustainable Food Substitution

## Intent

Implement intelligent food substitution per ADR-007 / SPECS_TECH §4. When the scanner identifies a high-carbon protein (red meat / white_meat), suggest protein-equivalent alternatives (legumes, blue fish) with lower environmental impact, ranked by sustainability score. Enables the NudgeEngine (M2) to offer actionable substitutions.

## Scope

### In Scope
- `src/shared/sustainability/substitutionService.ts` — `suggestAlternative(food: Food): Food[]`
- `src/shared/sustainability/substitutionService.test.ts` — TDD unit tests
- `src/shared/sustainability/index.ts` — barrel export update

### Out of Scope
- NudgeEngine / MealPlan integration (M2)
- UI/UX for displaying suggestions
- User profile filtering (`erMedDiet` — deferred to V2)
- RED_MEAT category creation (domain model stays as-is)

## Capabilities

### New Capabilities
- `sustainable-substitution`: Given a high-carbon Food, suggest protein-equivalent alternatives from LEGUMES and FISH (blue) categories, ranked by `computeEnvironmentalScore()` descending, max 3.

### Modified Capabilities
- None

## Approach

`suggestAlternative(food)` in `substitutionService.ts`:
1. **Trigger**: if food is high-carbon (WHITE_MEAT category OR `carbonFootprint >= 4.0`), find alternatives in LEGUMES and FISH categories from `foods-data.ts`
2. **Filter FISH**: select only blue fish using `PROTEIN_EMISSION_RATIOS` (`fish_blue`: 5 vs `fish_white`: 4)
3. **Rank**: all candidates by `computeEnvironmentalScore().score` descending
4. **Return**: top 3 alternatives (empty array if none found or input is already sustainable)

V1 uses the existing in-memory food catalog. No external API calls.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/sustainability/substitutionService.ts` | New | Core `suggestAlternative()` logic |
| `src/shared/sustainability/substitutionService.test.ts` | New | TDD tests (trigger, ranking, edge cases) |
| `src/shared/sustainability/index.ts` | Modified | Add `suggestAlternative` export |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Ambiguous trigger (no RED_MEAT category) | Low | Use `carbonFootprint >= 4.0` as fallback heuristic |
| Blue fish vs white fish distinction | Low | `PROTEIN_EMISSION_RATIOS` keys disambiguate |
| Foods data lacks blue fish metadata | Low | Current data already has fish with emission ratios |

## Rollback Plan

Delete `substitutionService.ts` and `.test.ts`; revert `index.ts` export addition. No downstream consumers yet (M2 is future).

## Dependencies

- `computeEnvironmentalScore()` from scoringService (stable, existing)
- `foods-data.ts` food catalog (stable, existing)
- `PROTEIN_EMISSION_RATIOS` for fish-type filtering

## Success Criteria

- [ ] `suggestAlternative()` returns max 3 alternatives sorted by score descending
- [ ] High-carbon foods (WHITE_MEAT / carbonFootprint >= 4.0) trigger legume + blue fish suggestions
- [ ] Low-carbon foods (legumes, fish) return empty array
- [ ] All tests pass on `pnpm test:run`
