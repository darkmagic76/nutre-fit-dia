# Tasks: aesan-tubers-and-cooked-distinction

## TDD Approach
Each work unit follows RED → GREEN → REFACTOR cycle. Tests written FIRST, then implementation. Every work unit ends with `pnpm test:run` confirming all existing tests still pass.

## Work Units

### WU1: Domain model — FoodCategory enum + preparationState enum
**Spec coverage**: R1, M1

- [ ] T1: Write test — `FoodCategory.TUBERS` equals `'tubers'`
- [ ] T2: Write test — Zod schema accepts `{ category: 'tubers', ... }`
- [ ] T3: Write test — Zod schema rejects `{ category: 'tuber', ... }` (singular typo)
- [ ] T4: Write test — `preparationState` defaults to `'as-stored'` for existing foods
- [ ] T5: Write test — `preparationState: 'cooked'` is accepted by FoodSchema
- [ ] T6: Write test — `preparationState: 'raw'` (invalid value) is rejected by FoodSchema
- [ ] T7: Add `TUBERS: 'tubers'` to `FoodCategory` enum in `src/domain/foodCategory.ts`
- [ ] T8: Add `'tubers'` to `FoodCategorySchema` Zod union
- [ ] T9: Add `preparationState: z.enum(['as-stored', 'cooked']).default('as-stored')` to FoodSchema in `src/domain/food.ts`
- [ ] T10: Run `pnpm test:run` — all existing tests pass

### WU2: Domain model — RATION_LIMITS + AESAN_GRAM_STANDARDS + CountByCategory
**Spec coverage**: R2, R3, R7

- [ ] T11: Write test — `RATION_LIMITS[TUBERS]` is `{ max: 5, unit: 'week' }` with no `min`
- [ ] T12: Write test — `AESAN_GRAM_STANDARDS[TUBERS]` is `{ min: 150, max: 200 }`
- [ ] T13: Write test — `defaultRationCounts()` includes `[TUBERS]: 0`
- [ ] T14: Write test — `countRations()` with 2 tuber foods returns `counts[TUBERS] === 2`
- [ ] T15: Add `TUBERS` entry to `RATION_LIMITS` in `src/domain/rationValidator.ts`
- [ ] T16: Add `TUBERS` entry to `AESAN_GRAM_STANDARDS` in `src/domain/rationValidator.ts`
- [ ] T17: Add `[FoodCategory.TUBERS]: number` to `CountByCategory` interface
- [ ] T18: Add `[FoodCategory.TUBERS]: 0` to `defaultRationCounts()`
- [ ] T19: Run `pnpm test:run` — all existing tests pass

### WU3: Domain model — validateFoodPortions with preparationState skip
**Spec coverage**: M2, R5 (skip scenario), R6 (skip scenario)

- [ ] T20: Write test — cooked legume (150g, `preparationState: 'cooked'`) produces NO alerts
- [ ] T21: Write test — cooked cereal (180g, `preparationState: 'cooked'`) produces NO alerts
- [ ] T22: Write test — dry legume (30g, `preparationState: 'as-stored'`) produces PORTION_TOO_SMALL warning
- [ ] T23: Write test — dry legume (150g, `preparationState: 'as-stored'`) produces PORTION_TOO_LARGE critical alert
- [ ] T24: Write test — tuber food (175g, `preparationState: 'as-stored'`) produces NO alerts (within 150-200)
- [ ] T25: Write test — tuber food (100g, `preparationState: 'as-stored'`) produces PORTION_TOO_SMALL warning
- [ ] T26: Write test — tuber food (250g, `preparationState: 'as-stored'`) produces PORTION_TOO_LARGE critical alert
- [ ] T27: Modify `validateFoodPortions()` to skip gram validation when `food.preparationState === 'cooked'`
- [ ] T28: Run `pnpm test:run` — all existing tests pass

### WU4: Domain model — validateWeeklyRations includes TUBERS
**Spec coverage**: R8, M3

- [ ] T29: Write test — 6 tuber rations/week triggers `over` violation with `limit: 5`
- [ ] T30: Write test — 5 tuber rations/week is valid (no violation)
- [ ] T31: Write test — 0 tuber rations/week is valid (no minimum for tubers)
- [ ] T32: Add `FoodCategory.TUBERS` to `weeklyCategories` array in `validateWeeklyRations()`
- [ ] T33: Run `pnpm test:run` — all existing tests pass

