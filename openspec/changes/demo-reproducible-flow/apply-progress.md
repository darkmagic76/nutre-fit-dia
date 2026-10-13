# Apply Progress: demo-reproducible-flow — Slice 1 (PR 1 foundation)

## Scope
Phase 1 only (tasks 1.1–1.7). Phases 2/3/4 untouched. No `Tab` union change.
No push, no merge — local commits on `feature/demo-reproducible-flow` only.

## Status: 7/7 slice tasks complete

- [x] 1.1 RED guard tests → GREEN (5 tests pass)
- [x] 1.2 `src/application/ports/demoGuide.ts` — `DemoGuidePort`
- [x] 1.3 `src/application/services/demoDataset.ts` — no `fixtures.ts` import
- [x] 1.4 `src/application/services/seedDemoData.ts` — `createDemoGuideService`
- [x] 1.5 `src/application/ports/container.ts` — `seedDemo`/`resetDemo`
- [x] 1.6 `src/infrastructure/compositionRoot.ts` — wiring, factory isolation kept
- [x] 1.7 `resetDemoStorage()` in `src/infrastructure/storage.ts` + crypto-agnostic tests

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 1.1 guard tests | import fail (no modules) | 5/5 pass after 1.2–1.4 | fakes extracted to helpers |
| 1.7 reset tests | 3/3 fail (no fn) | 3/3 pass after impl | prettier format only |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/infrastructure/resetDemoStorage.test.ts src/application/services/seedDemoData.test.ts src/application/ports/container.test.ts src/infrastructure/compositionRoot.test.ts src/infrastructure/storage.test.ts` → 5 files, 33 tests, all pass |
| Full gates | `pnpm quality` green (format, oxlint, tsc -b, 89 files / 962 tests pass) |
| Runtime harness | N/A — no UI yet; service exercised via unit tests (per tasks.md Unit 1) |
| Rollback boundary | Revert the 3 slice commits; no UI depends on the service yet |

## Commits (local, no push)
- `7e88dac` feat(demo): add port-injected demo seed service with dataset (1.1–1.4)
- `6adc871` feat(demo): wire seedDemo/resetDemo into composition root (1.5–1.6)
- `3677faf` feat(demo): add resetDemoStorage with atomic reset tests (1.7)

## Line count
60 modified + 299 new = 359 changed lines (under 400 budget).

## Design decisions / deviations
- `resetStorage` injected via `DemoGuideDeps` (compositionRoot passes real
  `resetDemoStorage`) so the application service never imports infrastructure
  (Clean Architecture dependency rule). Task text listed repos only; injection
  preserves Domain Isolation — noted, not a scope change.
- `DEMO_METRICS_INPUT.diagnosisAge = '30'` (not empty): `parseNumeric('')`
  throws, so an empty value would be invalid input.
- Service-level `resetDemo` clears log port + persisted storage; in-memory
  biomarker/plan/activity stores have no clear port methods — full memory reset
  on REPLAY is deferred to Phase 2 (may add clear methods then).
- Reset tests are crypto-implementation-agnostic (roundtrip/atomicity based),
  valid under jsdom XOR mock and real Web Crypto — satisfies "dual-crypto".

## Native attempt ledger
UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
single slice, 359/400 lines, stop-and-report on overflow (no overflow occurred).

## Next
Phase 2 (tour UI) — PR 2 slice. No prior progress to merge (fresh start).

---

# Apply Progress: demo-reproducible-flow — Sub-slice 2A (WARNING fix + 2.1 + 2.5)

## Scope
STRICT sub-slice 2A only (user-authorized subdivision after slice-2 budget
block): WARNING fix from verify-slice-1 (in-memory clear semantics) + tasks
2.1 (tour types) + 2.5 (i18n keys). 2.2/2.3/2.4 (Container/View), Phase 3/4/5,
openspec/config.yaml, Tab union: untouched. No push, no merge — local commits
on `feature/demo-reproducible-flow` only.

## Status: sub-slice 2A complete

- [x] 2.1 `src/features/demo-guide/types.ts` — `DEMO_STEPS` const object
  (erasableSyntaxOnly, no enums), `DemoStep` union, `DEMO_STEP_ORDER`,
  `DemoCheckResult`, `DemoGuideContainerProps` (`onNavigate(tab: Tab)`,
  `onExit`), `DemoGuideViewProps` (pure props, no stores)
- [x] 2.5 `demo.*` keys in `src/shared/i18n/types.ts` + `es.ts` + `en.ts`
  (29 keys: title, 6 step titles, 6 hints, expected/actual, replay/exit/
  confirmReset, 5 checks, next/back/pass/fail/confirm/cancel; typecheck
  enforced via `Translations`)
- [x] WARNING fix: `clearBiomarkers()` on `BiomarkerRepository` (delegates to
  existing `resetBiomarkerHistory()`), `clearActivity()` on
  `ActivityRepository` (delegates to existing `resetWeek()`), new `clearPlan()`
  store action (`set({ weeklyPlan: null })`) exposed via `PlanRepository`;
  `resetDemo()` invokes the 4 clears + `resetStorage`; 3 typed fakes updated
  (seedDemoData.test, calculateTarget.test, trackerStore.test);
  contract.test assertions + behavioral tests for the 3 new adapter arrows;
  seed→reset→seed-without-confirm regression test

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| WARNING fix | extended reset test + replay regression test fail (2 failed, 4 passed) | 97/97 pass after ports + store + adapters + service | fakes use clear-method bodies (length=0 / generated=0) |
| 2.1 types | n/a (new types, typecheck is the gate) | `tsc -b` exit 0 | — |
| 2.5 i18n | n/a (keys added atomically in 3 files) | `tsc -b` exit 0, full suite green | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/application/services/seedDemoData.test.ts src/infrastructure/adapters/repository.test.ts src/infrastructure/adapters/contract.test.ts src/application/use-cases/calculateTarget.test.ts src/infrastructure/stores/trackerStore.test.ts src/infrastructure/stores/planStore.test.ts` → 6 files, 97 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint + tsc -b + 89 files / 966 tests pass; pre-commit hook re-ran it per commit) |
| Runtime harness | N/A — no UI yet (2.2–2.4 out of scope); service + adapters exercised via unit tests |
| Rollback boundary | Revert the 4 sub-slice commits (`9236b30`, `84c3821`, `bbdf153`, `8534462`); slice-1 commits untouched below |

