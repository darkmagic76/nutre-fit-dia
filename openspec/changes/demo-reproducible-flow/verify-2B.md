# Verify Report: demo-reproducible-flow — Sub-slice 2B (tasks 2.2 + 2.3)

- Change: `demo-reproducible-flow`
- Slice: 2B ONLY — tasks 2.2 (Container RED state-machine tests) + 2.3
  (Container GREEN). Task 2.4 (View extraction), Phase 3 (App wiring),
  Phase 4 (e2e + full gates), Phase 5 OUT OF SCOPE — not judged, not failures.
- Branch: `feature/demo-reproducible-flow` (local, no push)
- Commit: `bfacccb` — 2 files, 434 insertions (+275 prod / +159 test)
- Size: `size:exception` granted by maintainer for this 2B unit (434 lines vs
  400 budget, +34 / 8.5% — recorded per preflight)
- Verifier: sdd-verify sub-slice 2B (read-only; no edits, no commits, no pushes)
- Date: 2026-10-13

## Verdict: PASS WITH WARNINGS

Tasks 2.2 + 2.3 complete per spec/design. Focused component tests (9/9) green,
typecheck (`tsc -b`) exit 0 — both re-executed by this verifier, not copied
from apply-progress. Three WARNINGs (all transitional, all tracked for 2C):
inline markup pending View extraction, step-5 truth assert gap, cross-feature
`classifyFood` import. No CRITICAL findings.

## Completeness (sub-slice 2B)

| Task | Status | Evidence |
|------|--------|----------|
| 2.2 RED: Container state-machine tests | ✅ done | `DemoGuideContainer.test.tsx` — 9 component tests: START seeds once on mount, `?demo=1` fires once then stripped, aborted seed → confirm prompt (Confirm seeds flagged), NEXT/BACK + `onNavigate('metabolic')`, step-2 metrics write once via port, escaneo `classifyFood` truth + Next enabled (advisory), recomendacion/validaciones domain truth, REPLAY via `resetDemo`, EXIT via `onExit` with no wipe, full-walk completion with recorded checks. RED proven by import-fail before 2.3 (per apply-progress) |
| 2.3 GREEN: `DemoGuideContainer.tsx` | ✅ done | Local `currentStep`/`completedChecks`/`seeded`, `useContainer()` ports only (`seedDemo`/`resetDemo`/`calculateTarget`), `computeDemoChecks` from domain truth, step-2 single `calculateTarget` port call with `DEMO_METRICS_INPUT`, `onNavigate`/`onExit` props only |
| 2.4 View extraction | ➖ OUT OF SCOPE | Untouched (no `DemoGuideView.tsx` in commit); judged in 2C |
| Phase 3/4/5 | ➖ OUT OF SCOPE | Untouched by this 1 commit (file list confirms); judged in later slices |

## Build / test evidence (executed by verifier)

- `pnpm vitest run src/features/demo-guide/` → **1 file, 9 tests, all pass** (2.22 s)
- `pnpm tsc -b` → **exit 0**, no errors
- Full `pnpm quality` / `test:coverage` not re-run (apply-progress records
  green at 90 files / 975 tests, functions 100% (393/393), via pre-commit
  hooks; sub-slice touches nothing outside its 2 files; typecheck + focused
  tests re-confirmed here)

## Spec compliance matrix (sub-slice-relevant sections only)

