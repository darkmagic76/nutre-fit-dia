# Archive Report

**Change**: deploy-github-pages
**Archived at**: 2026-07-25
**Archive path**: `openspec/changes/archive/2026-07-25-deploy-github-pages/`
**Verdict**: PASS — 19/19 scenarios compliant, 14/14 tasks complete, 580/580 tests green

## Specs Synced to Main

| Domain | Action | Details |
|--------|--------|---------|
| ci-pipeline | Created | New domain spec — CI quality gate for push/PR |
| deploy-github-pages | Created | New domain spec — GitHub Actions deploy workflow |
| documentation | Created | New domain spec — Supabase references removed from docs |
| https-transport | Updated | Added CSP-CONNECT requirement (removed supabase.co from connect-src) |
| pwa-service-worker | Updated | Added SW-RUNTIME requirement (runtimeCaching cleared, no Supabase entries) |
| static-assets | Created | New domain spec — Vite base path, manifest paths, relative security.txt |

## Archive Contents

| Artifact | Status |
|----------|--------|
| proposal.md | ✅ |
| specs/ (6 domains) | ✅ |
| design.md | ✅ |
| tasks.md | ✅ (14/14 tasks complete) |
| verify-report.md | ✅ (PASS) |
| archive-report.md | ✅ (this file) |

## Change Summary

- **12 files changed**: `.github/workflows/ci.yml` (new), `.github/workflows/deploy.yml` (new), `vite.config.ts`, `index.html`, `public/manifest.json`, `src/App.tsx`, `README.md` (EN+ES), `SETUP.md` (EN+ES, 4 entries), `openspec/config.yaml`
- **Zero Supabase references** after build (verified in dist/)
- **All asset paths** prefixed with `/nutre-fit-dia/`
- **CSP restricted** to `connect-src 'self'`
- **~81 lines total** — single PR (low budget risk)
- **GitHub Pages**: `https://darkmagic76.github.io/nutre-fit-dia/`