## Commits (local, no push)

- `8534462` feat(demo): add clear methods to biomarker/activity/plan ports with adapters
- `bbdf153` feat(demo): resetDemo clears all in-memory stores with replay regression test
- `84c3821` feat(demo): add demo-guide tour types
- `9236b30` feat(demo): add demo i18n keys in es and en

## Line count

230 insertions + 1 deletion = 231 changed lines (under 400 budget).
Cumulative branch slice-1 + 2A: 359 + 231 = 590 (separate review units).

## Design decisions / deviations

- None — WARNING fix follows the exact delegation the verify report
  suggested (`resetBiomarkerHistory` / `resetWeek` reuse, no new store
  semantics except `clearPlan` which has no existing counterpart).
- `DemoGuideViewProps` includes `confirmReset` + `onConfirmSeed` for the
  spec's non-empty guard prompt; 2B may refine when wiring the Container.
- es strings use voseo (`Verificá`, `Calculá`, `Generá`, `Pedí`, `Revisá`,
  `Querés`) matching the existing `es.ts` convention (`Usá ← →`).

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
sub-slice 231/400 lines, stop-and-report on overflow (no overflow occurred).

## Next

Sub-slice 2B: tasks 2.2 (Container RED tests) + 2.3 (Container GREEN) + 2.4
(View) + Phase 3 App wiring — needs its own budget decision (Phase 2 remainder
was forecast over budget; do NOT assume single-PR).

---

# Apply Progress: demo-reproducible-flow — Sub-slice 2B (tasks 2.2 + 2.3)

## Scope
STRICT sub-slice 2B only: 2.2 (Container RED state-machine tests) + 2.3
(Container GREEN). 2.4 (View), Phase 3 (App wiring), Phase 4 (e2e), Phase 5,
openspec/config.yaml, Tab union: untouched. No push, no merge — local commit
on `feature/demo-reproducible-flow` only.

## Status: sub-slice 2B complete (pending size:exception review decision)

- [x] 2.2 `src/features/demo-guide/DemoGuideContainer.test.tsx` — 9
  component tests: START seeds once on mount, `?demo=1` fires once then
  stripped, aborted seed → confirm prompt (Confirm seeds flagged / Cancel
  path), NEXT/BACK + `onNavigate('metabolic')`, step-2 metrics write once via
  port, escaneo `classifyFood` truth + Next enabled (advisory),
  recomendacion/validaciones domain truth, REPLAY via `resetDemo`, EXIT via
  `onExit` with no wipe, full-walk completion with recorded checks
