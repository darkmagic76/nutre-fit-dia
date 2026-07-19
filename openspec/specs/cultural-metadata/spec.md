# Cultural Metadata Specification

## Purpose

FR-5.2: Tag traditional Mediterranean preparations with UNESCO cultural/social metadata to promote emotional wellbeing and adherence. Badges in the plan view give immediate visibility of the Mediterranean lifestyle dimension.

## Requirements

### Requirement: CulturalMetadataSchema Validation

The system **MUST** define a `CulturalMetadataSchema` (Zod) with 6 fields: `traditionalCuisine` (boolean, default false), `socialEating` (boolean, default false), `cookingTechnique` (enum: steam|boiled|grilled|raw|stew, optional), `geographicOrigin` (string, optional), `proteinBiologicalValue` (number 0–100, optional), `erMedDiet` (boolean, default false). Unknown fields **MUST** be stripped.

#### Scenario: Valid metadata passes

- GIVEN a complete metadata object with `traditionalCuisine: true`, `socialEating: true`, `cookingTechnique: "stew"`, `geographicOrigin: "Mediterráneo"`, `proteinBiologicalValue: 90`, `erMedDiet: true`
- WHEN parsed through `CulturalMetadataSchema`
- THEN it succeeds with all values preserved

#### Scenario: Defaults applied on partial input

- GIVEN a partial metadata object with only `traditionalCuisine: true`
- WHEN parsed through `CulturalMetadataSchema`
- THEN `socialEating` defaults to `false` and `erMedDiet` defaults to `false`

#### Scenario: Invalid cookingTechnique rejected

- GIVEN a metadata object with `cookingTechnique: "fried"`
- WHEN parsed through `CulturalMetadataSchema`
- THEN it fails validation

### Requirement: Optional Field Backward-Compatibility

The `culturalMetadata` field on `FoodSchema` **MUST** be optional. Foods without `culturalMetadata` **MUST** remain valid and unchanged.

#### Scenario: Existing food without metadata still validates

- GIVEN a `FoodSchema` object with no `culturalMetadata` field
- WHEN parsed through `FoodSchema`
- THEN it succeeds and `culturalMetadata` is `undefined`

#### Scenario: Food with metadata still validates all base fields

- GIVEN a food object with all required fields plus `culturalMetadata`
- WHEN parsed through `FoodSchema`
- THEN it succeeds and all base nutrition fields are intact

### Requirement: Badge Rendering

The `CulturalBadges` component **MUST** render emoji icons conditionally: 🏺 when `traditionalCuisine` is `true`, 👥 when `socialEating` is `true`, 🌿 when `erMedDiet` is `true`. Each icon **MUST** carry a Spanish aria-label. Additionally, when `socialEating` is `true` the component **MUST** render the text "Ideal para comer en compañía". When `cookingTechnique` is set, the component **MUST** render "Preparación: {COOKING_LABELS[cookingTechnique]}" using the map: `stew`→"guiso tradicional", `steam`→"al vapor", `boiled`→"hervido", `grilled`→"a la plancha", `raw`→"en crudo". Foods without `culturalMetadata` **MUST NOT** render badges or suggestion text. Badges **MUST** appear inline after the food name in `PlanView` entry rows.

#### Scenario: Three badges render when all flags are true

- GIVEN a food entry with `traditionalCuisine: true`, `socialEating: true`, `erMedDiet: true`
- WHEN `PlanView` renders the entry
- THEN three badge icons appear with aria-labels "Cocina tradicional", "Comida en compañía", and "erMedDiet"

#### Scenario: No badges when metadata absent

- GIVEN a food entry with no `culturalMetadata` field
- WHEN `PlanView` renders the entry
- THEN no badge icons or suggestion text appear

#### Scenario: Social eating suggestion text renders

- GIVEN a food entry with `socialEating: true`
- WHEN `PlanView` renders the entry
- THEN the text "Ideal para comer en compañía" appears below the emoji badges

#### Scenario: Cooking technique label renders for stew

- GIVEN a food entry with `cookingTechnique: "stew"`
- WHEN `PlanView` renders the entry
- THEN the text "Preparación: guiso tradicional" appears below the emoji badges

#### Scenario: Cooking technique label renders for steam

- GIVEN a food entry with `cookingTechnique: "steam"`
- WHEN `PlanView` renders the entry
- THEN the text "Preparación: al vapor" appears below the emoji badges

#### Scenario: No social eating text when flag is false

- GIVEN a food entry with `socialEating: false`
- WHEN `PlanView` renders the entry
- THEN no "comer en compañía" text appears

#### Scenario: No cooking technique text when field absent

- GIVEN a food entry without `cookingTechnique`
- WHEN `PlanView` renders the entry
- THEN no "Preparación:" text appears

#### Scenario: Both suggestion texts render when both present

- GIVEN a food entry with `socialEating: true` and `cookingTechnique: "stew"`
- WHEN `PlanView` renders the entry
- THEN both "Ideal para comer en compañía" and "Preparación: guiso tradicional" appear

### Requirement: Traditional Dish Data Population

Six traditional dishes **MUST** carry UNESCO metadata in the default food dataset. The dishes and their flags are:

| Dish | Flags |
|------|-------|
| Lentejas | traditional, social, stew, erMedDiet |
| Garbanzos | traditional, social, stew, erMedDiet |
| Alubias blancas | traditional, social, stew, erMedDiet |
| Bacalao fresco | traditional, erMedDiet, geographicOrigin Atlántico Norte, proteinBiologicalValue 92 |
| Sardinas | traditional, erMedDiet, geographicOrigin Mediterráneo |
| AOVE | traditional, erMedDiet, geographicOrigin Mediterráneo |

#### Scenario: All six dishes carry metadata

- GIVEN the full food dataset
- WHEN querying each of the six dishes
- THEN each has a populated `culturalMetadata` object with the correct flags per the table above

#### Scenario: Other foods have no metadata

- GIVEN a food not in the six traditional dishes (e.g., chicken breast, white rice)
- WHEN inspecting its `culturalMetadata`
- THEN it is `undefined`
