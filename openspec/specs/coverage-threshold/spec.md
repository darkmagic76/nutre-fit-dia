# Coverage Threshold Specification

## Purpose

Define the coverage threshold requirements that must be enforced during test execution to match the project's quality policy. Also specify behavioral requirements for branches that were previously uncovered by the test suite.

## Requirements

### Requirement: Coverage Threshold Minimum

The test coverage process MUST enforce minimum thresholds for statements, branches, functions, and lines. Failure to meet any threshold MUST result in a non-zero exit code.

- **Statements**: MUST be ≥ 80%
- **Branches**: MUST be ≥ 80%
- **Functions**: MUST be ≥ 80%
- **Lines**: MUST be ≥ 80%

#### Scenario: All thresholds met

- GIVEN the project has test coverage at or above 80% for statements, branches, functions, and lines
- WHEN `pnpm test:coverage` is executed
- THEN the command MUST exit with code 0
- AND the coverage report MUST be displayed

#### Scenario: One or more thresholds not met

- GIVEN the project has test coverage below 80% for any of statements, branches, functions, or lines
- WHEN `pnpm test:coverage` is executed
- THEN the command MUST exit with a non-zero code
- AND the failing thresholds MUST be reported in the output

### Requirement: Configuration Location

The coverage threshold configuration MUST reside in `vite.config.ts` within the Vitest `test.coverage` section, using the native Vitest threshold API.

#### Scenario: Configuration present

- GIVEN the vite.config.ts file
- WHEN the file is inspected
- THEN it MUST contain a `test.coverage.thresholds` object with `statements`, `branches`, `functions`, and `lines` properties
- AND each property MUST be set to `80`

### Requirement: REQ-NONREGRESSION — All existing tests continue passing

All existing tests MUST pass without modification after the 5 new coverage tests are added.

#### Scenario: full test suite after coverage additions

- GIVEN the 5 new coverage tests have been appended to the existing test files
- WHEN `pnpm test:run` is executed
- THEN all 531+ existing tests MUST pass with zero failures
- AND the 5 new tests MUST pass
- AND `pnpm test:coverage` MUST report 100% statement coverage

#### Scenario: zero production code changes

- GIVEN the coverage gap fixes
- WHEN comparing `src/` before and after
- THEN zero production source files SHALL be modified

### Requirement: COV-INSTALL-NULL — install() with null deferredPrompt no-ops

`useInstallPrompt.install()` SHALL return immediately without error when `deferredPrompt` is null (no `beforeinstallprompt` event dispatched).

#### Scenario: install called before beforeinstallprompt event

- GIVEN the hook is mounted but no `beforeinstallprompt` event has been dispatched
- WHEN `install()` is called
- THEN the function MUST return without throwing
- AND `isInstallable` MUST remain `false`
- AND no native prompt dialog SHALL be displayed

### Requirement: COV-CATEGORY-FALLBACK — unknown category falls back to raw key

When `checkCategoryLimits` encounters a food category absent from `CATEGORY_DISPLAY_NAMES`, the validator SHALL use the raw category key string as the display fallback.

#### Scenario: validate with a category key not in display map

- GIVEN a category key string with no entry in `CATEGORY_DISPLAY_NAMES`
- WHEN rations are validated for that category via `validateRations`
- THEN the function MUST NOT throw
- AND the display name SHALL resolve to the raw category key

### Requirement: COV-AESAN-MISSING — validateFoodPortions skips categories without AESAN standard

`validateFoodPortions` SHALL skip foods whose category has no entry in `AESAN_GRAM_STANDARDS`, generating no alerts.

#### Scenario: food with category absent from AESAN_GRAM_STANDARDS

- GIVEN a food entry whose `category` is not a key in `AESAN_GRAM_STANDARDS`
- WHEN `validateFoodPortions([food])` is called
- THEN the function MUST return an empty array
- AND no error SHALL be thrown

### Requirement: COV-HIGHPRIORITY — isHighPriority foods sort first in pickSustainableFood

`pickSustainableFood` SHALL sort foods with `isHighPriority: true` ahead of foods without the flag within the same category.

#### Scenario: Bacalao (high-priority) vs other FISH

- GIVEN the FISH catalog contains Bacalao (`isHighPriority: true`) and other fish without the flag
- WHEN `generateWeeklyPlan` selects FISH entries
- THEN Bacalao SHALL appear in the generated plan
- AND Bacalao SHALL be the first FISH option in the sorted sequence

### Requirement: COV-AOVE-EMPTY — enforceAOVE skips when no OLIVE_OIL in catalog

`enforceAOVE` SHALL silently skip olive oil addition when no OLIVE_OIL food exists in the catalog.

#### Scenario: enforceAOVE with empty OLIVE_OIL catalog

- GIVEN the foods catalog contains zero foods with category `OLIVE_OIL`
- WHEN `enforceAOVE(entries, day)` is called
- THEN the returned array SHALL contain only the original entries
- AND no OLIVE_OIL entries SHALL be added
- AND no error SHALL be thrown
