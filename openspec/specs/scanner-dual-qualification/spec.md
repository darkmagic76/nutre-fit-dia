# Scanner Dual Qualification Specification

**ADRs**: ADR-003 (ScannerAdapter), ADR-007 (Sustainability Scoring, Dual Qualification Contract)
**Sources**: SPECS_RF "Calificación Dual", AESAN 2022 / EAT-Lancet

## Purpose

Extend `ScanResult` and `ClassificationResult` with an optional `environmentalScore` field, integrating sustainability scoring (ADR-007) into the scanner pipeline. The extension is backward-compatible — all existing consumers continue to work unchanged.

## ADDED Requirements

### Requirement: ScanResult Gains Optional Environmental Score

`ScanResult` SHALL include an optional `environmentalScore?: EnvironmentalScore` field. The field MUST be absent or `undefined` when carbon data is unavailable. Existing consumers MUST NOT break when the field is absent.

#### Scenario: Carbon data available populates score

- GIVEN a scan result for a food with `carbonFootprint` data
- WHEN `ScanResult` is constructed
- THEN `environmentalScore` SHALL be defined with the computed `EnvironmentalScore`

#### Scenario: Missing carbon data omits score

- GIVEN a scan result for a food with no `carbonFootprint`
- WHEN `ScanResult` is constructed
- THEN `environmentalScore` SHALL be `undefined`

### Requirement: ClassificationResult Gains Optional Environmental Score

`ClassificationResult` SHALL include an optional `environmentalScore?: EnvironmentalScore` field. `classifyFoodWithReasons()` MUST call `computeEnvironmentalScore(food)` for non-RED results and include the result. RED-override paths (occult sugars, trans fats) MUST skip environmental scoring.

#### Scenario: Non-RED food includes environmental score

- GIVEN a food classified as GREEN or ORANGE with carbon data
- WHEN `classifyFoodWithReasons` runs
- THEN the result SHALL include `environmentalScore` with carbon, seasonality, proximity, and composite score

#### Scenario: Missing carbon data yields neutral environmental score

- GIVEN a food classified as GREEN or ORANGE with no `carbonFootprint`
- WHEN `classifyFoodWithReasons` runs
- THEN `environmentalScore` SHALL be defined with neutral carbon dimension (0 value)

#### Scenario: RED override skips environmental scoring

- GIVEN a food with occult sugars or trans fats
- WHEN `classifyFoodWithReasons` runs
- THEN the result SHALL NOT include `environmentalScore`

### Requirement: Backward-Compatible Contract Extension

Both `ScanResult` and `ClassificationResult` MUST extend their interfaces with an optional field only. All existing tests MUST pass without modification. No consumer code outside the scanner pipeline SHALL require changes.

#### Scenario: Existing consumers unaffected

- GIVEN existing consumer code reading `foodId`, `color`, and `reasons`
- WHEN the dual qualification extension is deployed
- THEN all existing assertions SHALL pass unchanged
