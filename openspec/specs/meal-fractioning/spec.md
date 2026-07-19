# Meal Fractioning Specification

## Purpose

Distribute daily food rations into structured meals (BREAKFAST, LUNCH, DINNER, SNACK) with mandatory AOVE tagging per main meal, per-meal kcal display, and parameterized 3-6 daily intakes.

## Requirements

### Requirement: MealType Enum and Schema Extension

The system MUST define `MealType` enum (`BREAKFAST | LUNCH | DINNER | SNACK`) and add `mealType: MealType` to `MealEntry`. Entries without `mealType` MUST default to `BREAKFAST`.

#### Scenario: Explicit mealType is stored

- GIVEN a MealEntry constructed with `mealType: LUNCH`
- THEN `entry.mealType` SHALL be `LUNCH`

#### Scenario: Backward-compatible default

- GIVEN a MealEntry constructed without `mealType`
- THEN `entry.mealType` SHALL default to `BREAKFAST`

### Requirement: Meal Distribution Algorithm

planGenerator MUST assign `mealType` to every `MealEntry` using fixed heuristics. SHALL support `mealCount` parameter (3–6, default 4).

| Category | mealCount=4 Distribution |
|----------|--------------------------|
| CEREALS | B(1)+L(2)+D(2) [max 4 if restrictionActive] |
| VEGETABLES | L(2)+D(1) |
| FRUITS | B(1)+SNACK(1) |
| OLIVE_OIL | B(1)+L(1)+D(1) |
| WATER | B(1)+L(1)+D(1)+SNACK(1) |
| Weekly (DAIRY,LEGUMES,FISH,EGGS,WHITE_MEAT) | LUNCH or DINNER (alternating when ≥2 items land on same day) |

#### Scenario: Standard 4-meal distribution

- GIVEN a daily template with all categories
- WHEN `buildDailyTemplate(mealCount=4)` runs
- THEN categories distribute per the table above

#### Scenario: Restriction reduces CEREALS

- GIVEN `restrictionActive=true`
- WHEN CEREALS distribute
- THEN total CEREALS SHALL be max 4 instead of 5

#### Scenario: 3-meal distribution without SNACK

- GIVEN `mealCount=3`
- WHEN distribution runs
- THEN FRUITS SHALL go to BREAKFAST only and WATER SHALL split B(1)+L(1)+D(1) with no SNACK slots

#### Scenario: 6-meal distribution with 3 SNACKs

- GIVEN `mealCount=6`
- WHEN distribution runs
- THEN rations SHALL distribute across 3 SNACK slots

#### Scenario: Multiple weekly items distribute across main meals

- GIVEN a day has 2 weekly items (e.g., LEGUMES + EGGS on day 1)
- WHEN distribution runs
- THEN items SHALL alternate LUNCH → DINNER → LUNCH
- AND no weekly item SHALL be assigned to BREAKFAST or SNACK
- GIVEN a day has 1 weekly item (e.g., FISH on day 6)
- THEN it SHALL be assigned to LUNCH

### Requirement: AOVE Mandatory Tagging

Every BREAKFAST, LUNCH, and DINNER MUST contain ≥1 OLIVE_OIL entry. This is a system rule — no user toggle. If a main meal has 0 OLIVE_OIL entries, the generator MUST add one.

#### Scenario: AOVE present in all main meals

- GIVEN a plan with OLIVE_OIL entries in B/L/D
- THEN no additional OLIVE_OIL entries SHALL be added

#### Scenario: Missing AOVE auto-added to LUNCH

- GIVEN 0 OLIVE_OIL entries in LUNCH
- WHEN the plan generates
- THEN generator MUST add one OLIVE_OIL entry to LUNCH

#### Scenario: Graceful handling of empty catalog

- GIVEN no OLIVE_OIL food exists in the catalog
- WHEN generator checks AOVE rule
- THEN it SHALL NOT crash (log warning instead)

### Requirement: Water Distribution

WATER MUST distribute as 4 rations (~250ml each): B(1)+L(1)+D(1)+SNACK(1).

#### Scenario: Water across all four meals

- GIVEN a 4-meal daily plan
- THEN WATER SHALL appear once per meal type

### Requirement: Per-Meal Kcal Display

PlanView MUST group entries by `mealType` and compute kcal per meal: `(kcalPer100g × gramsPerRation / 100) × rations`. MUST show `%` of daily target: `(mealKcal / caloricTarget.target) × 100`. If `caloricTarget` is null, SHALL display `"—"`.

#### Scenario: Kcal computed correctly

- GIVEN LUNCH group: 2× foodA (100kcal/100g, 50g) + 1× foodB (200kcal/100g, 100g)
- WHEN kcal computes
- THEN LUNCH total SHALL be 400kcal
- AND % SHALL show `(400/caloricTarget.target)×100`

#### Scenario: Null caloricTarget shows dash

- GIVEN `useTrackerStore.getState().caloricTarget` is null
- WHEN PlanView renders kcal %
- THEN SHALL display `"—"`

#### Scenario: Zero target avoids division by zero

- GIVEN `caloricTarget.target` is `0`
- WHEN PlanView computes kcal %
- THEN SHALL display `"—"` instead of attempting division

### Requirement: Meal Structure UI in PlanView

PlanView MUST group `day.entries` by `mealType` in order: BREAKFAST → LUNCH → DINNER → SNACK. Each group SHALL render: meal name (Desayuno/Almuerzo/Cena/Snack), total kcal + % target, and food entries (`"N× foodName | Category"`). Existing features (CulturalBadges, ZeroWasteBadges, LegalDisclaimer, restriction toggle) MUST remain unchanged.

#### Scenario: Meals render in correct order

- GIVEN a day with entries for all four mealTypes
- WHEN PlanView renders
- THEN groups appear BREAKFAST → LUNCH → DINNER → SNACK

#### Scenario: Existing features preserved

- GIVEN PlanView with meal grouping active
- THEN CulturalBadges, ZeroWasteBadges, LegalDisclaimer, and restriction toggle SHALL still render

#### Scenario: Empty meal group is not rendered

- GIVEN a day has 0 entries for SNACK (e.g., mealCount=3)
- WHEN PlanView renders
- THEN no SNACK section SHALL appear
