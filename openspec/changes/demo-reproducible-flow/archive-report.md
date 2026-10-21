# Archive Report: demo-reproducible-flow

- Change: `demo-reproducible-flow`
- Branch: `feature/demo-reproducible-flow` (local only — NO push, NO merge)
- Date closed: 2026-10-14
- Verdict: **ARCHIVED — SDD cycle complete** (planned → implemented → verified → archived)

## Scope Delivered

A visible guided demo tour (`features/demo-guide/`, 6 steps: datos iniciales → perfil →
escaneo → recomendación → sustitución → validaciones esperadas) over the REAL app,
driven through container ports, with a port-injected `seedDemo`/`resetDemo` application
service, atomic persisted-storage reset, es+en i18n, App overlay wiring with `?demo=1`
secondary deep-link, and an offline 6-step Playwright e2e spec. All per-step checks
compare live output against a frozen oracle (`DEMO_EXPECTED`) — expected is never
derived from the value being checked — so clinical drift fails loudly by design.

Out of scope (per proposal/spec Non-goals, unchanged): `docs/slides/` + README demo
section (separate docs change); new clinical thresholds, foods, or plan-algorithm
changes; Storybook-like harness (rejected).

## Slices and Verifications (final state at close)

| Unit | Commits | Budget 400 | Verify verdict |
|------|---------|-----------|----------------|
| Slice 1 — Phase 1 foundation (tasks 1.1–1.7) | `7e88dac`, `6adc871`, `3677faf` | 359 PASS | `verify-slice-1.md` PASS |
| Sub-slice 2A — WARNING fix + 2.1 + 2.5 | `8534462`, `bbdf153`, `84c3821`, `9236b30` | 231 PASS | `verify-2A.md` PASS |
| Sub-slice 2B — tasks 2.2 + 2.3 | `bfacccb` | 434, maintainer-approved `size:exception` (+8.5%) | `verify-2B.md` PASS WITH WARNINGS (W1/W2/W3) |
| Micro-slice W2-FIX — step-5 truth assert | `81234dd` (+19/−1) | 20 PASS | closed W2; container tests 9→10 |
| Sub-slice 2C — task 2.4 + Phase 3 (3.1 + 3.2) + carry asserts | `8bd2a3e` (279+/88−), `534c874` (66+/1−) | per-commit 367+67, no exception | `verify-2C.md` PASS WITH WARNINGS (W1 resolved, W3 carried) |
| Micro-slice W3-SPLIT — classification domain split | `32a7e8a`, `c8f62be` | 341 insertions PASS | closed W3 |
| Slice 3 — Phase 4 e2e + gates + IDB carry (4.1–4.3) | `7feaf8c` (124 lines) | 124 PASS | `verify-phase-4.md` PASS |
| Micro-slice PRE-PHASE5-POLISH — CSP meta, tour styling (install-banner confirmed NOT a bug) | `844f672` | 148 PASS | post-verify polish, gates re-green |
| Micro-slice DRAGGABLE — lighter backdrop + `useDraggablePanel` Pointer-Events hook | `418d4fa`, `34dca8a` | 346 PASS | 9 new tests, gates re-green |
| Micro-slice CONTENT-EDUCATIONAL — 6 hint VALUES revised es+en | `faec133` | 36 PASS | zero test edits |

Post-snapshot work supersedes intermediate claims: verify-2B WARNINGS W1 (View
extraction, sub-slice 2C), W2 (step-5 assert, commit `81234dd`), W3 (domain split,
commits `32a7e8a`+`c8f62be` — naive whole-file move explicitly rejected: Spanish reason
strings stay in the feature mapper, pure core in `src/domain/classification.ts` with
a `sugarAliases` re-export shim) are all CLOSED. Verify-slice-1 WARNING (in-memory
clear semantics) was closed in 2A. The slice-1 IDB-hardening suggestion was closed in
Phase 4 with a genuine warn-and-continue exercise. No CRITICAL issue was ever raised
in any verify report.

## Final Gates (at close — authoritative over intermediate snapshots)

- `pnpm quality`: GREEN — 92 files / 994 tests pass
- Functions coverage: 100% (407/407)
- `pnpm test:e2e -- demo`: 9/9 (5 demo + 4 smoke; filter matched both spec files = full suite)
- `tsc -b`: exit 0
- Phase 5 checks (orchestrator, 2026-10-14): tasks 5.1/5.2 complete — Tab/tab-nav
  files untouched (empty diff); no `fixtures` import in prod (single doc-comment
  mention only); no store imports in demo View/hook (comment-only matches);
  rollback notes present in proposal+spec+design+tasks.