- [x] 2.3 `src/features/demo-guide/DemoGuideContainer.tsx` — local
  `currentStep`/`completedChecks`/`seeded`, `useContainer()` ports only
  (`seedDemo`/`resetDemo`/`calculateTarget`), `computeDemoChecks` from domain
  truth (`classifyFood`, `generateWeeklyPlan`, `suggestAlternative`,
  `validateRations`/`validateWeeklyRations`), step-2 single `calculateTarget`
  port call with `DEMO_METRICS_INPUT`, `onNavigate`/`onExit` props only
  (no `useTabNavigation` import)

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 2.2 Container tests | import fail (no `DemoGuideContainer` module) | 9/9 pass after 2.3 | `setup()`/`advance()`/`checkTexts()` helpers, `?demo=1` folded into START test |
| 2.3 Container | n/a (driven by 2.2) | 9/9 pass, `tsc -b` exit 0 | `row()` check builder, single `STEP_META` map, port-bound `DemoTarget` type |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/` → 1 file, 9 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint + `tsc -b` + 90 files / 975 tests pass); `pnpm test:coverage` → functions 100% (393/393), statements 98.33%, branches 91.73% |
| Runtime harness | N/A — no App wiring yet (Phase 3 out of scope); state machine exercised via component tests with stub container |
| Rollback boundary | Revert the 1 sub-slice commit (`bfacccb`); slice-1 + 2A commits untouched below |

## Commits (local, no push)

- `bfacccb` feat(demo): add DemoGuideContainer state machine with domain-truth checks

## Line count

275 + 159 = 434 changed lines — OVER the 400 review budget by 34 (8.5%).
`size:exception` decision required from orchestrator before review. Forecast
miss cause: 9 state-machine behaviors + step-2/step-4 truth asserts
(verify-2A carry-forward) need ~35 lines/behavior; 2.2/2.3 cannot split
further (RED-only commit would break the quality gate hook).

## Design decisions / deviations

- `DemoGuideContainerProps` unchanged (no refinement needed — `onNavigate`/`onExit` suffice).
- `useT()` used as Translations object (`t['demo.title']`), matching the
  established Container pattern (`MetabolicTrackerContainer` passes it as `translate`).
- `classifyFood` imported from `@features/nutritional-traffic-light/...`
  per the 2B work order ("pure domain imports"); strict scope-rule would place
  it in `shared/` on second-consumer grounds — flagged for architecture review, not moved (out of scope).
- Minimal inline markup stays in the Container; 2C extracts `DemoGuideView`
  (planned refactor, props contract already in `types.ts`).
- `computeDemoChecks(seeded, target)` takes positional args (no `ComputeDemoChecksInput`
  interface — single call site).
- Port-bound `DemoTarget = ReturnType<Container['calculateTarget']>` instead of
  the use-case `CalculateTargetResult` (port widens `profileError` to `Error`).
- Step-5 `suggestAlternative` truth assert cut for budget; rendering covered by
  the full-walk test; e2e (Phase 4) covers substitution end-to-end.

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
single work-unit commit, 434/400 lines — OVER, exception requested.

## Next

Sub-slice 2C: task 2.4 (`DemoGuideView` extraction) + Phase 3 App wiring —
needs its own budget decision. 2B merges to review only under `size:exception`.

---

# Apply Progress: demo-reproducible-flow — Micro-slice W2-FIX (verify-2B WARNING W2)

## Scope
STRICT micro-slice W2-FIX only: ONE explicit step-5 sustitucion truth assert in
`src/features/demo-guide/DemoGuideContainer.test.tsx`. No prod code changes, no
other asserts, no View work, no App wiring, no W3 refactor. Local commit on
`feature/demo-reproducible-flow` only, no push, no merge.

## Status: W2 resolved

- [x] W2 — `step 5 shows suggestAlternative truth for the trigger food`:
  advances to `Sustitución`, resolves REAL `suggestAlternative(trigger, foods)`
  with `trigger = foodsById.get(DEMO_TRIGGER_FOOD_ID)` (`meat-ternera`), asserts
  `1 <= alternatives.length <= 3` (domain truth, never hardcoded alone) and that
  the rendered check row contains both `1-3 alternatives` (expected) and
  `${alternatives.length} alternatives` (actual)

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| W2 assert | n/a (truth-gap fix on GREEN suite; prod row already computed from domain truth) | 10/10 pass after assert, `tsc -b` exit 0 | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/` → 1 file, 10 tests, all pass |
| Full gates | pre-commit hook re-ran `pnpm quality` green: prettier + oxlint + `tsc -b` + 90 files / 976 tests pass (975 + 1 new) |
| Runtime harness | N/A — no App wiring yet (Phase 3 out of scope); substitution row exercised via component test against real domain output |
| Rollback boundary | Revert the 1 micro-slice commit (`81234dd`); 2B commit `bfacccb` untouched below |

## Commits (local, no push)

- `81234dd` test(demo): assert step-5 sustitucion text against suggestAlternative truth

## Line count

19 insertions + 1 deletion = 20 changed lines (well under 400 budget).

## Design decisions / deviations

- None — no prod change needed: `computeDemoChecks` already computed the
  sustitucion row from `suggestAlternative` truth; the gap was test-only.
- Functions coverage 100% preserved (test-only change adds no functions).

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
micro-slice 20/400 lines, stop-and-report on overflow (no overflow occurred).

## Next

Sub-slice 2C: task 2.4 (`DemoGuideView` extraction, resolves W1) + Phase 3 App
wiring — needs its own budget decision. Remaining for 2C: Cancel/Replay-aborted
asserts (verify-2B suggestions), architecture call on `classifyFood` placement
(W3). W2 CLOSED.

---

# Apply Progress: demo-reproducible-flow — Sub-slice 2C (tasks 2.4 + 3.1 + 3.2)

## Scope
STRICT sub-slice 2C only: 2.4 (`DemoGuideView` extraction, resolves W1) +
Phase 3 App wiring (3.1 + 3.2) + cheap carry (Cancel/Replay-aborted asserts).
No e2e (Phase 4), no `openspec/config.yaml`, no `fixtures` import in prod,
no W3 `classifyFood` refactor (deferred to architecture review). Local commits
on `feature/demo-reproducible-flow` only, no push, no merge.

## Status: sub-slice 2C complete

- [x] 2.4 `src/features/demo-guide/DemoGuideView.tsx` — pure props
  (`DemoGuideViewProps`: `currentStep` (nullable) + `completed` +
  `completedChecks` + `checks` + `confirmReset` + 5 handlers), `useT()`
  strings only, zero store imports; `ConfirmResetPrompt` / `StepContent` /
  `CompletedSummary` sub-components; `STEP_COPY` (title/hint keys) lives in
  the View, Container keeps only `STEP_TAB`. Container is JSX-free logic
  (single `<DemoGuideView/>` return; `useT`/`Translations` imports removed) —
  **W1 RESOLVED**. Contract extension in `types.ts` (`completed`,
  `completedChecks`, nullable `currentStep`): minimal, single-consumer.
