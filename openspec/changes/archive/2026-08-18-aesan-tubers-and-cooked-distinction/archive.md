# Archive Report: aesan-tubers-and-cooked-distinction

## Status: ✅ COMPLETED

## Summary

Added the TUBERS food category to the AESAN 2022 compliance model and introduced a `preparationState` enum (`'as-stored' | 'cooked'`) to the Food schema, enabling separate catalog entries for dry and cooked forms of legumes and cereals. This closes two AESAN 2022 gaps: tuber ration limits (150–200 g/ration, max 5/week) and the dry/cooked weight distinction for meal planning accuracy.

## Scope Delivered

| Planned | Delivered | Notes |
|---------|-----------|-------|
| TUBERS category in enum + schema | ✅ | `FoodCategory.TUBERS = 'tubers'` |
| RATION_LIMITS + AESAN_GRAM_STANDARDS for TUBERS | ✅ | `{ max: 5, unit: 'week' }`, `{ min: 150, max: 200 }` |
| 3 tuber foods in catalog | ✅ | patata, boniato, ñame (175 g each) |
| 3 cooked legume entries | ✅ | lentejas, garbanzos, alubias cocidos (150 g) |
| 2 cooked cereal entries | ✅ | arroz integral, pasta integral cocidos (180 g) |
| `preparationState` enum on FoodSchema | ✅ | `'as-stored' | 'cooked'`, default `'as-stored'` |
| Skip gram validation for cooked entries | ✅ | Early-exit in `validateFoodPortions()` |
| TUBERS in weekly validation | ✅ | Added to `weeklyCategories` array |
| TUBERS in CountByCategory + defaultRationCounts | ✅ | |
| TUBERS in plan generator (2 slots/week) | ✅ | Days 2 and 5 |
| TUBERS in traffic light (GREEN default) | ✅ | |
| TUBERS_EXCESS nudge rule | ✅ | SYSTEM_ACTION, fires at >5/week |
| i18n for TUBERS (ES/EN) | ✅ | "Tubérculos" / "Tubers" |
| All tests pass + coverage thresholds | ✅ | 866 tests, all green |
| pnpm quality green | ✅ | format + lint + typecheck + test |

**No scope deviations.** All 16 spec requirements (R1–R12, M1–M3, NR1–NR3) verified PASS.

## Commits

| # | Commit | Purpose |
|---|--------|---------|
| 1 | `feat(domain): add TUBERS to ration limits, gram standards, and counts` | WU1–WU2: enum, schema, RATION_LIMITS, AESAN_GRAM_STANDARDS, CountByCategory, defaultRationCounts |
| 2 | `feat(domain): skip gram validation for cooked-preparation foods` | WU3: early-exit in `validateFoodPortions()` for `preparationState === 'cooked'` |
| 3 | `feat(domain): add TUBERS to weekly validation` | WU4: TUBERS in `weeklyCategories` array |
| 4 | `feat(catalog): add 3 tuber foods + 3 cooked legumes + 2 cooked cereals` | WU5: 8 new catalog entries in foods-data.ts |
| 5 | `feat(infrastructure): add TUBERS_EXCESS nudge rule + i18n keys` | WU6 + partial WU9: nudge rule + i18n translations |
| 6 | `feat(application): add TUBERS slots to weekly plan generator` | WU7: 2 tuber slots on days 2 and 5 |
| 7 | `feat(features+shared): add TUBERS classification tests + i18n tests` | WU8 + WU9: traffic light GREEN + i18n tests |
| 8 | `chore: remove unused variable in planGenerator test` | WU10: cleanup |

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| `src/domain/foodCategory.ts` | Add TUBERS to enum + schema | +2 |
| `src/domain/foodCategory.test.ts` | TUBERS enum + schema tests | +15 |
| `src/domain/food.ts` | Add `preparationState` field to FoodSchema | +2 |
| `src/domain/food.test.ts` | preparationState default/valid/invalid tests | +47 |
| `src/domain/rationValidator.ts` | TUBERS in limits, standards, counts, weekly validation; cooked skip | +11 |
| `src/domain/rationValidator.test.ts` | TUBERS + cooked validation tests | +153 |
| `src/shared/data/foods-data.ts` | 8 new food entries (3 tubers + 3 cooked legumes + 2 cooked cereals) | +112 |
| `src/shared/data/foods.test.ts` | Catalog entry existence + nutritional data tests | +101 |
| `src/shared/i18n/types.ts` | Add `'category.tubers': string` | +3 |
| `src/shared/i18n/es.ts` | Spanish: "Tubérculos" + nudge keys | +4 |
| `src/shared/i18n/en.ts` | English: "Tubers" + nudge keys | +4 |
| `src/shared/i18n/i18n.test.ts` | i18n TUBERS translation tests | +35 |
| `src/features/nutritional-traffic-light/services/classificationService.ts` | TUBERS → GREEN | +1 |
| `src/features/nutritional-traffic-light/services/classificationService.test.ts` | TUBERS classification tests | +14 |
| `src/infrastructure/nudge/rules.ts` | TUBERS_EXCESS rule | +12 |
| `src/infrastructure/nudge/rules.test.ts` | TUBERS_EXCESS condition tests | +63 |
| `src/application/services/planGenerator.ts` | TUBERS slots in getWeeklySlots() | +3 |
| `src/application/services/planGenerator.test.ts` | TUBERS slot + sustainable food tests | +26 |
| `src/application/services/planGenerator.fallback.test.ts` | Fallback test (removed in cleanup) | +18 |

