# Substitution Service Specification

**ADRs**: ADR-007 (domain placement, substitution logic, emission ratios)

## Purpose

Given a high-carbon-protein food, suggest protein-equivalent alternatives from LEGUMES and blue FISH, ranked by environmental score descending. Enables NudgeEngine (M2) to offer actionable sustainable substitutions.

## Requirements

### Requirement: Substitution Trigger

The system SHALL provide `suggestAlternative(food: Food): Food[]` that returns alternatives when the input food is a high-carbon protein — defined as `category === 'white_meat'` OR `carbonFootprint >= 4.0`.

#### Scenario: White meat triggers substitution

- GIVEN a food with `category = 'white_meat'`
- WHEN `suggestAlternative` is called
- THEN the food catalog SHALL be queried for LEGUMES and blue FISH alternatives

#### Scenario: High-carbon non-meat triggers substitution

- GIVEN a food with `category = 'dairy'` and `carbonFootprint = 5.0`
- WHEN `suggestAlternative` is called
- THEN alternatives SHALL be returned (same LEGUMES + blue FISH logic)

#### Scenario: Low-carbon food returns empty

- GIVEN a food with `category = 'legumes'` and `carbonFootprint = 0.8`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array

#### Scenario: No carbon data returns empty

- GIVEN a food with `category = 'cereals'` and no `carbonFootprint`
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array

### Requirement: Alternative Selection

Alternatives MUST be foods from the `LEGUMES` category. FISH alternatives MUST be restricted to blue fish (identified via `PROTEIN_EMISSION_RATIOS` key matching `fish_blue`). The input food MUST be excluded from results.

#### Scenario: Only legumes and blue fish returned

- GIVEN a white meat food
- WHEN `suggestAlternative` returns results
- THEN every result SHALL have `category = 'legumes'` OR be a blue fish

#### Scenario: White fish excluded

- GIVEN a white meat food and a FISH catalog containing both blue and white fish
- WHEN `suggestAlternative` runs
- THEN white fish entries SHALL NOT appear in results

### Requirement: Ranking and Limit

Results MUST be sorted by `computeEnvironmentalScore().score` descending and limited to a maximum of 3 items.

#### Scenario: Returns top 3 by score

- GIVEN a white meat food with 5+ candidate alternatives
- WHEN `suggestAlternative` runs
- THEN the result SHALL contain at most 3 items
- AND each item's `environmentalScore` SHALL be ≥ any excluded candidate's score

#### Scenario: Results sorted descending

- GIVEN a white meat food with 3 candidate alternatives
- WHEN `suggestAlternative` runs
- THEN `result[0].environmentalScore >= result[1].environmentalScore >= result[2].environmentalScore`

### Requirement: Empty Catalog

If the food catalog contains no LEGUMES and no blue FISH items, the system MUST return an empty array.

#### Scenario: Missing alternatives

- GIVEN a white meat food and an empty food catalog
- WHEN `suggestAlternative` is called
- THEN the result SHALL be an empty array
