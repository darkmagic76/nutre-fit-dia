# Clinical Thresholds Specification

## Purpose

Single source of truth for all clinical, behavioral, and sustainability thresholds consumed by nudge rules, validators, and UI components. Constants are sourced from AESAN 2022, PREDIMED-Plus, and WHO guidelines.

## Requirements

### REQ-CLINICAL-CENTRALIZATION

All threshold constants MUST reside in `src/domain/clinical.ts`. No module-scoped thresholds permitted in rules files or feature directories. The file moves from `shared/constants/` to `domain/` — values are unchanged.

(Previously: All threshold constants MUST reside in `src/shared/constants/clinical.ts`. No module-scoped thresholds permitted in rules files or feature directories.)

#### Scenario: Clinical reviewer finds all thresholds in one file

- GIVEN the codebase
- WHEN a reviewer opens `src/domain/clinical.ts`
- THEN all 14 thresholds are visible with source citations

### REQ-NUTRITIONAL-THRESHOLDS

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

### REQ-BEHAVIORAL-THRESHOLDS

The following behavioral thresholds MUST be centralized:

| Constant | Value | Source |
|---|---|---|
| ANIMAL_PROTEIN_NUDGE_THRESHOLD | 2 | PREDIMED-Plus protein guidelines |
| HYPERGLYCEMIA_THRESHOLD_MG_DL | 180 | ADA glycemic targets |
| LEGUMES_CHECK_DAY_THRESHOLD | 4 | PREDIMED-Plus (Thu) |
| LEGUMES_MIN_WEEKLY_CHECK | 1 | PREDIMED-Plus legume guidance |
| FISH_EXCESS_THRESHOLD | 7 | AESAN 2022 |
| WEEKLY_ACTIVITY_MINUTES_TARGET | 150 | WHO physical activity |
| VEGETABLE_NUDGE_HOUR_THRESHOLD | 14 | Clinical protocol (2PM) |

### REQ-SUSTAINABILITY-THRESHOLDS

The following sustainability thresholds MUST be centralized:

| Constant | Value | Source |
|---|---|---|
| MAX_ALTERNATIVES_TO_SHOW | 3 | UX constraint |
| LOW_ENVIRONMENTAL_SCORE_THRESHOLD | 30 | Carbon footprint threshold |

### REQ-CEREAL-RESTRICTED-MAX-PRESERVED

`CEREAL_RESTRICTED_MAX = 4` MUST remain in `clinical.ts` unchanged. Existing consumers (rules.ts line 53) MUST NOT break.

#### Scenario: Existing constant untouched

- GIVEN clinical.ts currently exports CEREAL_RESTRICTED_MAX=4
- WHEN 13 new constants are appended
- THEN CEREAL_RESTRICTED_MAX retains value 4 and existing import path

### REQ-VEGETABLE-NUDGE-REEXPORT

`VEGETABLE_NUDGE_HOUR_THRESHOLD` MUST be re-exported from `@shared/nudge/index.ts` to preserve the `REQ-VEGETABLE-NUDGE-TIMEGATE-CONSTANT` contract (openspec/specs/vegetable-nudge-timegate).

#### Scenario: Import contract preserved

- GIVEN DailyViolations.test.tsx imports from `@shared/nudge`
- WHEN VEGETABLE_NUDGE_HOUR_THRESHOLD moves from rules.ts to clinical.ts
- THEN `import { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/nudge'` still resolves

### REQ-CLINICAL-IMPORT-SOURCE

`src/shared/nudge/rules.ts` MUST import all threshold constants from `@domain/clinical`. No module-scoped `const` declarations for thresholds SHALL remain in rules.ts.

(Previously: `src/shared/nudge/rules.ts` MUST import all threshold constants from `@shared/constants/clinical`. No module-scoped `const` declarations for thresholds SHALL remain in rules.ts.)

#### Scenario: Rules file delegates to domain clinical (unchanged logic, updated path)

- GIVEN rules.ts currently imports thresholds
- WHEN refactoring is applied
- THEN rules.ts has zero module-scoped threshold declarations
- AND all threshold values resolve from `@domain/clinical`

### Requirement: Domain Barrel Re-export

`src/domain/clinical.ts` SHALL be the source of truth for clinical, behavioral, and sustainability constants. The domain barrel (`src/domain/index.ts`) SHALL re-export all clinical constants for convenient access.

#### Scenario: Clinical constants resolve from @domain

- GIVEN a consumer imports `{ CEREAL_MIN_RATIONS } from '@domain'`
- WHEN the import resolves
- THEN the value SHALL be `3`
- AND the import SHALL resolve at both typecheck and runtime
