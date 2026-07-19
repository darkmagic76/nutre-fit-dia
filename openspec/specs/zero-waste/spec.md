# Zero-Waste Specification

## Purpose

Provides visual badges for zero-waste and ugly-produce food flags to inform users and promote sustainable food choices. Flags are V1 informational only — no scoring or filtering logic.

## Requirements

### Requirement: Schema Extension

`FoodSchema` MUST include two optional boolean fields: `isUglyProduce` (default `false`) and `isZeroWaste` (default `false`).

#### Scenario: Both flags set to true

- GIVEN a Food record with `isUglyProduce: true` and `isZeroWaste: true`
- WHEN validated against `FoodSchema`
- THEN both fields are accepted as valid booleans

#### Scenario: Flags omitted (defaults applied)

- GIVEN a Food record without `isUglyProduce` or `isZeroWaste`
- WHEN validated against `FoodSchema`
- THEN both fields default to `false`

### Requirement: ZeroWasteBadges Rendering

`ZeroWasteBadges` MUST render ♻️ when `isZeroWaste` is `true` and 🥕 when `isUglyProduce` is `true`.

#### Scenario: Both badges shown

- GIVEN a food entry with `isZeroWaste: true` and `isUglyProduce: true`
- WHEN `ZeroWasteBadges` renders
- THEN ♻️ AND 🥕 badges are displayed

#### Scenario: Single badge shown

- GIVEN a food entry with `isZeroWaste: true` and `isUglyProduce: false`
- WHEN `ZeroWasteBadges` renders
- THEN only the ♻️ badge is displayed

#### Scenario: No badges on unflagged food

- GIVEN a food entry with both flags `false`
- WHEN `ZeroWasteBadges` renders
- THEN no badges are displayed

### Requirement: Data Population

Food catalog MUST tag at least 6 items with appropriate zero-waste flags.

#### Scenario: Seasonal produce tagged

- GIVEN the food catalog
- WHEN inspecting seasonal vegetables and local fruits
- THEN those items SHOULD have `isUglyProduce: true` or `isZeroWaste: true`

#### Scenario: Conventional items remain untagged

- GIVEN the food catalog
- WHEN inspecting processed or imported items
- THEN those items MUST have both flags as `false`

### Requirement: PlanView Integration

PlanView MUST render `ZeroWasteBadges` alongside each food entry.

#### Scenario: Badge visible in plan entry

- GIVEN a plan entry with a food flagged `isZeroWaste: true`
- WHEN PlanView renders the food row
- THEN the ♻️ badge appears beside the food name

### Requirement: Backward Compatibility

Existing foods without `isUglyProduce` or `isZeroWaste` MUST render normally without errors.

#### Scenario: Missing flags on legacy data

- GIVEN legacy Food records lacking both flags
- WHEN any view renders them
- THEN no badges appear and no runtime errors occur
