# Food Category Display Specification

## Purpose

Canonical Spanish display names for all 10 FoodCategory groups, extracted from duplicated constants across 3 containers.

## Requirements

### Requirement: `CATEGORY_DISPLAY_NAMES`

The module MUST export a `Record<FoodCategory, string>` constant mapping each category key to its Spanish display name.

#### Scenario: All 10 categories present

- GIVEN the module is imported
- THEN `CATEGORY_DISPLAY_NAMES` SHALL have entries for all 10 `FoodCategory` values
- AND `CATEGORY_DISPLAY_NAMES[FoodCategory.CEREALS]` SHALL be `"Cereales"`
- AND `CATEGORY_DISPLAY_NAMES[FoodCategory.WATER]` SHALL be `"Agua"`

### Requirement: Single Source of Truth

All feature containers MUST import display names from this module instead of defining their own `CATEGORY_NAMES` constant.

#### Scenario: No duplication in containers

- GIVEN `ScannerContainer`, `DailyLogContainer`, and `PlanContainer`
- WHEN searching for `const CATEGORY_NAMES` in those files
- THEN no local `CATEGORY_NAMES` definition SHALL exist