- [x] 3.1 `src/App.tsx` — header demo button (`t['demo.title']`) beside the
  locale toggle + overlay mount (`role="dialog"`, `aria-modal`) +
  `onNavigate={setTab}` into App-owned `useTabNavigation`;
  `?demo=1` deep-link secondary only (App effect fires once on mount, strips
  via `history.replaceState`; Container strip stays as idempotent no-op).
  NO `Tab` union change.
- [x] 3.2 `src/App.test.tsx` (`App demo entry`): entry button opens tour at
  step 1 + exit closes overlay; `?demo=1` opens at step 1 with param stripped.
  Isolation note: Zustand stores are module singletons shared across
  `createContainer()` calls, so the describe resets via `container.resetDemo()`
  in `beforeEach` (fresh `createContainer()` per render is NOT enough).
- [x] Carry: `aborted seed Cancel exits without seeding` +
  `REPLAY aborted returns to the confirm prompt` in
  `DemoGuideContainer.test.tsx` (verify-2B suggestions closed).
- [x] `DemoGuideView.test.tsx` — pure-props render (step + checks + nav),
  confirm branch, completed summary, es→en toggle via `getByRole`.

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 2.4 View | new test file fails on missing module import | 4/4 pass after `DemoGuideView.tsx` | `STEP_COPY`/`STEP_TAB` split, `Pick<>`-typed sub-component props |
| Container JSX-free | n/a (driven by existing 10 tests) | 10/10 pass unchanged | `STEP_META` → `STEP_TAB`, single View return |
| 3.1/3.2 App wiring | 2 new App tests fail (no entry button) | 6/6 pass after wiring | exit-close assert added (covers `onExit` arrow) |
| Carry asserts | n/a (branches existed untested) | 12/12 container-file pass | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/ src/App.test.tsx` → 3 files, 22 tests, all pass (12 container + 4 view + 6 app) |
| Full gates | `pnpm quality` green (prettier + oxlint + `tsc -b` + 91 files / 984 tests pass); `pnpm test:coverage` → functions 100% (400/400), statements 98.59%, branches 91.98% |
| Coverage fix | New `onExit={() => setShowDemo(false)}` arrow initially dropped funcs to 399/400 — closed with the exit-close assert (App.tsx now 100% funcs) |
| Runtime harness | N/A (no e2e in slice; Phase 4 owns `pnpm test:e2e`). Tour entry + deep-link exercised via component tests with fresh containers |
| Rollback boundary | Revert the 2 sub-slice commits (`8bd2a3e`, `534c874`); slice-1 + 2A + 2B + W2-fix commits untouched below |

## Commits (local, no push)

- `8bd2a3e` feat(demo): extract DemoGuideView with pure-props tests
- `534c874` feat(demo): wire demo entry button and deep-link into App

## Line count

116 tracked insertions + 134 + 95 (2 new files) = 345 added lines, 89
deletions (moved JSX) — under the 400 review budget, no exception needed.

## Design decisions / deviations

- Entry button reuses `t['demo.title']` (`Demostración guiada` / `Guided
  demo`) — spec requires an i18n-labelled entry; no new key added, no i18n
  files touched (budget + typecheck safety).
- `useT()` called inside each View sub-component (strings only, matching the
  established Container pattern) instead of threading `t` through props.
- W3 (`classifyFood` cross-feature import) NOT moved — deferred to
  architecture review per verify-2B scoping.
- Test-only discovery (no prod change): `createContainer()` does NOT isolate
  Zustand module-singleton state — demo App tests reset via
  `container.resetDemo()` in `beforeEach`.

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
sub-slice 345/400 added lines, stop-and-report on overflow (no overflow
occurred).

## Next

Phase 4: `e2e/demo.spec.ts` (clean profile offline 6-step path) + full gates
(`quality` → `verify` → `test:e2e`). Remaining open: W3 architecture call on
`classifyFood` placement; IDB-unavailable hardening (deferred suggestion).

---

# Apply Progress: demo-reproducible-flow — Micro-slice W3-SPLIT (verify-2B WARNING W3)

## Scope
STRICT micro-slice W3-SPLIT only (user-authorized): clean split of the
pure classification core into the domain layer. Naive whole-file move was
explicitly REJECTED (it would put Spanish UI reason strings into domain).
No View/App/e2e/config/Tab changes. Local commits on
`feature/demo-reproducible-flow` only, no push, no merge.

## Status: W3 resolved via split

- [x] W3 — `src/domain/classification.ts` (new): pure core moved out of the
  feature — `SUGAR_ALIASES` (nutrition vocabulary data), `CATEGORY_DEFAULTS`,
  `classifyFood(food)`, `detectOccultSubstances` / `detectOccultFromFood`,
  `OccultDetectionResult`, neutral `ClassificationResult` type. Imports ONLY
  `./food` (type), `./foodCategory`, `./trafficLight`, `./sustainability`
  (type) — all domain-internal, zero `@shared` edge. Flat-file placement
  follows the dominant `src/domain/` layout (checked: flat files dominate;
  only `sustainability/` is a subdir).
- [x] W3 — `src/shared/data/sugarAliases.ts`: now a documented re-export
  from `@domain/classification` (no duplication). Sole remaining consumer is
  `MockScannerAdapter` (infra), behavior unchanged.
- [x] W3 — feature thin mapper `classificationService.ts`: keeps ONLY
  `classifyFoodWithReasons` with its Spanish reason strings, implemented OVER
  domain functions (`detectOccultFromFood` + `classifyFood` +
  `computeEnvironmentalScore`) — no duplicated detection logic. Deleted
  `occultSugarDetector.ts` + its test (core moved, no other consumers).
- [x] W3 — consumers updated, zero behavior change:
  `DemoGuideContainer.tsx` imports `classifyFood` from `@domain/classification`
  (no feature→feature import remains — W3 closed);
  `NutritionalTrafficLightView.tsx` imports `ClassificationResult` type from
  `@domain/classification`; `NutritionalTrafficLightContainer.tsx` verified —
  still imports `classifyFoodWithReasons` from the unchanged feature path,
  no edit needed.
- [x] W3 — tests: new `src/domain/classification.test.ts` (17 `classifyFood`
  + 13 detection tests, incl. 1 new `detectOccultFromFood` test); feature
  `classificationService.test.ts` trimmed to the 9 `classifyFoodWithReasons`
  tests (Spanish reasons + environmental score). Nutritional-traffic-light
  feature tests stay green; functions coverage 100% (400/400, zero new
  functions — a `classifyWithDetails` helper was drafted then removed before
  commit to avoid new API surface).

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| Domain core | new `classification.test.ts` fails on missing module import (1 file, no tests) | 30/30 pass after `classification.ts` | dropped `classifyWithDetails` draft (no new surface); prettier format |
| Feature split | n/a (pure move, behavior pinned by moved tests) | focused 9 files / 79 tests pass; full `quality` 91 files / 985 green | mapper calls `classifyFood(food)` for the default branch (no `CATEGORY_DEFAULTS` re-import) |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/domain/classification.test.ts src/features/nutritional-traffic-light/ src/features/demo-guide/ src/infrastructure/ml/ src/App.test.tsx` → 9 files, 79 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint + `tsc -b` + 91 files / 985 tests pass); `pnpm test:coverage` → functions 100% (400/400) |
| Runtime harness | N/A — no runtime boundary in slice (pure domain move; demo tour exercised via existing component tests, all green) |
| Rollback boundary | Revert the 2 slice commits (`32a7e8a`, `c8f62be`); slice-1 + 2A + 2B + W2-fix + 2C commits untouched below |

