# Delta Spec: aesan-tubers-and-cooked-distinction

## Context

AESAN 2022 (pág. 52) explicitly includes **tubers** ("tubérculos") as a distinct food group with its own ration recommendation (150–200 g/ration, "consumo moderado") and distinguishes between **dry weight** (legumes 50–60 g en seco, cereals 40–60 g pan / 60–80 g seco pasta/arroz) and **cooked weight** for meal planning. Neither concept exists in the current domain model.

This spec adds the TUBERS category and cooked-weight catalog entries via a `preparationState` enum field on the Food schema (`'as-stored' | 'cooked'`, default `'as-stored'`). This is a clean architectural decision that avoids the boolean trap and provides extensibility for future preparation states.

---

## ADDED Requirements

### Requirement: R1 — TUBERS category in enum and Zod schema

`FoodCategory.TUBERS = 'tubers'` MUST exist in the domain enum AND `FoodCategorySchema` MUST validate `'tubers'` as a valid category value.

#### Scenario: TUBERS exists in FoodCategory enum

- GIVEN the FoodCategory enum
- WHEN accessing `FoodCategory.TUBERS`
- THEN the value is `'tubers'`

#### Scenario: Zod schema accepts TUBERS

- GIVEN a food object `{ category: 'tubers', ... }` with all other required fields
- WHEN `FoodSchema.parse()` is called
- THEN parsing succeeds without error

#### Scenario: Zod schema rejects invalid category

- GIVEN a food object `{ category: 'tuber', ... }` (singular, not matching enum)
- WHEN `FoodSchema.parse()` is called
- THEN a Zod validation error is thrown

### Requirement: R2 — TUBERS ration limits (max 5/week)

`RATION_LIMITS[FoodCategory.TUBERS]` MUST be `{ max: 5, unit: 'week' }`. Tubers have no daily minimum — only a weekly cap per AESAN "consumo moderado".

#### Scenario: TUBERS weekly limit is 5

- GIVEN `RATION_LIMITS[FoodCategory.TUBERS]`
- WHEN reading the limit
- THEN `max` is `5` and `unit` is `'week'`
- AND `min` is `undefined`

#### Scenario: TUBERS has no daily limit

- GIVEN `RATION_LIMITS[FoodCategory.TUBERS]`
- WHEN checking for a daily constraint
- THEN there is no daily max (no separate daily override like NUTS has)

### Requirement: R3 — TUBERS gram standards (min 150, max 200)

`AESAN_GRAM_STANDARDS[FoodCategory.TUBERS]` MUST be `{ min: 150, max: 200 }` per AESAN 2022 pág. 52 tuber portion range.

#### Scenario: TUBERS gram range is 150–200 g

- GIVEN `AESAN_GRAM_STANDARDS[FoodCategory.TUBERS]`
- WHEN reading the standard
- THEN `min` is `150` and `max` is `200`

#### Scenario: Tuber food at 175 g passes portion validation

- GIVEN a tuber food with `gramsPerRation: 175`
- WHEN `validateFoodPortions()` is called
- THEN no safety alerts are returned for this food

#### Scenario: Tuber food at 100 g triggers warning

- GIVEN a tuber food with `gramsPerRation: 100`
- WHEN `validateFoodPortions()` is called
- THEN a `PORTION_TOO_SMALL` warning alert is returned

#### Scenario: Tuber food at 250 g triggers critical alert

- GIVEN a tuber food with `gramsPerRation: 250`
- WHEN `validateFoodPortions()` is called
- THEN a `PORTION_TOO_LARGE` critical alert is returned

### Requirement: R4 — Tuber foods in catalog

Three tuber foods MUST be added to the catalog: patata (175 g), boniato (175 g), and ñame (175 g). Each with realistic AESAN nutritional data.

#### Scenario: Patata exists in catalog

- GIVEN the food catalog (`foods`)
- WHEN finding food by id `tuber-patata`
- THEN it exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 77`

#### Scenario: Boniato exists in catalog

- GIVEN the food catalog
- WHEN finding food by id `tuber-boniato`
- THEN it exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 86`

#### Scenario: Ñame exists in catalog

- GIVEN the food catalog
- WHEN finding food by id `tuber-name`
- THEN it exists with `category: 'tubers'`, `gramsPerRation: 175`, `kcalPer100g: 118`

#### Scenario: All tuber foods are natural (non-processed)

- GIVEN each tuber food in the catalog
- WHEN checking `isProcessed`
- THEN it is `false` (or `undefined`, defaulting to `false`)

### Requirement: R5 — Cooked legume entries with `preparationState: 'cooked'`

