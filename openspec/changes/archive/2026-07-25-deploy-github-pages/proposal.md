# Proposal: Deploy to GitHub Pages & Remove Supabase References

## Intent

Deploy to GitHub Pages per ADR-011. Remove all Supabase references — Supabase is not installed (zero deps, imports). Fix base-path issues for `darkmagic76.github.io/nutre-fit-dia`.

## Scope

**In:** Create `.github/workflows/deploy.yml` (actions/deploy-pages on push to main) and `ci.yml` (quality gate → deploy trigger). Add `base: '/nutre-fit-dia/'` to `vite.config.ts`. Fix `manifest.json` paths (start_url, scope, icons) to `/nutre-fit-dia/` prefix. Fix `App.tsx` L163 absolute security.txt → relative. Remove Supabase from README (EN+ES stack tables), SETUP (4 rows: EN L72+L254, ES L377+L561), VitePWA runtimeCaching block, and CSP `connect-src`. Update `openspec/config.yaml` context.

**Out:** Custom domain, E2E for deployed site, V2 Supabase adapters, auto-generated manifest.

## Capabilities

### New
- `deploy-github-pages`: GitHub Actions deploy workflow, Vite base-path, manifest path corrections, static-only CSP.

### Modified
- `pwa-service-worker`: SW-RUNTIME — remove Supabase runtime caching (ADR-011). NetworkFirst preserved.
- `https-transport`: CSP `connect-src` drops `*.supabase.co`.

## Approach

Config-only. Zero runtime logic impact. `base` affects production builds only. Standard GitHub Pages + pnpm build. No new deps. Zero test regressions expected.

## Affected Areas

| File | Impact |
|------|--------|
| `vite.config.ts` | Add `base`, remove supabase runtimeCaching |
| `public/manifest.json` | Prefix paths with `/nutre-fit-dia/` |
| `src/App.tsx` ~L163 | Relative security.txt link |
| `index.html` | Remove supabase.co from CSP |
| `.github/workflows/deploy.yml` | New |
| `.github/workflows/ci.yml` | New |
| `README.md` | Remove Supabase from stack tables |
| `SETUP.md` | Remove Supabase (4 rows) |
| `openspec/config.yaml` | Update context |
| `pwa-service-worker/spec.md` | Delta: SW-RUNTIME |

## Risks

| Risk | L. | Mitigation |
|------|----|------------|
| Base path breaks dev experience | Low | Vite base affects only `pnpm build` |
| CSP too restrictive | Low | No external APIs in V1 |
| security.txt 404 with relative path | Low | SPA handles relative hrefs; verify post-deploy |

## Rollback

`git revert`. Disable Pages in Settings for instant deploy stop. No DB, no API keys.

## Dependencies

- GitHub Pages enabled in repo Settings (manual, one-time)
- `pnpm build` succeeds (verified: 580 tests, build passes)

## Success Criteria

- [ ] `pnpm build` succeeds with `base`, zero Supabase references in output
- [ ] `https://darkmagic76.github.io/nutre-fit-dia` serves app with working assets and PWA manifest
- [ ] All 580 tests pass without modification
- [ ] `pnpm verify` passes
- [ ] Deployed CSP has no `supabase.co`
