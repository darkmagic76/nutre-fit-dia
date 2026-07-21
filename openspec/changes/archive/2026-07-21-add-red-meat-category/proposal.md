# Proposal: Add RED_MEAT to Canonical FoodCategory

## Intent

The domain model has a semantic knot: ADR-007, ADR-008, and SPECS_TECH §4 reference RED_MEAT as a food group, but the canonical model (ADR-005) only defines WHITE_MEAT. The code works around this with a heuristic (`carbonFootprint >= 4.0`) that conflates red meat with high-carbon white meat (e.g., conejo at 4.0). `engine.test.ts:71` already references `FoodCategory.RED_MEAT` — confirmation the codebase expects this category.

## Scope

### In Scope
- Add `RED_MEAT` to `FoodCategory` enum, Zod schema, `ANIMAL_PROTEIN_CATEGORIES`, `CATEGORY_DISPLAY_NAMES`
- Add 3 red meat foods (ternera, cerdo, cordero) + reclassify chorizo from WHITE_MEAT
- Fix `substitutionService.isTriggerFood`: trigger on RED_MEAT, remove `>= 4.0` heuristic
- Fix `EGGS_RED_MEAT_ALT` nudge rule: check RED_MEAT, not WHITE_MEAT
- Add `RATION_LIMITS` and `AESAN_GRAM_STANDARDS` entries for RED_MEAT
- Add `CountByCategory` and `emptyCounts` entries for RED_MEAT
- Amend ADR-005: document 11th group with clinical justification

### Out of Scope
- UI changes (classification, substitution, nudges use existing pipelines)
- New features — pure domain model correction
- EGGS_RED_MEAT_ALT rule logic change (eggs as red meat alternative is correct per Mediterranean diet)

## Capabilities

### New Capabilities
- `food-category-red-meat`: Canonical RED_MEAT group as 11th FoodCategory member

### Modified Capabilities
- `food-category-display`: Add RED_MEAT entries to ANIMAL_PROTEIN_CATEGORIES, CATEGORY_DISPLAY_NAMES, Zod union
- `substitution-service`: Trigger on RED_MEAT category instead of WHITE_MEAT + heuristic
- `sustainability-scoring`: Update PROTEIN_EMISSION_RATIOS to include beef(50×), pork(11×) separate from poultry(7×)
- `nudge-engine`: Fix EGGS_RED_MEAT_ALT condition; verify WHITE_MEAT_RESTRICT still guards WHITE_MEAT only
- `cultural-metadata`: Chorizo reclassification from WHITE_MEAT to RED_MEAT preserves cultural metadata

## Approach

Follow existing 10-group patterns. RED_MEAT becomes the 11th canonical group:
- **Enum/schema/arrays**: mirror WHITE_MEAT pattern entries
- **Food catalog**: ternera (CF 27), cerdo (CF 7.5), cordero (CF 24); chorizo moves to RED_MEAT
- **Substitution**: trigger gate becomes `food.category === FoodCategory.RED_MEAT` — no heuristic
- **Nudge**: EGGS_RED_MEAT_ALT checks `counts[FoodCategory.RED_MEAT] > 0`
- **Ration limits**: max 3/week per Mediterranean diet guidelines (AESAN 2022)
- **ADR-005**: appendix documenting 11th group, clinical rationale, emission ratios

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/domain/foodCategory.ts` | Modified | Add RED_MEAT to enum, schema, display names, animal protein |
| `src/shared/data/foods-data.ts` | Modified | 3 new red meats + chorizo reclassified |
| `src/shared/sustainability/substitutionService.ts` | Modified | Trigger on RED_MEAT, drop heuristic |
| `src/shared/sustainability/scoringService.ts` | Modified | PROTEIN_EMISSION_RATIOS with RED_MEAT entries |
| `src/shared/services/rationValidator.ts` | Modified | RED_MEAT limits + AESAN grams + CountByCategory |
| `src/features/nudge-engine/rules.ts` | Modified | EGGS_RED_MEAT_ALT condition fix |
| `src/features/nudge-engine/*.test.ts` | Modified | Update test expectations for new category |
| `adr/ADR-005-food-category-canonical-model.md` | Modified | 11th group amendment |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Chorizo reclassification breaks existing meal entries | Low | Data migration: all WHITE_MEAT chorizo → RED_MEAT is a rename, not removal |
| PROTEIN_EMISSION_RATIOS not yet in source code (in ADR only) | Medium | Verify before implementing; if absent, create constants module first |
| Tests referencing WHITE_MEAT in substitution/nudge context | High | Audit all test files; update where RED_MEAT is intended behavior |
| `engine.test.ts:71` uses `FoodCategory.RED_MEAT` already | Low | Test will compile once enum member exists — confirms merge intent |

## Rollback Plan

1. Revert `FoodCategory.RED_MEAT` additions in enum/schema/arrays
2. Restore `isTriggerFood` heuristic `carbonFootprint >= 4.0` and WHITE_MEAT trigger
3. Move chorizo, ternera, cerdo, cordero back to WHITE_MEAT
4. Revert EGGS_RED_MEAT_ALT condition to WHITE_MEAT
5. Roll back ADR-005 amendment

## Dependencies

- None (no external APIs, no infra changes)

## Success Criteria

- [ ] `FoodCategory.RED_MEAT` compiles and is Zod-validated
- [ ] `engine.test.ts:71` passes — `FoodCategory.RED_MEAT` exists in enum
- [ ] `isTriggerFood` triggers on chorizo (RED_MEAT) without heuristic
- [ ] EGGS_RED_MEAT_ALT fires when RED_MEAT > 0 && !hasEggs
- [ ] WHITE_MEAT_RESTRICT still applies only to WHITE_MEAT
- [ ] Chorizo carbon footprint (8.0) triggers substitution through category, not heuristic
- [ ] All existing tests pass; new RED_MEAT tests added per TDD
- [ ] ADR-005 amended with 11th group documentation
