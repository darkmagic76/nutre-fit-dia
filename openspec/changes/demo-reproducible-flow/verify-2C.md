# Verify Report: demo-reproducible-flow — Sub-slice 2C (tasks 2.4 + 3.1 + 3.2)

- Change: `demo-reproducible-flow`
- Slice: 2C ONLY — task 2.4 (`DemoGuideView` extraction) + Phase 3 App wiring
  (3.1 + 3.2) + cheap carry (Cancel/Replay-aborted asserts, W2 already closed
  by W2-FIX). Phase 4 (e2e + full gates), Phase 5 OUT OF SCOPE — not judged,
  not failures.
- Branch: `feature/demo-reproducible-flow` (local, no push)
- Commits: `8bd2a3e` (View extraction, 5 files, 279+/88-) +
  `534c874` (App wiring, 2 files, 66+/1-)
- Size: 2C = 2 commits, 367 + 67 changed lines — EACH unit under the 400
  review budget, no `size:exception` needed (recorded per preflight)
- Verifier: sdd-verify sub-slice 2C (read-only; no edits, no commits, no pushes)
- Date: 2026-10-13

## Verdict: PASS WITH WARNINGS

Tasks 2.4 + 3.1 + 3.2 complete per spec/design. W1 RESOLVED (Container is
JSX-free logic, renders only `<DemoGuideView/>`, no `useT`/`Translations`
imports). App wiring matches design (header button + overlay
`role="dialog"` + `onNavigate` into App-owned tab nav + `?demo=1` once+strip
+ exit preserves data). Focused tests (22/22) green, typecheck (`tsc -b`)
exit 0 — both re-executed by this verifier, not copied from apply-progress.
One carried WARNING (W3, architecture review). No CRITICAL findings.

## Completeness (sub-slice 2C)

| Task | Status | Evidence |
|------|--------|----------|
| 2.4 `DemoGuideView.tsx` extraction | ✅ done | Pure props (`DemoGuideViewProps`: nullable `currentStep` + `completed` + `completedChecks` + `checks` + `confirmReset` + 5 handlers), `useT()` strings only, zero store imports; `ConfirmResetPrompt` / `StepContent` / `CompletedSummary` sub-components; `STEP_COPY` (title/hint keys) in View, Container keeps only `STEP_TAB`. Contract extension in `types.ts` (`completed`, `completedChecks`, nullable `currentStep`): minimal, single-consumer |
| 3.1 `App.tsx` wiring | ✅ done | Header demo button (`t['demo.title']`) beside locale toggle + overlay mount (`role="dialog"`, `aria-modal`) + `onNavigate={setTab}` into App-owned `useTabNavigation`; `?demo=1` deep-link secondary only (App effect fires once on mount, strips via `history.replaceState`; Container strip stays as idempotent no-op). NO `Tab` union change |
| 3.2 Component tests (View + App) | ✅ done | `DemoGuideView.test.tsx` (4 tests: pure-props render, confirm branch, completed summary, es→en toggle via `getByRole`); `App.test.tsx` `App demo entry` (entry button opens tour at step 1 + exit closes overlay; `?demo=1` opens at step 1 with param stripped) |
| Carry: Cancel / Replay-aborted asserts | ✅ done | `aborted seed Cancel exits without seeding` + `REPLAY aborted returns to the confirm prompt` in `DemoGuideContainer.test.tsx` (verify-2B suggestions closed) |
| Phase 4 / Phase 5 | ➖ OUT OF SCOPE | Untouched; judged when those slices land |

## Build / test evidence (executed by verifier)

- `pnpm vitest run src/features/demo-guide/ src/App.test.tsx` → **3 files,
  22 tests, all pass** (12 container + 4 view + 6 app)
- `pnpm tsc -b` → **exit 0**, no errors
- Full `pnpm quality` / `test:coverage` not re-run (apply-progress records
  green at 91 files / 984 tests, functions 100% (400/400), via pre-commit
  hooks; sub-slice touches nothing outside its files; typecheck + focused
  tests re-confirmed here)

## Spec compliance matrix (sub-slice-relevant sections only)

