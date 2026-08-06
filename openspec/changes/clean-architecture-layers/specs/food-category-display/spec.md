# Delta for Food Category Display

## MODIFIED Requirements

### Requirement: `CATEGORY_DISPLAY_NAMES`

`CATEGORY_DISPLAY_NAMES` MUST be REMOVED from `domain/foodCategory.ts`. Display names are an i18n concern and MUST NOT live in the domain layer. The i18n `category.*` keys already serve as the canonical source of truth for both English and Spanish locales.

(Previously: The module exported `CATEGORY_DISPLAY_NAMES` marked `@deprecated` in favor of i18n `category.*` keys. New code SHALL use `t['category.xxx']` via the i18n system instead of this constant.)

#### Scenario: CATEGORY_DISPLAY_NAMES absent from domain

- GIVEN `src/domain/foodCategory.ts`
- WHEN inspecting exports
- THEN `CATEGORY_DISPLAY_NAMES` SHALL NOT be exported

#### Scenario: New code uses i18n keys (unchanged)

- GIVEN a component renders a food category name
- WHEN the category is `FoodCategory.CEREALS`
- THEN the component SHALL resolve the display name via `t['category.cereals']`
- AND SHALL NOT reference any domain-level display name constant

### Requirement: Single Source of Truth

All feature containers MUST import display names via i18n `category.*` keys. `CATEGORY_DISPLAY_NAMES` in domain is removed — i18n is now the ONLY source of truth.

(Previously: All feature containers MUST import display names from this module instead of defining their own `CATEGORY_NAMES` constant.)

#### Scenario: No CATEGORY_DISPLAY_NAMES in containers (unchanged)

- GIVEN `ScannerContainer`, `DailyLogContainer`, and `PlanContainer`
- WHEN searching for `CATEGORY_DISPLAY_NAMES` usage
- THEN no local `CATEGORY_NAMES` definition SHALL exist
- AND containers SHALL resolve category names via i18n

### Requirement: I18N Category Resolution (unchanged)

Food category display names MUST be resolvable through the i18n system for both English and Spanish locales.

#### Scenario: English category keys exist (unchanged)

- GIVEN the English locale is loaded
- THEN `t['category.cereals']` SHALL return "Cereals"
- AND all 11 FoodCategory values SHALL have English translations

#### Scenario: Spanish category keys exist (unchanged)

- GIVEN the Spanish locale is loaded
- THEN `t['category.cereals']` SHALL return "Cereales"
- AND all 11 FoodCategory values SHALL have Spanish translations
