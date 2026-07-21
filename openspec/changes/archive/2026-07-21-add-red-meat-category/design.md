# Design: Add RED_MEAT to Canonical FoodCategory

## Technical Approach

Add RED_MEAT as the 11th `FoodCategory` member following existing 10-group patterns. The change is a pure domain model correction — no new features, no UI modifications. Every affected system (enum, schema, limits, substitution, nudges) already has a WHITE_MEAT entry that RED_MEAT mirrors with category-specific values.

PROTEIN_EMISSION_RATIOS already exists in `constants.ts` with `beef: 50, pork: 11, poultry: 7` — no new constant needed. ScoringService uses carbon thresholds, not emission ratios, so it requires no changes.

## Architecture Decisions

### Decision: Enum placement — after WHITE_MEAT, before WATER

| Option | Tradeoff | Decision |
|--------|----------|----------|
| After WHITE_MEAT | Groups all animal proteins (DAIRY→LEGUMES→FISH→EGGS→WHITE_MEAT→RED_MEAT), WATER stays last | **Chosen** |
| Alphabetical (after OLIVE_OIL) | Breaks protein grouping, harder to scan for animal protein | Rejected |
| After EGGS (RED before WHITE) | Arbitrary ordering, less logical for clinical review | Rejected |

**Rationale**: The clinical protein grouping is the dominant axis. ANIMAL_PROTEIN_CATEGORIES benefits from adjacency. WATER is last because it's non-caloric.

### Decision: No planGenerator changes

The proposal scopes this as a domain model correction. Adding RED_MEAT meal slots to `planGenerator.ts` would be a feature change. Out of scope — deferred to a future change.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/domain/foodCategory.ts` | Modify | Add RED_MEAT to enum (line 19), Zod schema (line 34), display names (line 48), animal protein array (line 57) |
| `src/shared/data/foods-data.ts` | Modify | Add 3 red meats (ternera CF 27, cerdo CF 7.5, cordero CF 24). Reclassify chorizo: `WHITE_MEAT` → `RED_MEAT` |
| `src/shared/services/rationValidator.ts` | Modify | Add RED_MEAT to CountByCategory, emptyCounts, RATION_LIMITS (max 3/week), AESAN_GRAM_STANDARDS (100-150g), weeklyCategories |
| `src/shared/sustainability/substitutionService.ts` | Modify | `isTriggerFood`: replace `WHITE_MEAT \|\| CF >= 4.0` with `RED_MEAT` only |
| `src/features/nudge-engine/rules.ts` | Modify | EGGS_RED_MEAT_ALT condition: `WHITE_MEAT > 0` → `RED_MEAT > 0`. Body text: "carnes rojas" |
| `src/features/nudge-engine/rules.test.ts` | Modify | Update EGGS_RED_MEAT_ALT test to check `counts[RED_MEAT]` instead of `counts[WHITE_MEAT]` |
| `src/features/nudge-engine/engine.test.ts` | Modify | Line 71 already uses `FoodCategory.RED_MEAT` — will compile once enum member exists. Add RED_MEAT scenario tests |
| `src/shared/sustainability/substitutionService.test.ts` | Modify | Replace WHITE_MEAT trigger tests with RED_MEAT equivalents. Remove CF≥4.0 heuristic tests |
| `src/shared/services/rationValidator.test.ts` | Modify | Add RED_MEAT to weekly validation tests, AESAN standards count, CountByCategory coverage |
| `adr/ADR-005-food-category-canonical-model.md` | Modify | Amend to 11 groups, document RED_MEAT clinical rationale (EAT-Lancet) |

## Interfaces / Contracts

```ts
// New enum member and associated entries
FoodCategory.RED_MEAT = 'red_meat'

// RATION_LIMITS addition
[FoodCategory.RED_MEAT]: { max: 3, unit: 'week' }

// AESAN_GRAM_STANDARDS addition
[FoodCategory.RED_MEAT]: { min: 100, max: 150 }

// CountByCategory addition (inserted between WHITE_MEAT and WATER)
[FoodCategory.RED_MEAT]: number

// isTriggerFood replacement
// OLD: food.category === WHITE_MEAT || (food.carbonFootprint ?? 0) >= 4.0
// NEW: food.category === FoodCategory.RED_MEAT
```

## Data Flow

```
FoodCategory.RED_MEAT added to enum
        │
        ├──→ ANIMAL_PROTEIN_CATEGORIES ──→ animalProteinCount checks
        │         (DAIRY_CALCIUM_NUDGE)
        │
        ├──→ CountByCategory / emptyCounts / countRations
        │         (all ration validation + nudge context building)
        │
        ├──→ RATION_LIMITS (max 3/week) ──→ validateWeeklyRations
        │         (weeklyCategories array updated)
        │
        ├──→ isTriggerFood(RED_MEAT) ──→ suggestAlternative
        │         (legumes + blue fish returned)
        │
        ├──→ EGGS_RED_MEAT_ALT condition ──→ NudgeEngine
        │         (counts[RED_MEAT] > 0)
        │
        └──→ AESAN_GRAM_STANDARDS ──→ validateFoodPortions
                  (100-150g standard)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (rationValidator) | RED_MEAT limits, weekly validation, gram standards, countRations | Add tests: within limit (3), exceeds (4), portion too small (80g), portion too large (200g). Update AESAN count from 10→11 |
| Unit (substitutionService) | RED_MEAT triggers, non-RED-MEAT doesn't, chorizo triggers via category | Replace existing WHITE_MEAT tests with RED_MEAT equivalents. Remove CF≥4.0 tests. Add: conejo (WHITE_MEAT, CF 4.0) does NOT trigger |
| Unit (rules) | EGGS_RED_MEAT_ALT fires on RED_MEAT, not WHITE_MEAT. WHITE_MEAT_RESTRICT unchanged | Update EGGS_RED_MEAT_ALT test to use `counts[RED_MEAT]`. Add negative test: WHITE_MEAT alone does not fire |
| Unit (engine) | buildNudgeContext works with RED_MEAT food. Line 71 compiles | Line 71 already references RED_MEAT — verify it passes. Add scenario: red meat food generates score + alternatives |
| Integ (nudgeEngine) | Full pipeline with RED_MEAT: build→evaluate→enqueue | Check existing integration test passes with new category |

## Migration / Rollout

No migration required. This is mock data in an offline app. Chorizo reclassification is a direct field change. No stored user data affected.

## Open Questions

- [ ] Should `classificationService.ts` assign a traffic light color to RED_MEAT? Currently only WHITE_MEAT maps to ORANGE. Deferred — traffic light is a UI concern, out of scope for domain model correction.
- [ ] Should `planGenerator.ts` include RED_MEAT meal slots (like WHITE_MEAT on days 3,7)? Deferred — this is a meal planning feature, not a domain model fix.
