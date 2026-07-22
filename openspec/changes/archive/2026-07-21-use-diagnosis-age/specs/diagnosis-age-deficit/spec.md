# Diagnosis-Age Deficit Specification

## Purpose

FR-4.1 phenotypic filtering: use `diagnosisAge` to adjust caloric restriction aggressiveness by scaling the PREDIMED-Plus 600 kcal deficit.

## Requirements

### Requirement: Early-Onset — Full Deficit (R1)

When `diagnosisAge < 40`, the system MUST apply a 1.0 modifier (full 600 kcal deficit).

#### Scenario: Full TDEE headroom
- GIVEN diagnosisAge 35, IMC 30, TDEE 2500
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 600 (1.0 × 600, not capped)

#### Scenario: 30% cap applies
- GIVEN diagnosisAge 38, IMC 28, TDEE 1600
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 480 (capped at 30% of TDEE, not 600)

#### Scenario: Normal weight — no restriction
- GIVEN diagnosisAge 25, IMC 23, TDEE 2000
- WHEN `computeCaloricTarget()` is called
- THEN `restrictionActive` = false, `deficit` = 0

#### Scenario: Boundary — diagnosisAge 39
- GIVEN diagnosisAge 39, IMC 27, TDEE 2200
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 600 (1.0 modifier, <40 bracket)

### Requirement: Standard-Onset — Moderate Deficit (R2)

When `40 ≤ diagnosisAge ≤ 60`, the system MUST apply a 0.85 modifier (510 kcal deficit).

#### Scenario: Full TDEE headroom
- GIVEN diagnosisAge 50, IMC 29, TDEE 2400
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (Math.round(600 × 0.85))

#### Scenario: 30% cap dominates
- GIVEN diagnosisAge 55, IMC 28, TDEE 1600
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 480 (30% of 1600, since 510 > 480)

#### Scenario: Lower boundary — diagnosisAge 40
- GIVEN diagnosisAge 40, IMC 27, TDEE 2200
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (0.85 modifier)

#### Scenario: Upper boundary — diagnosisAge 60
- GIVEN diagnosisAge 60, IMC 31, TDEE 2000
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (0.85 modifier, 60 included)

### Requirement: Late-Onset — Gentle Deficit (R3)

When `diagnosisAge > 60`, the system MUST apply a 0.7 modifier (420 kcal deficit).

#### Scenario: Full TDEE headroom
- GIVEN diagnosisAge 70, IMC 28, TDEE 2000
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 420 (Math.round(600 × 0.7))

#### Scenario: Cap not triggered
- GIVEN diagnosisAge 75, IMC 27, TDEE 1500
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 420 (420 < 30% of 1500 = 450)

#### Scenario: Hits safety floor
- GIVEN diagnosisAge 80, IMC 26, TDEE 1500
- WHEN `computeCaloricTarget()` is called
- THEN `target` ≥ 1200, actual `deficit` = `tdee - target`

#### Scenario: Boundary — diagnosisAge 61
- GIVEN diagnosisAge 61, IMC 29, TDEE 2100
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 420 (0.7 modifier, >60 bracket)

### Requirement: Empty/Zero Diagnosis Age — Conservative Default (R4)

When `diagnosisAge` is 0 or NaN, the system MUST default to standard bracket (0.85 modifier).

#### Scenario: diagnosisAge is 0
- GIVEN diagnosisAge 0, IMC 28, TDEE 2000
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (conservative default)

#### Scenario: diagnosisAge is NaN
- GIVEN diagnosisAge is NaN after parsing
- WHEN `getDiagnosisModifier()` is called
- THEN returns 0.85

#### Scenario: diagnosisAge 0, normal weight
- GIVEN diagnosisAge 0, IMC 23, TDEE 2000
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 0 (modifier irrelevant, restriction inactive)

#### Scenario: diagnosisAge 0, overweight
- GIVEN diagnosisAge 0, IMC 30, TDEE 2200
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (0.85 default applied)

### Requirement: Modifier Isolation — BMR/TDEE Unaffected (R5)

The diagnosisAge modifier MUST NOT alter BMR or TDEE calculations.

#### Scenario: Different diagnosisAge, identical BMR
- GIVEN user A (diagnosisAge 35) and user B (diagnosisAge 70) with same weight/height/age/gender
- WHEN `computeCaloricTarget()` is called for both
- THEN `bmr` values are identical

#### Scenario: Different diagnosisAge, identical TDEE
- GIVEN user A (diagnosisAge 35) and user B (diagnosisAge 70) with same metrics
- WHEN `computeCaloricTarget()` is called for both
- THEN `tdee` values are identical

#### Scenario: Early diagnosisAge does not affect BMR formula
- GIVEN diagnosisAge 25, weight 80, height 170, age 55, male
- WHEN BMR is calculated
- THEN BMR uses Mifflin-St Jeor only (diagnosisAge not an input)

#### Scenario: Late diagnosisAge does not affect TDEE
- GIVEN diagnosisAge 80, weight 80, height 170, age 55, male
- WHEN TDEE is calculated
- THEN TDEE = BMR × physicalActivityFactor (diagnosisAge not used)

### Requirement: Safety Constraints Preserved (R6)

The modified deficit MUST respect the existing 30% TDEE cap and 1200 kcal floor.

#### Scenario: Modifier deficit exceeds 30% cap
- GIVEN diagnosisAge 30 (1.0 modifier), TDEE 1500, IMC 27
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` ≤ 450 (30% cap overrides 600 modifier)

#### Scenario: Modifier would push target below 1200
- GIVEN diagnosisAge 50, TDEE 1600, IMC 27
- WHEN `computeCaloricTarget()` is called
- THEN `target` ≥ 1200 (floor enforced AFTER modifier)

#### Scenario: Late-onset modifier with floor interaction
- GIVEN diagnosisAge 70, TDEE 1550, IMC 26
- WHEN `computeCaloricTarget()` is called
- THEN `target` ≥ 1200, deficit adjusted to `tdee - 1200`

#### Scenario: Standard modifier under 30% cap
- GIVEN diagnosisAge 45, TDEE 3000, IMC 28
- WHEN `computeCaloricTarget()` is called
- THEN `deficit` = 510 (under 30% cap of 900, no capping needed)