### WU5: Catalog — tuber foods + cooked legume/cereal entries
**Spec coverage**: R4, R5, R6, NR2

- [ ] T34: Write test — `tuber-patata` exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 77`
- [ ] T35: Write test — `tuber-boniato` exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 86`
- [ ] T36: Write test — `tuber-name` exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 118`
- [ ] T37: Write test — `legume-lentejas-cocido` exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`
- [ ] T38: Write test — `legume-garbanzos-cocido` exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`
- [ ] T39: Write test — `legume-alubias-cocido` exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`
- [ ] T40: Write test — `cereal-arroz-integral-cocido` exists with `category: 'cereals'`, `gramsPerRation: 180`, `preparationState: 'cooked'`
- [ ] T41: Write test — `cereal-pasta-integral-cocida` exists with `category: 'cereals'`, `gramsPerRation: 180`, `preparationState: 'cooked'`
- [ ] T42: Write test — all 39 existing foods remain unchanged (count + spot-check key fields)
- [ ] T43: Add 3 tuber foods to `src/shared/data/foods-data.ts`
- [ ] T44: Add 3 cooked legume entries to `src/shared/data/foods-data.ts`
- [ ] T45: Add 2 cooked cereal entries to `src/shared/data/foods-data.ts`
- [ ] T46: Run `pnpm test:run` — all existing tests pass

### WU6: Infrastructure — TUBERS nudge rules
**Spec coverage**: R11

- [ ] T47: Write test — TUBERS_EXCESS nudge fires when weekly count >= 6
- [ ] T48: Write test — TUBERS_EXCESS nudge does NOT fire when weekly count === 5
- [ ] T49: Write test — no TUBERS_DEFICIT nudge exists
- [ ] T50: Add `TUBERS_EXCESS` nudge rule to `src/infrastructure/nudge/rules.ts`
- [ ] T51: Run `pnpm test:run` — all existing tests pass

### WU7: Application — plan generator weekly slots
**Spec coverage**: R9

- [ ] T52: Write test — `getWeeklySlots()` includes exactly 2 TUBERS slots
- [ ] T53: Write test — the 2 TUBERS slots are on different days (e.g. day 2 and day 5)
- [ ] T54: Write test — `pickSustainableFood(TUBERS, day)` returns a non-processed tuber food
- [ ] T55: Add TUBERS to `getWeeklySlots()` in `src/application/services/planGenerator.ts`
- [ ] T56: Run `pnpm test:run` — all existing tests pass

### WU8: Features — traffic light classification for TUBERS
**Spec coverage**: R10

- [ ] T57: Write test — raw tuber food (patata) classifies as GREEN
- [ ] T58: Write test — processed tuber with occult sugars classifies as RED
- [ ] T59: Add `FoodCategory.TUBERS` to `CATEGORY_DEFAULTS` in `src/features/nutritional-traffic-light/services/classificationService.ts` with `GREEN`
- [ ] T60: Run `pnpm test:run` — all existing tests pass

### WU9: Shared — i18n translations for TUBERS
**Spec coverage**: R12

- [ ] T61: Write test — `es['category.tubers']` equals `'Tubérculos'`
- [ ] T62: Write test — `en['category.tubers']` equals `'Tubers'`
- [ ] T63: Write test — TypeScript compilation succeeds (both locales satisfy Translations interface)
- [ ] T64: Add `'category.tubers': string` to `Translations` interface in `src/shared/i18n/types.ts`
- [ ] T65: Add `category.tubers: 'Tubérculos'` to `src/shared/i18n/es.ts`
- [ ] T66: Add `category.tubers: 'Tubers'` to `src/shared/i18n/en.ts`
- [ ] T67: Run `pnpm test:run` — all existing tests pass

### WU10: Full verification
**Spec coverage**: NR1, NR2, NR3

- [ ] T68: Run `pnpm quality` (format:check → lint → typecheck → test:run) — all green
- [ ] T69: Verify coverage thresholds: statements ≥80%, branches ≥80%, functions 100%, lines ≥80%
- [ ] T70: Verify all 818+ existing tests pass with zero new failures
- [ ] T71: Verify food catalog has 47 entries total (39 existing + 8 new)

## Review Workload Forecast

- **Estimated total changed lines**: ~348 (including tests)
- **400-line budget risk**: Low
- **Chained PRs recommended**: No
- **Decision needed before apply**: No