| Spec requirement / scenario | Status | Covering test (passed at runtime) |
|---|---|---|
| Tour orchestration — 6 ordered steps, local state | ✅ COMPLIANT | NEXT/BACK walk + full-walk completion test; `currentStep`/`completedChecks` are local `useState` (`DemoGuideContainer.tsx:110-115`), no store |
| Replay from scratch (`resetDemo` + `seedDemo` → step 1) | ✅ COMPLIANT | `REPLAY resets then seeds from scratch at step 1` — `resetDemo` ×1, `seedDemo` ×2, back at `Datos iniciales` |
| Exit preserves data (no wipe) | ✅ COMPLIANT | `EXIT closes via onExit and never wipes seeded data` — `onExit` ×1, `resetDemo` not called |
| Entry/deep-link — `?demo=1` fires once then stripped | ✅ COMPLIANT | `START seeds once on mount; ?demo=1 fires once then stripped` — `seedDemo` ×1 with no args, `window.location.search === ''`; impl uses `startedRef` guard + `history.replaceState` strip (`DemoGuideContainer.tsx:116-141`) |
| Per-step checks — step 2 `calculateTarget` truth (glucose=100 fixture input) | ✅ COMPLIANT | `step 2 writes metrics once via port` — stub returns REAL `calculateTarget(DEMO_METRICS_INPUT)` output, `calculateTarget` called ×1 with `DEMO_METRICS_INPUT`, BMR/TDEE rendered (verify-2A carry-forward satisfied) |
| Per-step checks — step 3 `classifyFood` GREEN/RED | ✅ COMPLIANT | `escaneo checks come from classifyFood truth` — `Esperado: green · Obtenido: green` + `Esperado: red · Obtenido: red` rendered; Next stays enabled (advisory per design) |
| Per-step checks — step 4 `generateWeeklyPlan` valid/7-day | ✅ COMPLIANT | `later steps match generateWeeklyPlan and ration truth` — independent `generateWeeklyPlan(restriction, 4)` truth asserted (`valid === true`, 7 days) + `valid · 7 days` rendered (verify-2A carry-forward satisfied) |
| Per-step checks — step 5 `suggestAlternative` 1–3 | ⚠️ PARTIAL | `computeDemoChecks` computes the sustitucion row from `suggestAlternative` truth (`DemoGuideContainer.tsx:91-96`); full-walk test renders step 5 but asserts no explicit sustitucion text — see WARNING W2 |
| Per-step checks — step 6 `validateRations` + `validateWeeklyRations` | ✅ COMPLIANT | Same test asserts ≥2 check rows on `Validaciones`; impl calls both validators (`DemoGuideContainer.tsx:64-65`) |
| Seed isolation — no fixture leakage | ✅ COMPLIANT | No `fixtures` import in prod file (grep clean); seed data via `@application/services/demoDataset` (`DemoGuideContainer.tsx:2-6`) |
| Port exposure — container ports only | ✅ COMPLIANT | Only `seedDemo`/`resetDemo`/`calculateTarget` destructured from `useContainer()` (`DemoGuideContainer.tsx:108`); `onNavigate`/`onExit` props only, no `useTabNavigation` hook import (type-only `Tab` import) |
| Metrics write via `calculateTarget` once | ✅ COMPLIANT | `targetRequestedRef` single-fire guard (`DemoGuideContainer.tsx:144-148`); test asserts `calledTimes(1)` |
| Visible entry / App wiring / e2e gates | ➖ OUT OF SCOPE | Phase 3/4 — judged when those slices land |

## Correctness checks

- Guard symmetry holds: START calls bare `seedDemo()`; abort → `confirmReset`
  prompt; `handleConfirmSeed` retries with `{ confirmed: true }`; Cancel path
  exits via `onExit` without seeding. ✅
- Step-2 `DemoTarget` port-bound type (`ReturnType<Container['calculateTarget']>`)
  matches the stub shape used in tests; `computeDemoChecks(seeded, target)`
  positional args, single call site — no over-abstraction. ✅
- Advisory semantics hold: `handleNext` records pass/fail into
  `completedChecks` but always advances; no `disabled` on Next
  (`DemoGuideContainer.tsx:158-165,264`). ✅
- `EXIT` never calls `resetDemo`; `REPLAY` resets `targetResult` +
  `targetRequestedRef` so step-2 metrics re-write after replay
  (`DemoGuideContainer.tsx:183-201`). ✅
- `useT()` used as Translations object (`t['demo.title']`), matching the
  established Container pattern. ✅

## Design coherence

- `STEP_META` map (step → i18n keys + App tab, `datos` → `null`) matches design
  data-flow (App owns `useTabNavigation`; Container navigates via `onNavigate`
  props only). ✅
- `computeDemoChecks` recomputes expected via domain truth (`classifyFood`,
  `generateWeeklyPlan`, `suggestAlternative`, `validateRations`/
  `validateWeeklyRations`, `foodsById`) — design "never string asserts" holds;
  clinical drift surfaces as FAIL rows. ✅