## Commits (local, no push)

- `32a7e8a` feat(nutrition): add pure classification core to domain layer
- `c8f62be` refactor(nutrition): split classification into domain core and feature mapper

## Line count

327 insertions (commit 1: 2 new files) + 14 insertions / 322 deletions
(commit 2: split + deletions) = 341 insertions total — under the 400 review
budget, no exception needed. Deletions are moved lines landing in domain.

## Layering proof (grep evidence)

- `src/domain/classification.ts` imports: `./food` (type), `./foodCategory`,
  `./trafficLight`, `./sustainability` (type) — no `@shared`, no `@features`,
  no `@infrastructure`, no `@application`.
- No `nutritional-traffic-light` import under `src/features/demo-guide/`
  (the one `App.tsx` match is the normal feature mount, not feature→feature).
- No `occultSugarDetector` reference remains under `src/`.
- `sugarAliases` consumed only by `MockScannerAdapter` (via re-export).

## Design decisions / deviations

- Flat `src/domain/classification.ts` chosen over `src/domain/nutrition/`
  subdir: checked existing layout, flat files dominate; single cohesive module
  needs no directory.
- `ClassificationResult` TYPE moved to domain (language-neutral) while Spanish
  reason VALUES stay in the feature mapper — this is the clean split the naive
  whole-file move would have violated.
- `CATEGORY_DEFAULTS` kept module-private in domain (no other consumer).
- `sugarAliases.ts` kept as re-export shim (not deleted) so the infra
  consumer path is untouched — documented split, no duplication, no behavior
  change.

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
micro-slice 341/400 insertions, stop-and-report on overflow (no overflow
occurred).

## Next

Phase 4: `e2e/demo.spec.ts` (clean profile offline 6-step path) + full gates
(`quality` → `verify` → `test:e2e`). W3 CLOSED. Remaining open:
IDB-unavailable hardening (deferred suggestion).

---

# Apply Progress: demo-reproducible-flow — Slice 3 (Phase 4: tasks 4.1–4.3 + IDB carry)

## Scope
STRICT Phase 4 only: 4.1 (`e2e/demo.spec.ts`) + 4.2 (`quality`) + 4.3
(`verify` + `test:e2e`) + cheap carry (IDB-unavailable hardening in
`resetDemoStorage.test.ts`). Zero prod code changes. No App/feature/config
changes, no push, no merge — local commit on
`feature/demo-reproducible-flow` only.

## Status: slice 3 complete

