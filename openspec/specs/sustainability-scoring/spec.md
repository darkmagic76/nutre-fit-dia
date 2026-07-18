# Sustainability Scoring Specification

**ADRs**: ADR-007 (scoring algorithm, weight distribution)
**Sources**: AESAN 2022 (carbon thresholds), EAT-Lancet (planetary boundaries)

## Purpose

Provide a composable 0–100 environmental score per food item, enabling dual qualification (health + sustainability) across Scanner, RecipeEngine, and NudgeEngine.

## Requirements

### Requirement: Domain Types

The system SHALL expose `Seasonality`, `Proximity`, `PackagingLevel` enums and an `EnvironmentalScore` interface with `score`, `carbonFootprint`, `waterFootprint`, `seasonality`, `proximity`, and `packaging`.

#### Scenario: Enums cover three tiers each

- GIVEN the sustainability module
- THEN `Seasonality` SHALL include `IN_SEASON`, `GREENHOUSE`, `OUT_OF_SEASON`
- AND `Proximity` SHALL include `LOCAL_KM0`, `NATIONAL`, `IMPORTED`
- AND `PackagingLevel` SHALL include `BULK`, `RECYCLABLE`, `SINGLE_USE`

### Requirement: Carbon Footprint Categorization

The system MUST map `food.carbonFootprint` (kg CO₂eq/kg) to a category score using AESAN 2022 thresholds. Missing values MUST yield a neutral 50.

| Category | Threshold | Score |
|----------|-----------|-------|
| Very Low | < 0.5 | 100 |
| Low | < 1.5 | 80 |
| Moderate | < 3.0 | 60 |
| High | < 5.0 | 40 |
| Very High | ≥ 5.0 | 20 |
| Unknown | undefined | 50 |

#### Scenario: Very low carbon scores maximum

- GIVEN a food with `carbonFootprint = 0.3`
- WHEN `computeEnvironmentalScore` runs
- THEN the carbon dimension scores 100

#### Scenario: Very high carbon scores minimum

- GIVEN a food with `carbonFootprint = 6.2`
- WHEN `computeEnvironmentalScore` runs
- THEN the carbon dimension scores 20

#### Scenario: Missing carbon data yields neutral

- GIVEN a food with no `carbonFootprint`
- WHEN `computeEnvironmentalScore` runs
- THEN the carbon dimension scores 50

### Requirement: Seasonality Scoring

The system MUST assign 100 for `isSeasonal === true`, 30 otherwise.

#### Scenario: Seasonal food

- GIVEN a food with `isSeasonal = true`
- WHEN the score is computed
- THEN seasonality maps to `IN_SEASON` and scores 100

#### Scenario: Non-seasonal food

- GIVEN a food with `isSeasonal = false`
- WHEN the score is computed
- THEN seasonality maps to `OUT_OF_SEASON` and scores 30

### Requirement: Proximity Scoring

The system MUST infer proximity from seasonality: seasonal → `LOCAL_KM0` (100), non-seasonal → `NATIONAL` (60).

#### Scenario: Seasonal food implies km0

- GIVEN a food with `isSeasonal = true`
- WHEN the score is computed
- THEN proximity SHALL be `LOCAL_KM0` scoring 100

#### Scenario: Non-seasonal food implies national

- GIVEN a food with `isSeasonal = false`
- WHEN the score is computed
- THEN proximity SHALL be `NATIONAL` scoring 60

### Requirement: Weighted Composite Score

The system MUST compute `carbon × 0.50 + seasonality × 0.30 + proximity × 0.20`, rounded to nearest integer. Packaging defaults to `BULK`; water footprint defaults to 0 (V1).

#### Scenario: Best-case food scores ≥ 80

- GIVEN a food with low carbon (0.3), seasonal
- WHEN the composite score is computed
- THEN the score SHALL be ≥ 80

#### Scenario: Worst-case food scores ≤ 40

- GIVEN a food with high carbon (6.2), non-seasonal
- WHEN the composite score is computed
- THEN the score SHALL be ≤ 40

### Requirement: Sustainability-Ranked Food Selection

The PlanGenerator SHOULD sort available foods by `environmentalScore` descending before selection within each food category.

#### Scenario: Lower-carbon foods prioritized

- GIVEN multiple foods with different environmental scores
- WHEN `pickSustainableFood` selects foods
- THEN higher-scoring foods SHALL appear first in the weekly plan
