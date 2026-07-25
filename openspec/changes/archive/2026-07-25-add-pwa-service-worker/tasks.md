# Tasks: Add PWA Service Worker

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~25 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Dependency + config + registration | Single PR | ~25 lines across 4 files + lockfile |

## Phase 1: Dependency Installation

- [x] 1.1 Run `pnpm add -D vite-plugin-pwa` — installs vite-plugin-pwa plus workbox-build and workbox-window peer deps
- [x] 1.2 Run `pnpm install` — verify clean install, no warnings

## Phase 2: Configuration

- [x] 2.1 Update `vite.config.ts`: add `import { VitePWA } from 'vite-plugin-pwa'`, insert plugin after `tailwindcss()` with config: `manifest: false`, `registerType: 'autoUpdate'`, `includeAssets: ['favicon.svg']`, workbox with `globPatterns: ['**/*.{js,css,html,svg}']`, runtimeCaching (supabase.co, NetworkFirst, 50 entries, 24h), `cleanupOutdatedCaches: true`
- [x] 2.2 Update `.gitignore`: append `sw.js` and `dev-sw.js`
- [x] 2.3 Run `pnpm typecheck` — verify config compiles without type errors

## Phase 3: Registration Guard

- [x] 3.1 Update `src/main.tsx`: append guarded SW registration block — wrap `if ('serviceWorker' in navigator) { import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })) }`
- [x] 3.2 Run `pnpm test:run` — verify all 580 existing tests pass in jsdom (guard prevents SW import)

## Phase 4: Build Verification

- [x] 4.1 Run `pnpm build` — verify `dist/sw.js` is generated with precache manifest
- [x] 4.2 Run `pnpm verify` — full quality gate (format + lint + typecheck + test:run + build)

## Phase 5: Cleanup

- [x] 5.1 Run `pnpm lint` — oxlint clean, zero warnings
- [x] 5.2 Final `pnpm test:run` — confirm all 580 tests green, zero regressions