Three cooked legume entries MUST be added: lentejas-cocido (150 g), garbanzos-cocido (150 g), alubias-cocido (150 g). Each has `preparationState: 'cooked'`. `validateFoodPortions()` MUST skip gram validation for entries with this preparation state.

#### Scenario: Cooked lentils exist with cooked preparation state

- GIVEN the food catalog
- WHEN finding food by id `legume-lentejas-cocido`
- THEN it exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`

#### Scenario: Cooked chickpeas exist with cooked preparation state

- GIVEN the food catalog
- WHEN finding food by id `legume-garbanzos-cocido`
- THEN it exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`

#### Scenario: Cooked beans exist with cooked preparation state

- GIVEN the food catalog
- WHEN finding food by id `legume-alubias-cocido`
- THEN it exists with `category: 'legumes'`, `gramsPerRation: 150`, `preparationState: 'cooked'`

#### Scenario: validateFoodPortions skips cooked-preparation legumes

- GIVEN a list of foods containing `legume-lentejas-cocido` (150 g, `preparationState: 'cooked'`)
- WHEN `validateFoodPortions()` is called
- THEN no alerts are returned for this entry (gram validation is skipped)
- NOTE: AESAN_GRAM_STANDARDS[LEGUMES] is { min: 50, max: 60 } (dry weight). 150 g would normally fail, but the preparation state exempts it.

#### Scenario: validateFoodPortions still validates dry legumes

- GIVEN a list of foods containing `legume-lentejas` (60 g, `preparationState: 'as-stored'` or undefined)
- WHEN `validateFoodPortions()` is called
- THEN no alerts are returned (60 g is within { min: 50, max: 60 })

#### Scenario: validateFoodPortions still catches out-of-range dry legumes

- GIVEN a list of foods containing a legume with `gramsPerRation: 30` and `preparationState: 'as-stored'`
- WHEN `validateFoodPortions()` is called
- THEN a `PORTION_TOO_SMALL` warning is returned

### Requirement: R6 — Cooked cereal entries with `preparationState: 'cooked'`

Two cooked cereal entries MUST be added: arroz-integral-cocido (180 g) and pasta-integral-cocida (180 g). Each has `preparationState: 'cooked'`.

#### Scenario: Cooked brown rice exists with cooked preparation state

- GIVEN the food catalog
- WHEN finding food by id `cereal-arroz-integral-cocido`
- THEN it exists with `category: 'cereals'`, `gramsPerRation: 180`, `preparationState: 'cooked'`

#### Scenario: Cooked whole wheat pasta exists with cooked preparation state

- GIVEN the food catalog
- WHEN finding food by id `cereal-pasta-integral-cocida`
- THEN it exists with `category: 'cereals'`, `gramsPerRation: 180`, `preparationState: 'cooked'`

#### Scenario: validateFoodPortions skips cooked-preparation cereals

- GIVEN a list of foods containing `cereal-arroz-integral-cocido` (180 g, `preparationState: 'cooked'`)
- WHEN `validateFoodPortions()` is called
- THEN no alerts are returned for this entry
- NOTE: AESAN_GRAM_STANDARDS[CEREALS] is { min: 40, max: 60 } (dry weight). 180 g would normally fail, but the preparation state exempts it.

#### Scenario: validateFoodPortions still validates dry cereals

- GIVEN a list of foods containing `cereal-pan-integral` (50 g, `preparationState: 'as-stored'` or undefined)
- WHEN `validateFoodPortions()` is called
- THEN no alerts are returned (50 g is within { min: 40, max: 60 })

### Requirement: R7 — CountByCategory includes TUBERS

The `CountByCategory` interface and `defaultRationCounts()` MUST include `[FoodCategory.TUBERS]: number`. `countRations()` MUST correctly count tuber entries.

#### Scenario: CountByCategory has TUBERS field

- GIVEN a `CountByCategory` object from `defaultRationCounts()`
- WHEN accessing `[FoodCategory.TUBERS]`
- THEN the value is `0` (initial default)

#### Scenario: countRations counts tuber entries

- GIVEN a list of 2 tuber foods (e.g. patata + boniato)
- WHEN `countRations()` is called
- THEN `counts[FoodCategory.TUBERS]` equals `2`

#### Scenario: countRations mixes tuber and non-tuber entries

- GIVEN a list with 1 patata, 1 lentejas, and 1 manzana
- WHEN `countRations()` is called
- THEN `counts[FoodCategory.TUBERS]` is `1`, `counts[FoodCategory.LEGUMES]` is `1`, `counts[FoodCategory.FRUITS]` is `1`

