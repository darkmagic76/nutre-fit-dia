# Coverage Threshold Specification

## Purpose

Define the coverage threshold requirements that must be enforced during test execution to match the project's quality policy.

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
