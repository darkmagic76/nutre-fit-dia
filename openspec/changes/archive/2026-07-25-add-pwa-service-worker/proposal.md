# Proposal: Add PWA Service Worker

## Intent

Make the PWA truly offline-capable via a Workbox-based service worker. The app currently claims "offline-ready" but has zero service worker — only the browser HTTP cache provides fallback.

## Scope

### In Scope
- Add `vite-plugin-pwa`, `workbox-build`, `workbox-window` as devDependencies
- Configure Workbox in `vite.config.ts`: precache app shell (`globPatterns: ['**/*.{js,css,html,svg}']`), runtime cache Supabase API (`NetworkFirst`, 50 entries, 24h expiration)
- `manifest: false` to preserve existing hand-crafted `public/manifest.json`
- `includeAssets: ['favicon.svg']`
- Guard SW registration in `src/main.tsx` via lazy `virtual:pwa-register` import, wrapped in `'serviceWorker' in navigator` for jsdom compatibility
- Update `.gitignore` for generated `sw.js` and `dev-sw.js`

### Out of Scope
- UI changes, logic changes, test changes
- E2E tests for offline behavior (future work)
- Push notifications, background sync, or other advanced SW features

## Capabilities

### New Capabilities
- `pwa-service-worker`: offline support via Workbox-based service worker with precaching (app shell + bundled assets) and runtime caching (Supabase API with NetworkFirst strategy)

### Modified Capabilities
None — this is additive. The existing `pwa-install` spec covers `beforeinstallprompt` handling and is unaffected.

## Approach

- `registerType: 'autoUpdate'` — new SW immediately activates via `skipWaiting` + `clientsClaim`
- Virtual module import in `src/main.tsx`: `import('virtual:pwa-register')` wrapped in `'serviceWorker' in navigator` guard ensures jsdom test environment doesn't break (580 tests pass unchanged)
- Precaching covers app shell + food catalog (bundled assets)
- Runtime caching: Supabase API with `NetworkFirst`, 50 entries, 24h expiration
- Zero test changes — guard handles jsdom, no new test files

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `vite.config.ts` | Modified | Add VitePWA plugin with Workbox config |
| `src/main.tsx` | Modified | Add lazy SW registration with navigator guard |
| `.gitignore` | Modified | Add `sw.js`, `dev-sw.js` |
| `package.json` | Modified | Add 3 devDependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `virtual:pwa-register` breaks jsdom tests | Low | Guarded by `'serviceWorker' in navigator` — jsdom lacks this API |
| Build generates unexpected SW artifacts | Low | `manifest: false` + explicit `.gitignore` entries |
| Runtime caching conflicts with Supabase auth | Low | `NetworkFirst` falls back to cache only when offline; auth tokens handled by existing Supabase client |

## Rollback Plan

`pnpm remove vite-plugin-pwa workbox-build workbox-window` + revert `vite.config.ts`, `src/main.tsx`, `.gitignore`. Three-file revert, zero data migration.

## Dependencies

- `vite-plugin-pwa` ^0.21.x (confirmed compatible with Vite 8 per exploration)

## Success Criteria

- [ ] `pnpm build` generates `dist/sw.js` with precache manifest
- [ ] `pnpm test:run` passes all 580 tests (SW registration guarded)
- [ ] `pnpm verify` passes full quality gate (format + lint + typecheck + test:run + build)
- [ ] App loads offline after first visit (DevTools → Application → Service Workers confirms SW active)
