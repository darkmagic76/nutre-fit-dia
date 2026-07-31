# Exploration: fix-audit-docs

**Date**: 2026-07-25
**Source**: Comprehensive codebase audit (2026-07-25)
**Artifact mode**: openspec

---

## Current State

The project (**nutre-fit-dia**: React 19 + TypeScript 6 + Vite 8 PWA) is in excellent health:

| Metric | Value |
|--------|-------|
| Test files | 60 |
| Tests | 580 (all passing) |
| Build | Clean (tsc + vite) |
| Lint (oxlint) | Zero violations |
| Formatting (Prettier) | All files compliant |
| Verify pipeline | `pnpm verify` exits 0 |
| Architecture | Screaming Architecture, Scope Rule compliant (0 violations) |
| i18n | ES/EN complete, zero hardcoded strings |
| OpenSpec specs | 21 specs, all implemented and verified |
| ADRs | 11 ADRs, all compliant |

The audit found **NO source code bugs**. All issues are documentation, configuration, or stale-reference problems caused by the recent migration from Supabase to GitHub Pages (ADR-011).

---

## What We Found

### CRITICAL — Already Fixed 🔧

These were found and corrected during the audit, BEFORE formal SDD process:

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `adr/ADR-009-technology-stack.md` | Described Supabase-backed architecture superseded by ADR-011 | Title updated to "SPA + PWA", diagram rebuilt, backend/hosting/CI/CD sections updated with `<details>` preserving original |
| 2 | `openspec/specs/pwa-service-worker/spec.md` | Mandated SW-RUNTIME requirement for Supabase runtime caching intentionally removed | SW-RUNTIME requirement and scenario removed; spec now correctly states `runtimeCaching: []` |
| 3 | `.vscode/mcp.json` | 2 stale Supabase MCP server entries from ADR-011 migration | Both entries removed; config is now `"servers": {}` |

### WARNING — Already Fixed 🔧

| # | File | Issue | Fix |
|---|------|-------|-----|
| 4 | `.husky/pre-commit` | Hardcoded Node v25.9.0 PATH | Now uses `pnpm quality` (canonical entry point); `.nvmrc` added (Node 22); `engines` field in `package.json` (`node >=22`, `pnpm >=9`) |
| 5 | `openspec/verify-report.md` | Stale: 56 files / 544 tests | Updated to 60 files / 580 tests, date to 2026-07-25, Scope Rule CRITICAL marked resolved |
| 6 | `openspec/config.yaml` | Stale: 53 files / 510 tests | Updated to 60 files / 580 tests |
| 7 | `adr/FR-MATRIX-trazabilidad.md` | Stale: 578 tests / 59 files | Updated to 580 tests / 60 files; coverage marked approximate (needs Node 22+ regeneration) |
| 8 | `SPECS_RF.md` + `SPECS_TECH.md` | Supabase hosting/backend references | Replaced with GitHub Pages static hosting; Supabase deferred to V2 |

### PENDING — Needs User Decision ❓

These two items remain open because they involve tradeoffs that need human judgment:

| # | Item | Current State | Options |
|---|------|--------------|---------|
| **9** | **CI workflow vs README gap** | `ci.yml` only runs `pnpm quality` + `pnpm build` on push to `develop` / PR to `main`. README promises: 🔒 Security Audit (gitleaks, pnpm audit) → ✅ Quality Gate (format:check + lint + typecheck + 580 unit tests) → 🎭 E2E → 🚀 Deploy. None of these extra steps exist in CI. | A. Enhance CI, B. Fix README, C. Mix |
| **10** | **Coverage threshold mismatch** | `vite.config.ts` sets `functions: 100` but actual coverage is 99.61% (257/258 functions). `pnpm test:coverage` exits non-zero. Spec minimum is 80. | A. Lower to 80, B. Write the missing test |

### SUGGESTION — Boy Scout (Optional) 🧹

| # | Item | Details |
|---|------|---------|
| S1 | `PlanView.tsx` (243 lines) | Heaviest component, could split PlanView into PlanView (UI shell) + PlanDayCard/PlanMealRow, or extract inline `<details>` sections |
| S2 | Session files (5 files, ~976KB) | `session-ses_*.md` in repo root — AI session artifacts, should be in `.gitignore` or a `sessions/` dir |
| S3 | `TASKS.md` (16KB) | Appears stale (refers to 578 tests/59 files); if no longer used as a working document, could be archived or removed |

---

## Affected Areas

- `openspec/changes/fix-audit-docs/exploration.md` — this document
- `adr/ADR-009-technology-stack.md` — **already fixed**
- `openspec/specs/pwa-service-worker/spec.md` — **already fixed**
- `.vscode/mcp.json` — **already fixed**
- `.husky/pre-commit` — **already fixed**
- `.nvmrc` — **already fixed** (created)
- `package.json` — **already fixed** (engines field)
- `openspec/verify-report.md` — **already fixed**
- `openspec/config.yaml` — **already fixed**
- `adr/FR-MATRIX-trazabilidad.md` — **already fixed**
- `SPECS_RF.md` — **already fixed**
- `SPECS_TECH.md` — **already fixed**
- `.github/workflows/ci.yml` — **pending decision** (item 9)
- `README.md` — **pending decision** (item 9)
- `vite.config.ts` — **pending decision** (item 10)
- `src/features/recipe-engine/PlanView.tsx` — **optional** (S1)
- `session-ses_*.md` (5 files) — **optional** (S2)
- `TASKS.md` — **optional** (S3)

