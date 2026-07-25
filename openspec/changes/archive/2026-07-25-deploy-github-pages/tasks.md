# Tasks: Deploy to GitHub Pages & Remove Supabase References

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~81 (9 files modified, 2 created) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | not applicable |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not applicable
400-line budget risk: Low

## Phase 1: Supabase Cleanup (requirement-area: pwa-service-worker, https-transport, documentation)

- [x] 1.1 Remove `runtimeCaching` supabase.co entry from `vite.config.ts` L23-31 (~3 lines) — satisfies **SW-RUNTIME**
- [x] 1.2 Remove `https://*.supabase.co` from CSP `connect-src` in `index.html` (~1 line) — satisfies **CSP-CONNECT**
- [x] 1.3 Remove Supabase JS row from README.md EN stack table (~1 line) — satisfies **DOC-SUPABASE-REMOVAL**
- [x] 1.4 Remove Supabase JS row from README.md ES stack table (~1 line) — satisfies **DOC-SUPABASE-REMOVAL**
- [x] 1.5 Remove 4 Supabase references from `SETUP.md` (EN L70+L254, ES L377+L561) (~4 lines) — satisfies **DOC-SETUP-CLEANUP**
- [x] 1.6 Update `openspec/config.yaml` context: `"SPA + Supabase BaaS"` → `"SPA (static-only)"` (~1 line) — satisfies **DOC-SUPABASE-REMOVAL**

## Phase 2: Vite & Path Configuration (requirement-area: static-assets)

- [x] 2.1 Add `base: '/nutre-fit-dia/'` to `vite.config.ts` default export (~1 line) — satisfies **BASE-PATH**
- [x] 2.2 Update `public/manifest.json`: `start_url` → `"/nutre-fit-dia/"`, add `scope: "/nutre-fit-dia/"`, fix `icons[0].src` → `"/nutre-fit-dia/favicon.svg"` (~3 lines) — satisfies **MANIFEST-PATHS**
- [x] 2.3 Fix security.txt link in `src/App.tsx` L163: absolute `"/.well-known/security.txt"` → relative `".well-known/security.txt"` (~1 line) — satisfies **SECURITY-TXT**

## Phase 3: CI/CD Workflows (requirement-area: ci-pipeline, deploy-github-pages)

- [x] 3.1 Create `.github/workflows/ci.yml`: trigger on push to `develop` + PR to `main`, checkout → setup-node (`lts/*`, pnpm) → `pnpm quality` → `pnpm build` (~28 lines) — satisfies **CI-QUALITY**, **CI-DEPLOY-TRIGGER**
- [x] 3.2 Create `.github/workflows/deploy.yml`: trigger on push to `main`, checkout → setup-node → `pnpm install --frozen-lockfile` → `pnpm build` → `upload-pages-artifact` → `deploy-pages`, permissions: `contents:read, pages:write, id-token:write` (~32 lines) — satisfies **DEPLOY-TRIGGER**, **DEPLOY-BUILD**, **DEPLOY-ARTIFACT**, **DEPLOY-PUBLISH**, **DEPLOY-PERMISSIONS**

## Phase 4: Verification

- [x] 4.1 Run `pnpm build` — verify `dist/index.html` has `/nutre-fit-dia/` asset paths, `dist/sw.js` has no `supabase.co`
- [x] 4.2 Run `pnpm quality` — verify all 580 tests pass, lint + typecheck green
- [x] 4.3 Run `pnpm verify` (quality + build) — final gate, zero regressions
