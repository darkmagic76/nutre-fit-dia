# Tasks: Fix Audit-Docs

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~30 lines (README only) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | README CI fix + verification | Single PR | ~30 lines; no code changes beyond docs |

## Phase 0: Pre-Work (completed before SDD formalization)

- [x] 0.1 `adr/adr-009-supabase.md` — marked superseded by ADR-011
- [x] 0.2 `openspec/specs/pwa-service-worker/spec.md` — removed Supabase runtime caching
- [x] 0.3 `.vscode/mcp.json` — removed stale Supabase MCP entries
- [x] 0.4 `.husky/pre-commit` — `pnpm quality`, `.nvmrc` Node 22, `engines` field
- [x] 0.5 `verify-report.md` — 56→60 files, 544→580 tests, CRITICAL resolved
- [x] 0.6 `openspec/config.yaml` — 53→60 files, 510→580 tests
- [x] 0.7 `FR-MATRIX-trazabilidad.md` — 578→580 tests, 59→60 files
- [x] 0.8 `SPECS_RF.md` + `SPECS_TECH.md` — Supabase → GitHub Pages references

## Phase 1: README CI Alignment

- [x] 1.1 Replace EN §10 CI diagram (L171-183): show actual `ci.yml` pipeline — `Push/PR → ✅ Quality Gate (pnpm quality) → 📦 Build (pnpm build)`. Remove false gitleaks, `pnpm audit`, E2E, and deploy steps. Remove "Protected branches: staging" (ci.yml only triggers on develop/main). Note deployment is separate `deploy.yml` (main-only). Run `pnpm verify` to confirm no regressions.
- [x] 1.2 Replace ES §10 CI diagram (L370-382): same as 1.1 in Spanish. Remove gitleaks, `pnpm audit`, E2E, deploy. Remove "Ramas protegidas: staging".
- [x] 1.3 Remove `Dependency audit` and `Secret scanning` rows from both §11 OWASP tables (EN L195-196, ES L394-395). NO gitleaks anywhere. NO `pnpm audit` CI claims. Zero replacements — just remove the two rows.

## Phase 2: Verification

- [x] 2.1 Run `pnpm test:coverage` — confirm exit 0 with `functions: 100` (260/260, 580 tests, 60 files). Document result.
- [x] 2.2 Confirm `.gitignore` L21 already has `session-ses_*` pattern (verified present). No changes needed.

## Phase 3: Documentation Artifact

- [x] 3.1 Confirm `TASKS.md` disposition: keep as historical TFM artifact. All 110-line tasks ✅ completed. Academic value as implementation log. No changes needed.
