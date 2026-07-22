# Tasks: Add RED_MEAT to Canonical FoodCategory

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250-320 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full RED_MEAT integration | PR 1 | Single PR; under 400 lines; all tests + implementation |

## Phase 1: Foundation — Domain Model + Catalog

- [x] 1.1 **TDD RED**: Write failing test for `FoodCategory.RED_MEAT` in `foodCategory.test.ts` — assert enum member `'red_meat'`, Zod `parse()` passes, `ANIMAL_PROTEIN_CATEGORIES` includes it, `CATEGORY_DISPLAY_NAMES` returns `'Carne roja'`
- [x] 1.2 **TDD GREEN**: Add `RED_MEAT: 'red_meat'` to `FoodCategory` enum (line 18→19), Zod schema (line 33→34), `CATEGORY_DISPLAY_NAMES` (line 47→48), and `ANIMAL_PROTEIN_CATEGORIES` (line 56→57) in `src/shared/domain/foodCategory.ts`
- [x] 1.3 **TDD RED**: Write failing test for `CountByCategory` and `emptyCounts()` — assert `RED_MEAT` key exists, defaults to `0` in `src/shared/services/rationValidator.test.ts`
- [x] 1.4 **TDD GREEN**: Add `[FoodCategory.RED_MEAT]: number` to `CountByCategory` interface and `[FoodCategory.RED_MEAT]: 0` to `emptyCounts()` in `src/shared/services/rationValidator.ts` (lines 68-79, 81-94)
- [x] 1.5 **TDD RED**: Write failing test for `countRations()` — assert RED_MEAT foods increment count in `rationValidator.test.ts`
- [x] 1.6 **TDD GREEN**: Add ternera (CF 27), cerdo (CF 7.5), cordero (CF 24) as new entries; reclassify chorizo `WHITE_MEAT`→`RED_MEAT` in `src/shared/data/foods-data.ts`. Verify `countRations()` increments RED_MEAT via existing pipeline
- [x] 1.7 **REFACTOR**: Run `pnpm typecheck` — ensure no compiler errors from CountByCategory interface expansion; fix any missing RED_MEAT in spread objects

## Phase 2: Service Updates — Substitution + Ration Validation

- [x] 2.1 **TDD RED**: Update `substitutionService.test.ts` — replace WHITE_MEAT trigger tests with RED_MEAT equivalents. Add: chorizo triggers, conejo (WHITE_MEAT, CF 4.0) does NOT trigger. Remove CF≥4.0 heuristic tests (tests: `>=4.0 exactly`, `just-below 4.0`, `high-carbon non-meat`, `white_meat without CF`)
- [x] 2.2 **TDD GREEN**: Change `isTriggerFood` in `src/shared/sustainability/substitutionService.ts` — replace `food.category === FoodCategory.WHITE_MEAT \|\| (food.carbonFootprint ?? 0) >= 4.0` with `food.category === FoodCategory.RED_MEAT`. Update JSDoc comment
- [x] 2.3 **TDD RED**: Add RED_MEAT weekly validation test in `rationValidator.test.ts` — assert `counts[RED_MEAT]=3` passes, `counts[RED_MEAT]=4` fails (over), RED_MEAT not in daily validation. Update AESAN count assertion 10→11
- [x] 2.4 **TDD GREEN**: Add `[FoodCategory.RED_MEAT]: { max: 3, unit: 'week' }` to `RATION_LIMITS`, `[FoodCategory.RED_MEAT]: { min: 100, max: 150 }` to `AESAN_GRAM_STANDARDS`, and `FoodCategory.RED_MEAT` to `weeklyCategories` in `src/shared/services/rationValidator.ts`
- [x] 2.5 **TDD RED**: Add RED_MEAT portion tests — ternera 125g okay, cerdo 80g `PORTION_TOO_SMALL`, cordero 200g `PORTION_TOO_LARGE` in `rationValidator.test.ts`
- [x] 2.6 **VERIFY**: `engine.test.ts:71` already uses `FoodCategory.RED_MEAT` — run `pnpm test:run -- src/features/nudge-engine/engine.test.ts` and confirm it compiles and passes now that enum member exists

## Phase 3: Nudge Engine Fix

- [x] 3.1 **TDD RED**: Update `EGGS_RED_MEAT_ALT` test in `rules.test.ts` — change `counts[WHITE_MEAT]` → `counts[RED_MEAT]`. Add negative test: WHITE_MEAT alone does NOT fire. Add test: `hasEggs=true` suppresses even with RED_MEAT
- [x] 3.2 **TDD GREEN**: Fix `EGGS_RED_MEAT_ALT` condition in `src/features/nudge-engine/rules.ts` (line 136) — change `counts[FoodCategory.WHITE_MEAT] > 0` → `counts[FoodCategory.RED_MEAT] > 0`. Update body to `'Los huevos son alternativa preferente a carnes rojas.'`
- [x] 3.3 **VERIFY**: `WHITE_MEAT_RESTRICT` rule unchanged — confirm existing test still passes with WHITE_MEAT condition

## Phase 4: Documentation + Full Verification

- [x] 4.1 Amend `adr/ADR-005-food-category-canonical-model.md` — document 11th group RED_MEAT, EAT-Lancet clinical rationale, emission ratios, max 3/week constraint
- [x] 4.2 Run `pnpm test:run && pnpm typecheck` — all tests green, zero TS errors
- [x] 4.3 Run `pnpm verify` — lint + typecheck + test:run + build all pass