- [x] 4.1 `e2e/demo.spec.ts` (new, 115 lines, 5 tests) — clean-profile
  offline 6-step evaluator path mirroring the spec scenarios: visible entry
  button opens tour at step 1; offline full walk (datos seeded flag →
  perfil BMR/TDEE → escaneo oil-aove GREEN / cola RED → recomendacion
  valid · 7 days → sustitucion 1-3 alternatives → validaciones violations
  listed → completed summary with 6/6 Correcto); replay returns to step 1
  from scratch; exit mid-tour closes overlay and reopen shows the
  confirm-reset guard (data preserved, no wipe); `?demo=1` opens at step 1
  and strips the param. Every step asserts `Falló` count 0, so clinical
  drift fails loudly by design. Follows `e2e/smoke.spec.ts` conventions
  (`getByRole`, `toBeVisible`); offline set AFTER initial load
  (`context.setOffline(true)`) so the dev-server page loads first.
- [x] 4.2 `pnpm quality` green — prettier + oxlint (1 pre-existing warn on
  `DemoGuideContainer.tsx:47` only-export-components, from slice 2B) +
  `tsc -b` + 91 files / 985 tests pass; functions coverage 100%.
- [x] 4.3 `pnpm verify` green (quality + build, PWA precache 8 entries) +
  `pnpm test:e2e -- demo` → 9/9 pass (5 new demo + 4 smoke; the filter
  matched both spec files, so this WAS the full e2e suite — only 2 spec
  files exist).
- [x] Carry: `resetDemoStorage.test.ts` IDB-fallback test hardened —
  replaced the weak "succeeds without IndexedDB" assert with a genuine
  warn-and-continue exercise (`vi.stubGlobal('indexedDB', undefined)` on a
  fresh module + `console.warn` spy asserting `IndexedDB unavailable` +
  prefixed-key clear). Test-only change, no prod edit
  (`indexedDBAvailable` stays module-private by design).

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 4.1 e2e spec | n/a (verification artifact, not prod code; no prod change to drive) | 5/5 pass first run, `tsc -b` exit 0 | — |
| IDB carry | n/a (strengthened assert on GREEN suite) | 3/3 pass after hardening | replaced weak test instead of adding (no duplication) |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/infrastructure/resetDemoStorage.test.ts` → 1 file, 3 tests, all pass |
| Full gates | `pnpm quality` green (91 files / 985 tests); `pnpm test:coverage` → functions 100%, statements 98.59%, branches 91.98% |
| Runtime harness | `pnpm test:e2e -- demo` → 9/9 pass incl. offline 6-step walk (Playwright webServer auto-boots `pnpm dev` on :5173) |
| Rollback boundary | Revert the 1 slice commit (`7feaf8c`); delete `e2e/demo.spec.ts` only — zero prod impact |

## Commits (local, no push)

- `7feaf8c` test(demo): add offline 6-step e2e tour with replay/exit/deep-link

## Line count

123 insertions + 1 deletion = 124 changed lines (well under 400 budget).

## Design decisions / deviations

- None — implementation matches design (e2e file listed in design File
  Changes; IDB warn-and-continue matches the design Error Handling row).

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
slice 124/400 lines, stop-and-report on overflow (no overflow occurred).

## Next

Phase 5 (rollback note 5.1 + final checks 5.2) — then verify Phase 4 / archive.
W3 CLOSED. No open warnings.

---

# Apply Progress: demo-reproducible-flow — Micro-slice PRE-PHASE5-POLISH (user-reported defects)

## Scope
STRICT micro-slice only (orchestrator triage, user-reported): (1) CSP
`frame-ancestors` meta warning, (2) install-banner console message (no-change),
(3) tour unstyled (Dialog wrapper + DemoGuideView classes only). No logic
changes, no new i18n keys, no new functions, no prop changes. Local commit on
`feature/demo-reproducible-flow` only, no push, no merge.

## Status: PRE-PHASE5-POLISH complete

- [x] (1) `index.html` — removed ONLY the `frame-ancestors 'none'; ` directive
  from the CSP `<meta>` (pre-existing warning, not a regression; meta-delivered
  `frame-ancestors` is ignored by spec). Every other directive kept, incl.
  `upgrade-insecure-requests` (archived-spec pinned). `vite.config.ts`
  `server.headers` and `public/_headers` untouched (real headers where
  `frame-ancestors` is valid and enforced).
- [x] (2) Install-banner console message — NO CODE CHANGE. Wiring confirmed
  intact: `App.tsx` passes `onInstall={install}` to `InstallPrompt`;
  `useInstallPrompt().install()` calls the deferred `prompt()` (correct
  deferred-install pattern); Chrome logs an informational message for this
  pattern by design. NOT a bug.
- [x] (3) `src/App.tsx` dialog wrapper — now `fixed inset-0 z-50` overlay with
  `bg-stone-950/60` backdrop, centered scrollable panel container
  (`max-w-2xl`); `role="dialog"`, `aria-modal`, `aria-label` unchanged
  (tests + e2e depend on them).
- [x] (3) `src/features/demo-guide/DemoGuideView.tsx` — Tailwind classes only
  on all three sub-blocks (`ConfirmResetPrompt`, `StepContent` incl. checks
  list + 4 buttons, `CompletedSummary`) + the null-step fallback: `Card.tsx`
  panel convention (`bg-white dark:bg-zinc-800 rounded-xl shadow p-4 sm:p-6`),
  emerald headings (`text-emerald-700 dark:text-emerald-400`), primary
  emerald-700 action vs stone-200/zinc-700 secondary buttons (matching
  `PrimaryButton`/`InstallPrompt` conventions), pass/fail check rows
  (emerald-50/red-50 + dark variants). Same rendered strings, same props,
  zero new functions (functions coverage 100% holds).

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| Polish (classes only) | n/a (styling-only; existing 22 focused tests pin strings/roles) | 22/22 pass unchanged, `tsc -b` exit 0 | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/ src/App.test.tsx` → 3 files, 22 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint 1 pre-existing warn + `tsc -b` + 91 files / 985 tests pass; pre-commit hook re-ran it on commit) |
| Runtime harness | `pnpm test:e2e -- demo` → 9/9 pass (5 demo + 4 smoke; styled overlay keeps role queries green) |
| Rollback boundary | Revert the 1 micro-slice commit (`844f672`); all prior slice commits untouched below |

