# deploy-github-pages Specification

## Purpose

Automated deployment of the NutreFitDia PWA to GitHub Pages via GitHub Actions, triggered on push to `main`. Uses official `actions/upload-pages-deploy-artifact` and `actions/deploy-pages` with correct OIDC permissions.

## Requirements

### Requirement: DEPLOY-TRIGGER

The deploy workflow MUST trigger on push to the `main` branch.

#### Scenario: Push to main triggers deploy

- GIVEN a commit is pushed or merged to `main`
- WHEN the GitHub Actions event fires
- THEN the deploy workflow SHALL start running

### Requirement: DEPLOY-BUILD

The workflow MUST build the production artifact with the correct Vite base path.

#### Scenario: Production build succeeds

- GIVEN the workflow has checked out code and installed dependencies
- WHEN `pnpm build` executes
- THEN `dist/` is produced with all asset references prefixed by `/nutre-fit-dia/`

### Requirement: DEPLOY-ARTIFACT

The workflow MUST upload `dist/` as a GitHub Pages deploy artifact using `actions/upload-pages-deploy-artifact`.

#### Scenario: Build output is uploaded

- GIVEN `dist/` exists after the build step
- WHEN `upload-pages-deploy-artifact` runs with path `./dist`
- THEN the artifact is available for deployment

### Requirement: DEPLOY-PUBLISH

The workflow MUST publish the uploaded artifact to GitHub Pages using `actions/deploy-pages`.

#### Scenario: Site is deployed

- GIVEN the Pages artifact has been uploaded
- WHEN `deploy-pages` executes
- THEN the site is served at `https://darkmagic76.github.io/nutre-fit-dia/`

### Requirement: DEPLOY-PERMISSIONS

The workflow job MUST declare the minimum required GITHUB_TOKEN permissions: `contents: read`, `pages: write`, `id-token: write`.

#### Scenario: OIDC token is available for deployment

- GIVEN the workflow uses `id-token: write` permission
- WHEN `deploy-pages` executes
- THEN the OIDC token is available and deployment authenticates without secrets
