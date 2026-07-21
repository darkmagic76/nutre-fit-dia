# Delta for substitution-service

## MODIFIED Requirements

### Requirement: Substitution Trigger

The system SHALL provide `suggestAlternative(food: Food): Food[]` that returns alternatives when the input food belongs to `FoodCategory.RED_MEAT`. The `carbonFootprint >= 4.0` heuristic MUST be removed.

(Previously: trigger was `category === 'white_meat'` OR `carbonFootprint >= 4.0`)

#### Scenario: Red meat triggers substitution

- GIVEN a food with `category = 'red_meat'`
- WHEN `suggestAlternative` is called
- THEN the food catalog SHALL be queried for LEGUMES and blue FISH alternatives

#### Scenario: Non-red-meat high-carbon food does NOT trigger

- GIVEN a food with `category = 'white_meat'` and `carbonFootprint = 8.0`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array

#### Scenario: Chorizo (RED_MEAT, CF 8.0) triggers correctly

- GIVEN chorizo with `category = 'red_meat'` and `carbonFootprint = 8.0`
- WHEN `suggestAlternative` is called
- THEN alternatives SHALL be returned using category gate only (no heuristic)

#### Scenario: Conejo (WHITE_MEAT, CF 4.0) no longer triggers

- GIVEN conejo with `category = 'white_meat'` and `carbonFootprint = 4.0`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array (heuristic removed)

#### Scenario: Low-carbon food returns empty (unchanged)

- GIVEN a food with `category = 'legumes'` and `carbonFootprint = 0.8`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array

#### Scenario: No carbon data returns empty (unchanged)

- GIVEN a food with `category = 'cereals'` and no `carbonFootprint`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array

## REMOVED Requirements

### Requirement: Carbon Footprint Heuristic Trigger

(Reason: the `carbonFootprint >= 4.0` heuristic conflated red meat with high-carbon white meat like conejo (CF 4.0). With RED_MEAT as a canonical category, the heuristic is no longer needed. All foods that should trigger substitution are now correctly categorized as RED_MEAT.)