## Commits (local, no push)

- `844f672` style(demo): polish tour dialog overlay and remove meta frame-ancestors

## Line count

108 insertions + 40 deletions = 148 changed lines (well under 400 budget).

## Design decisions / deviations

- None — styling follows the existing `Card`/`PrimaryButton`/`InstallPrompt`
  conventions; no new API surface, no new i18n keys (all `demo.*` reused).

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
micro-slice 148/400 lines, stop-and-report on overflow (no overflow occurred).

## Next

Phase 5 (rollback note 5.1 + final checks 5.2) — then verify Phase 4 / archive.
PRE-PHASE5-POLISH CLOSED. No open warnings.

---

# Apply Progress: demo-reproducible-flow — Micro-slice DRAGGABLE (user-reported UX)

## Scope
STRICT micro-slice only (user request): (1) demo backdrop transparent enough
to see the screen behind; (2) tour panel movable by click-and-drag. No logic
changes to tour flow, no new i18n keys, no prop-shape breakage. Local commits
on `feature/demo-reproducible-flow` only, no push, no merge.

## Status: DRAGGABLE complete

- [x] Backdrop: `src/App.tsx` dialog overlay `bg-stone-950/60` → `bg-stone-950/25`
  (`fixed inset-0`, `role="dialog"`, `aria-modal`, `aria-label` unchanged).
- [x] Drag hook: `src/features/demo-guide/hooks/useDraggablePanel.ts` (new) —
  Pointer Events (mouse + touch), `position: DragPosition | null` (`null` =
  centered initially), pure `clampDragOffset` (half-viewport minus 48px grab
  margin), window-level move/up/cancel listeners, non-primary buttons ignored.
  Ephemeral UI state lives in the View layer; Container untouched, no
  store/port methods added.
- [x] View wiring: `src/features/demo-guide/DemoGuideView.tsx` — calls the
  hook, wraps content in `<div style={panelStyle} className="w-full">` (keeps
  `max-w-2xl` centering from the App wrapper); every section header spreads
  `dragHandleProps` with `cursor-grab`/`cursor-grabbing` + `touch-none` +
  `select-none` (handlers ONLY on headers, so inner buttons/scroll unaffected).
  `DemoGuideViewProps` unchanged (additive internal `DraggableSection` only).
