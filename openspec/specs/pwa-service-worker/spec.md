# pwa-service-worker Specification

## Purpose

Offline-capable PWA via Workbox-based service worker. Enables precaching of the app shell. Runtime caching is intentionally empty (`runtimeCaching: []`) per ADR-011 — the app is a static SPA with no backend API to cache.

## Requirements

### Requirement: SW-GENERATE

`vite-plugin-pwa` MUST generate a Workbox service worker during `pnpm build` that precaches all app shell assets matching `globPatterns: ['**/*.{js,css,html,svg}']`.

#### Scenario: Build generates service worker

- GIVEN the project builds successfully
- WHEN `pnpm build` runs
- THEN `dist/sw.js` exists and contains a precache manifest

#### Scenario: App loads offline after first visit

- GIVEN the user has visited the app once online and the SW is installed
- WHEN they open the app without internet connectivity
- THEN the app shell renders from precache

### Requirement: SW-REGISTER

The app MUST lazily import `virtual:pwa-register` in `main.tsx`, guarded by `'serviceWorker' in navigator` to prevent jsdom test failures.

#### Scenario: Service worker registers in browser

- GIVEN the app loads in a browser that supports service workers
- WHEN `main.tsx` executes
- THEN `navigator.serviceWorker.register()` is called via the virtual module

#### Scenario: Service worker does NOT register in test environment

- GIVEN tests run in jsdom where `navigator.serviceWorker` is undefined
- WHEN `main.tsx` executes
- THEN no SW registration attempt occurs and no error is thrown

### Requirement: SW-MANIFEST

The existing `public/manifest.json` MUST NOT be modified. VitePWA config SHALL use `manifest: false`.

#### Scenario: Existing manifest.json preserved

- GIVEN `manifest: false` in the VitePWA configuration
- WHEN the build runs
- THEN `public/manifest.json` is used as-is without automatic generation or modification

### Requirement: SW-CLEANUP

Outdated caches MUST be removed on new service worker activation. Config: `cleanupOutdatedCaches: true`.

#### Scenario: Old caches cleaned on update

- GIVEN a new service worker activates after a build update
- WHEN the `activate` event fires
- THEN all caches from previous SW versions are deleted, retaining only the current precache

### Requirement: SW-CLAIM

A new service worker MUST immediately take control of all pages. Config: `clientsClaim: true`, `skipWaiting: true` (via `registerType: 'autoUpdate'`).

#### Scenario: New SW takes control immediately

- GIVEN a service worker update is detected
- WHEN the new SW finishes installing
- THEN it activates and claims all open clients without waiting for page reload

### Requirement: SW-GITIGNORE

Generated `sw.js` and `dev-sw.js` MUST be excluded from version control via `.gitignore`.

#### Scenario: Generated files excluded from git

- GIVEN the project `.gitignore` includes entries for `sw.js` and `dev-sw.js`
- WHEN `pnpm build` generates `dist/sw.js` or the dev server generates `dev-sw.js`
- THEN these files are not tracked by Git

### Requirement: SW-REGRESSION

All 580 existing tests MUST pass after service worker integration, with zero test file modifications.

#### Scenario: All tests pass post-integration

- GIVEN the SW registration is guarded by `'serviceWorker' in navigator` in `main.tsx`
- WHEN `pnpm test:run` executes all Vitest suites in jsdom
- THEN all 580 tests pass without modification, including store, component, and integration tests