### Requirement: R8 — TUBERS in weekly validation

`validateWeeklyRations()` MUST include TUBERS in its weekly category checks. Exceeding 5 tuber rations/week MUST produce an "over" violation.

#### Scenario: 6 tuber rations/week triggers over violation

- GIVEN weekly counts with `[FoodCategory.TUBERS]: 6`
- WHEN `validateWeeklyRations()` is called
- THEN `violations` contains one entry with `category: 'tubers'`, `direction: 'over'`, `limit: 5`
- AND `valid` is `false`

#### Scenario: 5 tuber rations/week is valid

- GIVEN weekly counts with `[FoodCategory.TUBERS]: 5`
- WHEN `validateWeeklyRations()` is called
- THEN no TUBERS violation is present
- AND `valid` is `true` (assuming no other violations)

#### Scenario: 3 tuber rations/week is valid (no minimum)

- GIVEN weekly counts with `[FoodCategory.TUBERS]: 3`
- WHEN `validateWeeklyRations()` is called
- THEN no TUBERS violation is present (no minimum exists for tubers)

#### Scenario: 0 tuber rations/week is valid (no minimum)

- GIVEN weekly counts with `[FoodCategory.TUBERS]: 0`
- WHEN `validateWeeklyRations()` is called
- THEN no TUBERS violation is present (no minimum exists for tubers)

### Requirement: R9 — TUBERS in plan generator weekly slots

`getWeeklySlots()` MUST include TUBERS slots distributed across 2 days per week (e.g. days 2 and 5), consistent with "consumo moderado" frequency.

#### Scenario: Weekly plan includes 2 tuber slots

- GIVEN `generateWeeklyPlan(false)` is called
- WHEN inspecting the weekly slot distribution
- THEN there are exactly 2 slots with `category: 'tubers'`

#### Scenario: Tuber slots are on different days

- GIVEN `generateWeeklyPlan(false)` is called
- WHEN inspecting tuber slots
- THEN the two tuber slots have different `day` values (e.g. day 2 and day 5)

#### Scenario: Tuber foods are assigned to plan slots

- GIVEN `generateWeeklyPlan(false)` is called
- WHEN inspecting the plan entries for tuber slot days
- THEN entries with `food.category === 'tubers'` exist on the expected days

#### Scenario: Plan generator picks sustainable tuber foods

- GIVEN multiple tuber foods exist in the catalog
- WHEN `pickSustainableFood(FoodCategory.TUBERS, day)` is called
- THEN it returns a non-processed tuber food (natural, not processed)

### Requirement: R10 — TUBERS in traffic light (GREEN default)

`CATEGORY_DEFAULTS` in the classification service MUST map `FoodCategory.TUBERS` to `TrafficLightColor.GREEN`. Tubers are unprocessed whole foods.

#### Scenario: Raw tuber classifies as GREEN

- GIVEN a tuber food (e.g. patata) with no harmful ingredients, no trans fats
- WHEN `classifyFood()` is called
- THEN the result is `TrafficLightColor.GREEN`

#### Scenario: Processed tuber with occult sugars classifies as RED

- GIVEN a tuber-based processed food with `harmfulIngredients: ['sacarosa']`
- WHEN `classifyFood()` is called
- THEN the result is `TrafficLightColor.RED` (occult sugar override)

### Requirement: R11 — TUBERS nudge rules (deficit/excess)

The NudgeEngine MUST have two tuber-specific rules:
- `TUBERS_EXCESS` (SYSTEM_ACTION): fires when weekly tuber count exceeds 5
- No deficit nudge is needed (tubers have no minimum — they are "consumo moderado")

#### Scenario: TUBERS_EXCESS nudge fires at 6/week

- GIVEN a nudge context with `dayOfWeek: 5` and `counts[FoodCategory.TUBERS]: 6`
- WHEN nudge rules are evaluated
- THEN the `TUBERS_EXCESS` rule condition evaluates to `true`

#### Scenario: TUBERS_EXCESS nudge does not fire at 5/week

- GIVEN a nudge context with `dayOfWeek: 5` and `counts[FoodCategory.TUBERS]: 5`
- WHEN nudge rules are evaluated
- THEN the `TUBERS_EXCESS` rule condition evaluates to `false`

#### Scenario: TUBERS_EXCESS has appropriate cooldown

- GIVEN the `TUBERS_EXCESS` rule definition
- WHEN reading its `cooldown` property
- THEN it is `COOLDOWN_24H` (24 hours, consistent with other weekly excess rules)

