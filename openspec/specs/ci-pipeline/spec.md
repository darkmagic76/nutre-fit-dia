# ci-pipeline Specification

## Purpose

Continuous integration quality gate for every push and pull request. Ensures linting, type-checking, and tests pass before code reaches `main`.

## Requirements

### Requirement: CI-QUALITY

A GitHub Actions workflow MUST run `pnpm quality` (lint + typecheck + test:run) on every push to `develop` and every pull request targeting `main`.

#### Scenario: Push to develop triggers quality check

- GIVEN a commit is pushed to the `develop` branch
- WHEN the CI workflow executes
- THEN `pnpm quality` SHALL run and the workflow SHALL fail if any step fails

#### Scenario: PR to main triggers quality check

- GIVEN a pull request is opened or updated targeting `main`
- WHEN the CI workflow executes
- THEN `pnpm quality` SHALL run and the result SHALL gate merge eligibility

### Requirement: CI-DEPLOY-TRIGGER

The CI workflow SHALL verify the production build succeeds to ensure deploy-readiness of every change.

#### Scenario: Build verification runs on PR

- GIVEN a pull request targets `main`
- WHEN the CI workflow reaches the build step
- THEN `pnpm build` SHALL execute and verify that the production artifact can be created