- [x] Tests: `useDraggablePanel.test.tsx` (8 tests: clamp triangulation +
  probe-component pointer down/move/up, clamping, no-move-without-start,
  right-button ignore, no-drag-from-inner-buttons) + 1 View wiring test
  (header drag moves panel, cursor flips, inner Next button still fires).

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| Drag hook | new test fails on missing module import | 8/8 pass after hook | window-listener cleanup in `endDrag`; `DragHandleProps` type export |
| View wiring | 1 new View test fails (no transform) | 31/31 focused pass | content-variable restructure (same branches, wrapper div only) |
| Backdrop | n/a (single class value) | role queries green in App + e2e | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/ src/App.test.tsx` → 4 files, 31 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint 1 pre-existing warn + `tsc -b` + 92 files / 994 tests pass; pre-commit hook re-ran it on both commits) |
| Functions coverage | `pnpm test:coverage` → 100% (407/407) |
| Runtime harness | `pnpm test:e2e -- demo` → 9/9 pass (5 demo + 4 smoke; lighter backdrop + draggable panel keep role queries green) |
| Rollback boundary | Revert the 2 micro-slice commits (`418d4fa`, `34dca8a`); all prior slice commits untouched below |

## Commits (local, no push)

- `418d4fa` feat(demo): make tour panel draggable with lighter backdrop
- `34dca8a` chore(demo): drop unused renderHook import in drag hook test

## Line count

312 insertions + 34 deletions = 346 changed lines (under 400 budget; forecast
was ~80-130 — miss cause: View restructure touches all 4 section branches +
probe-component drag tests; still inside budget, no exception needed).

## Design decisions / deviations

- Window-level `pointermove`/`pointerup` listeners instead of `setPointerCapture`:
  jsdom-safe and unit-testable without capture mocks; unmount cleanup included.
- `handleClassName` helper is the only new View function — covered by the View
  wiring test (grab + grabbing branches asserted).
- View test uses locale-independent queries (`getByRole('heading')`,
  `/siguiente|next/i`) after finding the `es→en` toggle test leaks locale via
  the module-singleton `I18nProvider`.

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
micro-slice 346/400 lines, stop-and-report on overflow (no overflow occurred).

## Next

Phase 5 (rollback note 5.1 + final checks 5.2) — then verify Phase 4 / archive.
DRAGGABLE CLOSED. No open warnings.

---

# Apply Progress: demo-reproducible-flow — Micro-slice CONTENT-EDUCATIONAL (user-requested product/content pass)

## Scope
STRICT micro-slice only (user request, product/content pass, NO structural
changes): revise the VALUES (never key names) of `demo.steps.{1..6}.hint` in
`src/shared/i18n/es.ts` AND `en.ts` — max 1-2 short sentences per hint, plain
patient words, each hint states (a) what the step does + (b) patient value.
Titles kept (already simple nouns). No logic, no props, no styles, no new
keys, no new functions. `demoDataset.ts` checked — ids only, NO change (pinned
ids/values `oil-aove`, `proc-refresco-cola`, glucose 100 untouched). Local
commit on `feature/demo-reproducible-flow` only, no push, no merge.

## Status: CONTENT-EDUCATIONAL complete

- [x] es.ts — 6 hints revised (voseo kept per file convention):
  1. `Empezamos con datos de ejemplo para que explores sin miedo a
     equivocarte. Así ves cómo la app guarda tu información.`
  2. `Calculá tu objetivo calórico diario con glucosa 100 en ayunas. Este
     número adapta el plan a tu cuerpo y tu diabetes.`
  3. `El aceite de oliva virgen extra es VERDE (recomendable) y la cola es
     ROJA (evitar). El semáforo te dice al instante qué te conviene.`
  4. `Generá el plan semanal: 7 días válidos según AESAN 2022. Te muestra qué
     comer cada día sin adivinar.`
  5. `Pedí hasta 3 alternativas más sostenibles para la ternera. Te enseña a
     cambiar un alimento por una opción más sana.`
  6. `Revisá las violaciones diarias y semanales detectadas. Estas reglas te
     dan confianza de que el plan cumple criterios clínicos.`
- [x] en.ts — 6 hints revised (parity enforced by `Translations` type):
  1. `We start with sample data so you can explore without fear of mistakes.
     This shows how the app keeps your information.`
  2. `Calculate your daily calorie target with fasting glucose 100. This
     number adapts the plan to your body and your diabetes.`
  3. `Extra virgin olive oil is GREEN (recommended) and cola is RED (avoid).
     The traffic light tells you instantly what suits you.`
  4. `Generate the weekly plan: 7 valid days per AESAN 2022. It shows what to
     eat each day without guessing.`
  5. `Ask for up to 3 more sustainable alternatives to beef. It shows how to
     swap a food for a healthier option.`
  6. `Review the daily and weekly violations found. These rules give you
     confidence the plan meets clinical criteria.`
- [x] CLINICAL ACCURACY GUARD: hints reuse only domain truth the app already
  computes (glucose-100 dataset input, oil-aove GREEN / cola RED worked hint,
  7 valid days, ≤3 alternatives, AESAN 2022 rules). No new health claims, no
  invented numbers, no medical advice beyond computed output. Patient-benefit
  phrasing kept weak/accurate (`adapta`, `te dice`, `te enseña`, `confianza`).
- [x] Test asserts: NO test pinned the old hint strings (grep confirmed — only
  `demo.confirmReset` is pinned in `DemoGuideContainer.test.tsx:63` and
  `DemoGuideView.test.tsx:59`, untouched; `e2e/demo.spec.ts` uses role
  queries). Zero test edits needed; truth asserts intact.

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| Hint copy (values only) | n/a (copy-only; no behavior change, no test pins the strings) | 31/31 focused pass unchanged, `tsc -b` exit 0 | — |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm vitest run src/features/demo-guide/ src/App.test.tsx` → 4 files, 31 tests, all pass |
| Full gates | `pnpm quality` green (prettier + oxlint 1 pre-existing warn + `tsc -b` + 92 files / 994 tests pass; pre-commit hook re-ran it on commit) |
| Runtime harness | `pnpm test:e2e -- demo` → 9/9 pass (5 demo + 4 smoke; revised hints render via `useT()` role queries) |
| Rollback boundary | Revert the 1 micro-slice commit (`faec133`); all prior slice commits untouched below |

## Commits (local, no push)

- `faec133` feat(demo): revise tour hints with patient-centered educational copy

## Line count

24 insertions + 12 deletions = 36 changed lines (well under 400 budget).

## Design decisions / deviations

- Step titles + `demo.title`/`demo.confirmReset` unchanged — already simple
  labels; scope asked for educational DATA, which lives in the hints.
- `demoDataset.ts` unchanged — display-facing labels do not live there (ids
  only); pinned test values preserved by not touching it.

## Native attempt ledger

UNAVAILABLE (gentle-ai 4.1.1 has no sdd-attempt command). Manual budget used:
micro-slice 36/400 lines, stop-and-report on overflow (no overflow occurred).

## Engram mirror note

Memory tools unavailable in this subagent context — file written fully above
(MERGED: all prior slices preserved, nothing overwritten). Orchestrator: please
mirror this section to topic_key `sdd/demo-reproducible-flow/apply-progress`
via `mem_update` on the tasks-observation id.

## Next

Phase 5 (rollback note 5.1 + final checks 5.2) — then verify Phase 4 / archive.
CONTENT-EDUCATIONAL CLOSED. No open warnings.