#### Scenario: No TUBERS_DEFICIT nudge exists

- GIVEN the `NUDGE_RULES` array
- WHEN filtering for rules with id containing `TUBERS` and type `BEHAVIORAL_NUDGE`
- THEN no deficit nudge exists (tubers have no minimum requirement)

### Requirement: R12 — i18n for TUBERS

`Translations` interface MUST include `'category.tubers': string`. Both `es.ts` and `en.ts` MUST provide translations: ES = "Tubérculos", EN = "Tubers".

#### Scenario: Spanish translation for TUBERS

- GIVEN the `es` translations object
- WHEN accessing `'category.tubers'`
- THEN the value is `'Tubérculos'`

#### Scenario: English translation for TUBERS

- GIVEN the `en` translations object
- WHEN accessing `'category.tubers'`
- THEN the value is `'Tubers'`

#### Scenario: TypeScript enforces TUBERS in both locales

- GIVEN the `Translations` interface includes `'category.tubers'`
- WHEN compiling with `tsc -b`
- THEN no type errors occur (both `es` and `en` objects satisfy the interface)

---

## MODIFIED Requirements

### Requirement: M1 — Food schema extends with optional `preparationState` enum

The `FoodSchema` MUST include an optional enum field `preparationState` with values `'as-stored' | 'cooked'` and default `'as-stored'`. This is an additive, non-breaking change — all existing foods default to `'as-stored'`.

#### Scenario: Existing foods without the field default to 'as-stored'

- GIVEN any existing food entry (e.g. `legume-lentejas`) without `preparationState`
- WHEN the food is parsed through `FoodSchema`
- THEN `preparationState` is `'as-stored'`

#### Scenario: Cooked entries with the field set to 'cooked'

- GIVEN a food entry with `preparationState: 'cooked'`
- WHEN the food is parsed through `FoodSchema`
- THEN `preparationState` is `'cooked'`

#### Scenario: Invalid preparation state is rejected

- GIVEN a food entry with `preparationState: 'raw'`
- WHEN the food is parsed through `FoodSchema`
- THEN a Zod validation error is thrown

### Requirement: M2 — validateFoodPortions skips cooked-preparation entries

`validateFoodPortions()` MUST check `food.preparationState` and skip gram-range validation when it equals `'cooked'`. This prevents false-positive alerts for cooked-weight entries whose grams exceed dry-weight AESAN standards.

#### Scenario: Cooked-preparation food is skipped entirely

- GIVEN a food with `preparationState: 'cooked'` and `gramsPerRation: 150` in a category with `{ min: 50, max: 60 }`
- WHEN `validateFoodPortions()` is called
- THEN no alerts are returned for this food (validation is skipped)

#### Scenario: As-stored food is still validated

- GIVEN a food with `preparationState: 'as-stored'` (or undefined) and `gramsPerRation: 150` in a category with `{ min: 50, max: 60 }`
- WHEN `validateFoodPortions()` is called
- THEN a `PORTION_TOO_LARGE` critical alert is returned

### Requirement: M3 — validateWeeklyRations includes TUBERS

`validateWeeklyRations()` MUST add `FoodCategory.TUBERS` to its `weeklyCategories` array so that the weekly cap of 5 is enforced.

#### Scenario: TUBERS is in weekly categories list

- GIVEN the `weeklyCategories` array inside `validateWeeklyRations()`
- WHEN inspecting the array
- THEN it includes `FoodCategory.TUBERS`

---

## NON-REGRESSION Requirements

### Requirement: NR1 — All existing tests continue passing

The existing test suite MUST pass without modification after adding the new category, catalog entries, and validation logic.

#### Scenario: Full test suite passes

- GIVEN all new tests and production code are in place
- WHEN `pnpm test:run` is executed
- THEN all existing tests pass with zero failures
- AND coverage thresholds are met (statements 80%, branches 80%, functions 100%, lines 80%)

### Requirement: NR2 — Existing foods are unaffected

All 39 existing catalog entries MUST remain unchanged in their category, gramsPerRation, and nutritional data.

#### Scenario: Existing food count is preserved

- GIVEN the food catalog
- WHEN counting entries that existed before this change (all except the 8 new ones)
- THEN each entry has identical `category`, `gramsPerRation`, `kcalPer100g`, and other fields

### Requirement: NR3 — Quality pipeline passes

`pnpm quality` (format:check → lint → typecheck → test:run) MUST pass green.

#### Scenario: Quality pipeline is green

- GIVEN all changes are committed
- WHEN `pnpm quality` is executed
- THEN all four stages pass: format, lint, typecheck, and tests
