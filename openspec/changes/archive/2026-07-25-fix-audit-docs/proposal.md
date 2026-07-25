# Proposal: Fix Audit-Docs

## Intent

Remediate documentation, configuration, and coverage gaps found during the 2026-07-25 comprehensive audit. No source code bugs exist. All issues stem from the Supabase → GitHub Pages migration (ADR-011) and stale metrics. Eight items already fixed pre-SDD. Two pending decisions remain, plus three optional Boy Scout improvements.

## Scope

### In Scope
- **#9 — README CI alignment (9C)**: Update CI pipeline diagram to match actual `ci.yml` (`pnpm quality` + `pnpm build`). Add "Future CI enhancements" note (gitleaks, pnpm audit, E2E, deploy trigger).
- **#10 — 100% functions coverage (10B)**: Identify the 1 uncovered function (257/258, 99.61%), write a focused unit test, verify `pnpm test:coverage` exits zero with `functions: 100` met.
- **S2 — Session files cleanup**: Add `session-ses_*.md` to `.gitignore` to prevent future AI session artifacts from being tracked.
- **S3 — TASKS.md evaluation**: Audit `TASKS.md` (stale: 578 tests/59 files). Archive to `adr/archive/` if unused as a working document; remove otherwise.

### Out of Scope
- New features, behavior changes, or CI pipeline expansion
- `PlanView.tsx` (243 lines) refactor — deferred (S1)
- Gitleaks, pnpm audit, E2E integration into CI — excluded per decision (scope creep)
- History cleanup for already-committed session files — accept as academic repo artifact
- Source code modifications beyond the single coverage test

## Pre-Work Completed (Pre-SDD)

Eight items fixed and quality-checked during audit before formal SDD:

1. **ADR-009** — Supabase → GitHub Pages, marked superseded by ADR-011
2. **pwa-service-worker spec** — removed Supabase runtime caching requirement
3. **`.vscode/mcp.json`** — removed stale Supabase MCP entries
4. **`.husky/pre-commit`** — `pnpm quality`, `.nvmrc` (Node 22), `engines` field
5. **verify-report.md** — 56→60 files, 544→580 tests, CRITICAL resolved
6. **config.yaml** — 53→60 files, 510→580 tests
7. **FR-MATRIX-trazabilidad.md** — 578→580 tests, 59→60 files
8. **SPECS_RF.md + SPECS_TECH.md** — Supabase → GitHub Pages

## Capabilities

### New Capabilities
None — no new capabilities introduced.

### Modified Capabilities
None — no spec-level requirement changes.

## Approach

- **#9 (README)**: Edit `README.md` CI/CD section. Replace aspirational pipeline diagram (gitleaks → quality → E2E → deploy) with actual gate: `pnpm quality` (format:check + lint + typecheck + test:run) → `pnpm build`. Append "Future CI enhancements" note listing planned additions.
- **#10 (coverage)**: Run `pnpm test:coverage --reporter=json` to identify the uncovered function. Write a focused AAA test. Run `pnpm test:coverage` to confirm 100% functions and exit code 0. Fallback if untestable: lower threshold to 80 (spec minimum).
- **S2 + S3**: Edit `.gitignore` to ignore `session-ses_*.md`. Evaluate `TASKS.md` staleness; if unused, archive to `adr/archive/` or remove.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `README.md` | Modified | CI/CD section to match current `ci.yml` |
| `src/**/*.test.ts` (TBD) | New | 1 test for uncovered function |
| `.gitignore` | Modified | Add `session-ses_*.md` pattern |
| `TASKS.md` | Archived/Removed | Stale task tracker |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Uncovered function is framework internals / untestable | Low | Fallback to Option A: lower config threshold to 80 (spec compliant) |
| TASKS.md still actively used as working document | Low | Confirm staleness before removal; don't delete if in active use |

## Rollback Plan

All changes are docs/config/tests — trivially reverted via `git revert`. No data migration or deployment impact.

## Dependencies

None. No external services, no deployment pipeline dependencies.

## Success Criteria

- [ ] `README.md` CI section accurately describes `ci.yml` pipeline
- [ ] `pnpm test:coverage` exits 0 with functions coverage = 100%
- [ ] `session-ses_*.md` tracked by `.gitignore` (no future artifacts)
- [ ] `TASKS.md` evaluated and either removed or confirmed still active
- [ ] `pnpm quality && pnpm build` passes with zero failures
