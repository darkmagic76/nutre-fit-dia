# Delta for Food Category Display

## MODIFIED Requirements

### Requirement: `CATEGORY_DISPLAY_NAMES`

The module MUST export `CATEGORY_DISPLAY_NAMES` marked `@deprecated` in favor of i18n `category.*` keys. New code SHALL use `t['category.xxx']` via the i18n system instead of this constant.
(Previously: Required `CATEGORY_DISPLAY_NAMES` as the canonical Spanish-only source of truth for all 11 FoodCategory display names.)

#### Scenario: All 11 categories present (backward-compatible)

- GIVEN the module is imported
- THEN `CATEGORY_DISPLAY_NAMES` SHALL still have entries for all 11 `FoodCategory` values
- AND a JSDoc `@deprecated` tag SHALL direct consumers to use i18n `category.*` keys

#### Scenario: New code uses i18n keys

- GIVEN a component renders a food category name
- WHEN the category is `FoodCategory.CEREALS`
- THEN the component SHALL resolve the display name via `t['category.cereals']`
- AND SHALL NOT reference `CATEGORY_DISPLAY_NAMES`

## ADDED Requirements

### Requirement: I18N Category Resolution

Food category display names MUST be resolvable through the i18n system for both English and Spanish locales.

#### Scenario: English category keys exist

- GIVEN the English locale is loaded
- THEN `t['category.cereals']` SHALL return "Cereals"
- AND `t['category.vegetables']` SHALL return "Vegetables"
- AND all 11 FoodCategory values SHALL have English translations

#### Scenario: Spanish category keys exist

- GIVEN the Spanish locale is loaded
- THEN `t['category.cereals']` SHALL return "Cereales"
- AND `t['category.vegetables']` SHALL return "Verduras"
- AND all 11 FoodCategory values SHALL have Spanish translations