- State machine `closed → step[1..6] → completed` with START/NEXT/BACK/REPLAY/
  EXIT events matches design § State Machine, including `?demo=1` once+strip
  and EXIT-never-resets. ✅
- Scope-rule: feature-local files, 1 consumer. One flag — see WARNING W3. ⚠️
- Container/presentational: props contract (`onNavigate`/`onExit`) unchanged
  from `types.ts`; View extraction deferred to 2C — see WARNING W1. ⚠️

## Scope-confinement checks (must-haves for 2B)

- (a) No `Tab` union change — YES (commit touches 2 files only;
  `DemoGuideContainer.tsx:18` is `import type { Tab }`, erased at compile).
- (b) No `App.tsx` touch — YES (absent from `bfacccb` file list).
- (c) No `fixtures` import in prod — YES (grep clean).
- (d) No store-direct imports in Container — YES (no `use*Store` imports;
  only `useContainer()` + `useT()` hooks).
- (e) No push/merge — YES (local commit only; this verifier ran read-only).

## Issues

### CRITICAL

None.

### WARNING

- **W1 — Inline markup in Container (transitional).** `DemoGuideContainer`
  renders `<section>`/`<ul>`/`<button>` JSX directly (`:203-274`), which is
  letter-against the container-presentational rule (Containers handle logic,
  do NOT render UI directly). Assessed NOT material: markup is minimal, driven
  purely by local state + `useT()` strings + `checks` rows, with zero store
  access; the pure-props contract (`DemoGuideViewProps`) already exists in
  `types.ts` and apply-progress schedules extraction in 2C. Track for 2C —
  do not carry beyond it.
- **W2 — Step-5 sustitucion truth assert gap.** The sustitucion row is computed
  from `suggestAlternative` truth, but no test asserts its rendered text (the
  full-walk test passes through step 5 asserting only the final `Correcto`
  summary). Domain-level `suggestAlternative` coverage exists elsewhere and
  Phase 4 e2e covers substitution end-to-end, so this is not a compliance
  failure for 2B — but 2C/Phase 4 should add one explicit sustitucion text
  assert (e.g. `1-3 alternatives` rendered) to close the matrix.
- **W3 — Cross-feature `classifyFood` import.** Container imports
  `classifyFood` from `@features/nutritional-traffic-light/services/
  classificationService` (`DemoGuideContainer.tsx:13`), making demo-guide the
  second consumer. Strict scope-rule would place the service in `shared/` on
  second-consumer grounds. Flagged for architecture review — NOT moved (out of
  scope for 2B; move it in 2C or later only with architecture approval).

### SUGGESTION

- Cancel-path coverage: the aborted-seed test exercises Confirm but never
  clicks Cancel (`onExit` via cancel branch untested). One extra
  `user.click(Cancelar)` + `expect(onExit).toHaveBeenCalledTimes(1)` assert
  would close it cheaply in 2C.
- Replay-aborted branch (`handleReplay` → `result.aborted` →
  `setConfirmReset(true)`) has no test. Same cheap-add candidate for 2C.
- Prior open suggestion (IDB-unavailable hardening via
  `indexedDBAvailable=false` stub) remains deferred to Phase 4 — noted, no
  action for 2B.

## Out of scope (explicitly NOT failures)

Task 2.4 (`DemoGuideView` extraction), Phase 3 (App header button + overlay
mount + `onNavigate` wiring + component es/en toggle tests), Phase 4
(`e2e/demo.spec.ts` + `quality`/`verify`/`test:e2e` gates), Phase 5
(rollback note, final `Tab`-union / fixture / store-import audit). Spec
§§ visible entry (button/tab) and tests-and-gates (e2e level) are judged when
those slices land.

## Next recommended

Sub-slice 2C per apply-progress: task 2.4 (`DemoGuideView` extraction, resolves
W1) + Phase 3 App wiring — needs its own budget decision. Carry into 2C:
(1) extract View per existing `DemoGuideViewProps` contract; (2) add explicit
sustitucion text assert (W2) + Cancel/Replay-aborted asserts (suggestions);
(3) architecture call on `classifyFood` placement (W3); (4) IDB-unavailable
hardening still open for Phase 4.