## Remediation (2026-10-21) — spec gaps closed

A post-archive audit found two tour checks that could never fail (step 2 compared the
target against itself; step 6 hardcoded `passed: true`), duplicate `?demo=1` parsing,
and an "offline" e2e that only cut the network after load. Closed in six work units on
local `develop` — nothing pushed, nothing merged to a remote:

| WU | Change | Commit |
|----|--------|--------|
| WU1 | Ephemeral `StoreSet` per `createContainer()`; singleton wired to the global stores + `resetDemo` | `f426cd8` |
| WU2 | Frozen `DEMO_EXPECTED` oracle + drift canaries for steps 2 and 6 | `705aac5` |
| WU3 | `App.tsx` is the single owner of `?demo=1` | `dc9e436` |
| WU4 | Real offline cold start (`playwright.offline.config.ts` + CI `offline` job) | `eafc2ac` |
| WU5 | Dataset pinned; Day 1, Log violations and EN locale asserted | `95f5140` |
| WU6 | Spec/design/archive alignment (this section) | pending |

Gates after remediation: `pnpm quality` 95 files / 1025 tests, functions coverage
100% (420/420), `pnpm build`, `pnpm test:e2e` 10/10, `pnpm test:e2e:offline` 1/1.
These supersede the "Final Gates (at close)" numbers above.

## Review-Unit Ledger

Native attempt ledger UNAVAILABLE for the entire change (gentle-ai 4.1.1, no
`sdd-attempt` command) — manual per-slice budgets used throughout, recorded in each
apply-progress section. No review unit exceeded budget without approval: only 2B
(434/400) needed and received a maintainer-approved `size:exception`; all later
units fit (W2-fix 20; 2C per-commit 367+67; W3-split 341; Phase 4 124; polish 148;
draggable 346; content 36).

Carried non-gate items: (1) optional `en`-locale e2e step — owner-deferred suggestion
from verify-phase-4, NOT a gate; (2) one pre-existing oxlint warning
(`DemoGuideContainer` only-export-components, from slice 2B, not from this change's
final state logic).

## Rollback Plan

- Whole change: revert branch commits in reverse on `feature/demo-reproducible-flow`
  (local only — nothing pushed, nothing merged).
- E2E-only revert: delete `e2e/demo.spec.ts`, `e2e/offline.spec.ts` and
  `playwright.offline.config.ts`; drop `test:e2e:offline` and the CI `offline` job — zero prod impact.
- Removal boundary (per spec § Rollback): App entry (`App.tsx` button + `?demo=1`
  effect) + `seedDemo`/`resetDemo` from the Container port. `resetDemo` only clears
  `nutrefitdia-*` keys, so foreign data survives; no domain/threshold revert is needed.
  Feature modules, i18n keys and tests may remain dormant and be deleted
  opportunistically (full checklist in `design.md` § Migration / Rollout).
  W3-SPLIT moved pure classification core into `src/domain/` — reverting
  `32a7e8a`+`c8f62be` restores the feature-local layout with zero behavior change.

## Tasks Artifact

`tasks.md` Phases 1–4 marked complete during their slices; Phase 5 items 5.1/5.2
marked [x] at archive time (checks performed by orchestrator 2026-10-14 per handoff).
No stale unchecked implementation tasks remain.

## Deferred / Non-Goals

- `docs/slides/` + README demo section — separate docs change (proposal Non-goals).
- `en`-locale e2e step — delivered in WU5 (`tour follows the app locale (EN)`).
- PR-chain preparation (chained feature-branch delivery) — user-ordered future work,
  not part of this change.

## Reopen Conditions

Reopen this change only if: (a) a CRITICAL defect is found in the archived behavior
(requires re-running `sdd-verify`, never a prompt assertion); (b) rollback is executed
(record the revert commits here). New demo features belong to a NEW change, not a reopen.

## Traceability

- Artifacts: `openspec/changes/demo-reproducible-flow/` — `explore.md`,
  `proposal.md`, `spec.md`, `design.md`, `tasks.md`, `apply-progress.md`,
  `verify-slice-1.md`, `verify-2A.md`, `verify-2B.md`, `verify-2C.md`,
  `verify-phase-4.md`, this `archive-report.md`.
- Engram mirror: topic_key `sdd/demo-reproducible-flow/archive-report`
  (orchestrator to mirror — memory tools unavailable in archive subagent context).
- Skills read: `skills/scope-rule.md`, `skills/architecture-decisions.md`,
  `skills/work-methodology.md` (all present).