**Total**: 18 files changed, ~606 insertions, 2 deletions across 8 commits.

## Test Results

- **Total tests**: 866 (818 existing + 48 new)
- **Failures**: 0
- **Coverage thresholds**: All met (statements ≥80%, branches ≥80%, functions 100%, lines ≥80%)
- **Quality pipeline**: `pnpm quality` green (format:check → lint → typecheck → test:run)
- **Build**: `pnpm verify` passes (tsc -b + vite build)

## Spec Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| R1 — TUBERS in enum + Zod schema | ✅ PASS | `foodCategory.ts`, `foodCategory.test.ts` |
| R2 — TUBERS ration limits (max 5/week) | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| R3 — TUBERS gram standards (150–200) | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| R4 — Tuber foods in catalog | ✅ PASS | `foods-data.ts`, `foods.test.ts` |
| R5 — Cooked legume entries + skip validation | ✅ PASS | `foods-data.ts`, `rationValidator.test.ts` |
| R6 — Cooked cereal entries + skip validation | ✅ PASS | `foods-data.ts`, `rationValidator.test.ts` |
| R7 — CountByCategory includes TUBERS | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| R8 — TUBERS in weekly validation | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| R9 — TUBERS in plan generator slots | ✅ PASS | `planGenerator.ts`, `planGenerator.test.ts` |
| R10 — TUBERS in traffic light (GREEN) | ✅ PASS | `classificationService.ts`, `.test.ts` |
| R11 — TUBERS_EXCESS nudge rule | ✅ PASS | `rules.ts`, `rules.test.ts` |
| R12 — i18n for TUBERS | ✅ PASS | `types.ts`, `es.ts`, `en.ts`, `i18n.test.ts` |
| M1 — FoodSchema preparationState enum | ✅ PASS | `food.ts`, `food.test.ts` |
| M2 — validateFoodPortions skips cooked | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| M3 — validateWeeklyRations includes TUBERS | ✅ PASS | `rationValidator.ts`, `rationValidator.test.ts` |
| NR1 — All existing tests pass | ✅ PASS | 818 existing tests unchanged |
| NR2 — Existing foods unaffected | ✅ PASS | 39 original entries unchanged |
| NR3 — Quality pipeline green | ✅ PASS | `pnpm quality` passes |

**16/16 requirements PASS, 0 FAIL.**

## Risks & Resolutions

| Risk | Resolution |
|------|-----------|
| Cooked entries (150 g legumes, 180 g cereals) would fail dry-weight gram validation | Resolved: `validateFoodPortions()` skips gram validation when `preparationState === 'cooked'` — single early-exit, zero impact on existing foods |
| TypeScript Record types incomplete after adding TUBERS enum | Resolved: compile-time safety net caught all missing TUBERS keys in RATION_LIMITS, AESAN_GRAM_STANDARDS, CountByCategory, CATEGORY_DEFAULTS before build passed |
| Plan generator might prefer cooked entries over dry | Mitigated: `pickSustainableFood()` ranks by environmental score; cooked entries have lower kcal density → lower sustainability score → dry entries preferred naturally |
| `preparationState` field proliferates to unnecessary consumers | Mitigated: only consumed by `validateFoodPortions()`; countRations, validateRations, classifyFood, pickSustainableFood all operate on category/isProcessed only |

## Lessons Learned

1. **Separate catalog entries over preparationState field** was the correct architectural choice — no schema migration, no consumer branching, each entry is self-contained with its own nutritional profile.
2. **Early-exit pattern for cooked validation** is cleaner than parallel cooked-weight standards — AESAN defines standards for dry/raw weights only; cooked entries are physical equivalents, not clinical standards.
3. **TDD discipline across 10 work units** with incremental commits kept each change reviewable and prevented regression — 818 existing tests passed throughout with zero failures.
4. **Catalog grew from 39 to 47 entries** with zero changes to existing food data — additive-only changes are the safest path for domain model evolution.