| Spec requirement / scenario | Status | Covering test (passed at runtime) |
|---|---|---|
| Tour orchestration — 6 ordered steps, local state | ✅ COMPLIANT | Full-walk completion test (12 container tests incl. W2 step-5 assert + carry asserts); `currentStep`/`completedChecks` local `useState`, nothing else reads tour state |
| Replay from scratch (`resetDemo` + `seedDemo` → step 1) | ✅ COMPLIANT | `REPLAY resets then seeds from scratch at step 1` + `REPLAY aborted returns to the confirm prompt` (aborted branch now covered) |
| Exit preserves data (no wipe) | ✅ COMPLIANT | Container `EXIT closes via onExit and never wipes` + App `exit closes overlay` (covers `onExit={() => setShowDemo(false)}` arrow) |
| Visible entry (button, i18n-labelled) | ✅ COMPLIANT | App `entry button opens tour at step 1` — header button renders `t['demo.title']`, no new key needed; `?demo=1` NOT the sole entry |
| Deep-link `?demo=1` secondary only, once+strip | ✅ COMPLIANT | App `?demo=1 opens at step 1 with param stripped` + Container `?demo=1 fires once then stripped` (App effect + Container `startedRef` guard both strip idempotently) |
| Per-step checks — domain truth, advisory | ✅ COMPLIANT | Step-2 metrics write once, escaneo GREEN/RED, `generateWeeklyPlan` valid/7-day, step-5 `suggestAlternative` 1–3 (W2-FIX assert), validaciones both validators — all recomputed, Next always enabled |
| Seed isolation — no fixture leakage | ✅ COMPLIANT | Grep: `fixtures` imports exist ONLY in `*.test.*` files (18 matches, all test files); zero in prod incl. demo-guide |
| Port exposure — `useContainer()` only | ✅ COMPLIANT | Container destructures only `seedDemo`/`resetDemo`/`calculateTarget` from `useContainer()`; View has zero store/port imports |
| i18n parity (`es`+`en`) | ✅ COMPLIANT | 29 `demo.` keys in BOTH `es.ts` and `en.ts`; entry reuses `demo.title` (no new key, typecheck safe); View es→en toggle test green |
| Container JSX-free / View pure props | ✅ COMPLIANT | **W1 RESOLVED** — Container single `<DemoGuideView/>` return (`DemoGuideContainer.tsx:197-211`); no `useT`/`Translations` imports in Container (grep clean); View `useT()` strings only + `Translations` type-only import |
| Overlay + header button, no Tab change | ✅ COMPLIANT | `role="dialog"` + `aria-modal` + `aria-label` on overlay (`App.tsx:181`); `useTabNavigation.ts` untouched (absent from both commits' file lists) |
| e2e + full gates | ➖ OUT OF SCOPE | Phase 4 — judged when that slice lands |

## Correctness checks

- W1 resolution verified by source inspection: Container imports contain no
  `useT`, no `Translations`, no store hooks — only `useContainer()` +
  type-only `Tab` (erased at compile) + domain truth + `DemoGuideView`. ✅
- `STEP_META` → `STEP_TAB` refactor is lossless: tab map identical
  (datos→null, perfil→metabolic, escaneo→scanner, recomendacion→plan,
  sustitucion→sustainability, validaciones→log). ✅
- Dual `?demo=1` strip (App effect + Container effect) is idempotent:
  whichever runs first strips; the other reads clean search and still seeds
  via its own path. No double-seed: Container `startedRef` guards its effect;
  App `showDemo` state guards its mount. ✅
- `onNavigate={setTab}` passes App-owned navigation directly — design
  data-flow holds (Container never imports `useTabNavigation` hook). ✅
- Test-only discovery preserved (no prod change): Zustand module singletons
  shared across `createContainer()` — demo App tests reset via
  `container.resetDemo()` in `beforeEach`. ✅
- Functions coverage 100% preserved per apply-progress (exit-close assert
  covers the new `onExit` arrow). ✅

## Design coherence

- Container/presentational split now literal: `DemoGuideContainer.tsx` is
  logic only; all markup lives in `DemoGuideView.tsx` (+ step
  sub-components). `STEP_COPY`/`STEP_TAB` split places copy (presentational)
  in View and nav map (logic) in Container. ✅
- Scope-rule: demo-guide stays feature-local, 1 consumer. One flag — see
  WARNING W3 (carried). ✅/⚠️
- Clean Architecture: application service untouched by this slice; Container
  still calls ports only; View imports only types + i18n + local types. ✅
- Entry placement follows design default (header button beside locale
  toggle); open question on hero banner remains a team visual call. ✅

## Issues

### CRITICAL

None.

### WARNING

- **W3 (carried from verify-2B) — Cross-feature `classifyFood` import.**
  Container imports `classifyFood` from
  `@features/nutritional-traffic-light/services/classificationService`
  (`DemoGuideContainer.tsx:13`), making demo-guide the second consumer.
  Strict scope-rule would place the service in `shared/` on second-consumer
  grounds. Unchanged by 2C by design (deferred to architecture review per
  verify-2B scoping) — do not carry beyond Phase 4 without an architecture
  call.
- W1 RESOLVED this slice (was WARNING in verify-2B). W2 RESOLVED by W2-FIX
  micro-slice (step-5 truth assert, 10→12 container tests).

### SUGGESTION

- Prior open suggestion (IDB-unavailable hardening via
  `indexedDBAvailable=false` stub) remains deferred to Phase 4 — noted, no
  action for 2C.
- `computeDemoChecks(seeded, target)` positional args + port-bound
  `DemoTarget` type: single call site, no over-abstraction — no change
  recommended.

## Out of scope (explicitly NOT failures)

Phase 4 (`e2e/demo.spec.ts` + `quality`/`verify`/`test:e2e` gates), Phase 5
(rollback note, final `Tab`-union / fixture / store-import audit). Spec
§§ tests-and-gates (e2e level) judged when those slices land.

## Next recommended

Phase 4 per apply-progress: `e2e/demo.spec.ts` (clean profile offline 6-step
path: tour complete, replay resets, exit preserves data, drift-fails-loudly)
+ full gates (`quality` → `verify` → `test:e2e`). Carry into Phase 4:
(1) architecture call on `classifyFood` placement (W3); (2) IDB-unavailable
hardening; (3) rollback-note verification (Phase 5).
