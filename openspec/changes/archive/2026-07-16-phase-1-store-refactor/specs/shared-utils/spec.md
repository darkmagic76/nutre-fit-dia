# Shared Utils Specification

## Purpose

Pure utility functions extracted from the monolithic appStore: numeric sanitization and IMC computation. Zero dependencies on feature code.

## Requirements

### Requirement: `sanitizeNumeric()`

The function MUST strip non-numeric characters, allow only ONE decimal point, clamp to `[min, max]`, and return `min` for NaN.

#### Scenario: Normal input

- GIVEN `sanitizeNumeric("80.5", 300, 30)`
- THEN the result SHALL be `80.5`

#### Scenario: Multiple decimal points rejected

- GIVEN `sanitizeNumeric("80.5.3", 300, 30)`
- THEN the result SHALL NOT contain more than one decimal point
- AND the result SHALL be `80.5` (first decimal kept)

#### Scenario: Out of range clamped

- GIVEN `sanitizeNumeric("999", 300, 30)`
- THEN the result SHALL be `300`

#### Scenario: Invalid returns min

- GIVEN `sanitizeNumeric("abc", 300, 30)`
- THEN the result SHALL be `30`

### Requirement: `computeIMC()`

The function MUST compute `weight(kg) / (height(m))²`, rounded to 1 decimal.

#### Scenario: Standard IMC

- GIVEN weight=80, height=170
- WHEN `computeIMC(80, 170)` is called
- THEN the result SHALL be `27.7`
