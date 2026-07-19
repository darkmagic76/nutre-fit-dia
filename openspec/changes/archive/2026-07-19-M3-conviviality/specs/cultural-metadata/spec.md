# Delta for cultural-metadata

## MODIFIED Requirements

### Requirement: Badge Rendering

The `CulturalBadges` component **MUST** render emoji icons conditionally: 🏺 when `traditionalCuisine` is `true`, 👥 when `socialEating` is `true`, 🌿 when `erMedDiet` is `true`. Each icon **MUST** carry a Spanish aria-label. Additionally, when `socialEating` is `true` the component **MUST** render the text "Ideal para comer en compañía". When `cookingTechnique` is set, the component **MUST** render "Preparación: {COOKING_LABELS[cookingTechnique]}" using the map: `stew`→"guiso tradicional", `steam`→"al vapor", `boiled`→"hervido", `grilled`→"a la plancha", `raw`→"en crudo". Foods without `culturalMetadata` **MUST NOT** render badges or suggestion text. Badges **MUST** appear inline after the food name in `PlanView` entry rows.

(Previously: Emoji icons only, no textual suggestion spans)

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