---

## Approaches

### Item 9: CI Workflow vs README Gap

#### Approach 9A: Enhance CI to match README

Add jobs for gitleaks, pnpm audit, E2E tests, and deploy to the CI pipeline.

**Pros:**
- README matches reality
- Adds real security scanning (gitleaks) and vulnerability checks (pnpm audit)
- E2E tests run automatically on PRs
- Complete CI/CD story

**Cons:**
- Adds CI minutes (gitleaks install + scan, audit, Playwright E2E run)
- gitleaks requires `gitleaks-action` or manual install
- E2E tests require Playwright browser install in CI (adds ~30s)
- Deploy job on PR/develop may not be desired (deploy is currently main-only in `deploy.yml`)

**Effort:** Medium

#### Approach 9B: Fix README to match CI

Simplify the CI/CD section of README to describe what `ci.yml` actually does: `quality` (format:check + lint + typecheck + test:run) + build.

**Pros:**
- Minimal effort (only README changes)
- No CI pipeline changes
- README accurately reflects reality

**Cons:**
- Loses the aspirational CI story (security audit, E2E, deploy)
- gitleaks and pnpm audit would never run in CI
- E2E tests would only run locally

**Effort:** Low

#### Approach 9C: Mix — Fix README now, document what's added later

Update README to match current CI. Add a "Future CI enhancements" note mentioning what could be added (gitleaks, audit, E2E, deploy trigger).

**Pros:**
- README accurate now
- Documents path forward
- Minimal immediate effort
- No CI minutes impact

**Cons:**
- CI remains minimal
- No automated security or E2E

**Effort:** Low

### Item 10: Coverage Threshold Mismatch

#### Approach 10A: Lower `functions` threshold to 80

Change `functions: 100` to `functions: 80` in `vite.config.ts` to match the OpenSpec spec.

**Pros:**
- `pnpm test:coverage` exits 0
- Matches spec minimum (80)
- 5-second fix

**Cons:**
- Self-imposed quality bar lowered
- The 0.39% gap never gets resolved
- No regression signal if coverage drops further

**Effort:** Very Low

#### Approach 10B: Write the missing test for the 1 uncovered function

Find the uncovered function and write a test. `functions: 100` is met.

**Pros:**
- Full 100% functions coverage maintained
- Self-imposed quality bar met
- Better test coverage

**Cons:**
- Need to identify which function is uncovered (likely cooldownTracker or similar utility)
- Unknown if the uncovered function is trivial or complex to test
- Requires investigation and test writing

**Effort:** Low-Medium

---

## Recommendation

### Item 9: CI vs README → Approach 9C (Mix)

Fix README to reflect current CI reality. Add a "Future CI" note documenting the security/E2E/deploy items as aspirational. This is the pragmatic choice for a TFM project — the CI gate (`pnpm quality + pnpm build`) already catches the most important things (type errors, lint violations, test failures, build breaks). Adding gitleaks/audit/E2E is good practice but not critical for a static SPA with no secrets, no backend, and no database.

### Item 10: Coverage Threshold → Approach 10B (Write the missing test)

The gap is 1 function (0.39%). Closing it is a quick win that keeps the self-imposed 100% bar and preserves the quality signal. If after investigation the function is genuinely untestable (e.g., a framework callback), then fall back to 10A.

### Boy Scout Items

- **S2 (Session files)**: Add `session-ses_*.md` to `.gitignore` or move them to a `sessions/` directory and add `sessions/` to `.gitignore`. These are AI session artifacts and should not be in the repo root.
- **S3 (TASKS.md)**: If determined unused as a working document, archive to `adr/archive/` or remove (git tracks history).
- **S1 (PlanView.tsx)**: Defer — 243 lines is not critical. Consider during a future refactor if it grows further.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing the uncovered function (item 10) | Medium | Low | Run `pnpm test:coverage --reporter=json` and inspect the uncovered function before deciding |
| README fix for CI creates perception of reduced quality | Low | Low | "Future CI" note frames it as pragmatic TFM scope, not quality degradation |
| Session files in `.gitignore` still exist in git history | High | Low | They're already committed — `.gitignore` only prevents future tracking. For history cleanup, use `git filter-branch` or just leave them (academic repo) |
| Scope creep from Boy Scout items | Low | Low | Explicitly mark as DEFFERED or SKIP in tasks; only session file cleanup is worth doing now |

---

## Ready for Proposal

**Yes.** The 8 CRITICAL/WARNING issues found in the audit have already been fixed. The exploration clearly defines the 2 pending decisions and 3 Boy Scout suggestions with tradeoffs evaluated.

The orchestrator should ask the user for decisions on:
1. **Item 9**: How to handle the CI/README gap — recommend Approach 9C (Mix)
2. **Item 10**: Coverage threshold — recommend Approach 10B (write missing test, fallback to 10A)
3. **Boy Scout**: Which of S1-S3 to include (recommend S2 and S3, defer S1)
