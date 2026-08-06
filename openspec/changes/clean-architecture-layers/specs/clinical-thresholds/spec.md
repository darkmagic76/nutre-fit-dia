# Delta for Clinical Thresholds

## ADDED Requirements

### Requirement: Domain Barrel Re-export

`src/domain/clinical.ts` SHALL be the source of truth for clinical, behavioral, and sustainability constants. The domain barrel (`src/domain/index.ts`) SHALL re-export all clinical constants for convenient access.

#### Scenario: Clinical constants resolve from @domain

- GIVEN a consumer imports `{ CEREAL_MIN_RATIONS } from '@domain'`
- WHEN the import resolves
- THEN the value SHALL be `3`
- AND the import SHALL resolve at both typecheck and runtime

## MODIFIED Requirements

### REQ-CLINICAL-CENTRALIZATION

All threshold constants MUST reside in `src/domain/clinical.ts`. No module-scoped thresholds permitted in rules files or feature directories. The file moves from `shared/constants/` to `domain/` — values are unchanged.

(Previously: All threshold constants MUST reside in `src/shared/constants/clinical.ts`. No module-scoped thresholds permitted in rules files or feature directories.)

#### Scenario: Clinical reviewer finds all thresholds in one file

- GIVEN the codebase
- WHEN a reviewer opens `src/domain/clinical.ts`
- THEN all 14 thresholds are visible with source citations

### REQ-CLINICAL-IMPORT-SOURCE

`src/shared/nudge/rules.ts` MUST import all threshold constants from `@domain/clinical`. No module-scoped `const` declarations for thresholds SHALL remain in rules.ts.

(Previously: `src/shared/nudge/rules.ts` MUST import all threshold constants from `@shared/constants/clinical`. No module-scoped `const` declarations for thresholds SHALL remain in rules.ts.)

#### Scenario: Rules file delegates to domain clinical (unchanged logic, updated path)

- GIVEN rules.ts currently imports thresholds
- WHEN refactoring is applied
- THEN rules.ts has zero module-scoped threshold declarations
- AND all threshold values resolve from `@domain/clinical`

### REQ-NUTRITIONAL-THRESHOLDS (unchanged values)

The following nutritional minimums MUST be centralized — values unchanged, location changes to `domain/clinical.ts`:

| Constant | Value | Source |
|---|---|---|
| CEREAL_MIN_RATIONS | 3 | AESAN 2022 |
| VEGETABLE_MIN_RATIONS | 3 | PREDIMED-Plus |
| FRUIT_MIN_RATIONS | 2 | SPECS_RF §5 |
| WATER_MIN_RATIONS | 4 | WHO hydration |

#### Scenario: Nutritional thresholds available to all consumers

- GIVEN nudge-engine and daily-violations features
- WHEN they import from `@domain/clinical`
- THEN all 4 nutritional thresholds resolve at compile time
