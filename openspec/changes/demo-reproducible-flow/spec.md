# Spec: demo-reproducible-flow

## New Capability: demo-guide

### Requirement: Tour orchestration
The system MUST provide `features/demo-guide/` stepper with 6 ordered steps: datos-iniciales, perfil, escaneo, recomendacion, sustitucion, validaciones. State (currentStep, completedChecks) MUST be local to the feature. Container MUST NOT import stores; stateful access goes through `useContainer()` ports. Pure domain functions and the shared food catalog (`@shared/data/foods`) MAY be imported directly. View MUST be pure props, with no store or container access.

#### Scenario: Complete tour offline
- GIVEN clean profile, offline PWA, evaluator opens app
- WHEN tour runs steps 1-6 in order
- THEN each step shows expected-vs-actual check and plan valido by step 6

#### Scenario: Replay from scratch
- GIVEN tour completed with seeded data
- WHEN evaluator clicks replay
- THEN stores reset via `resetDemo` + `seedDemo` and tour returns to step 1

#### Scenario: Exit preserves data
- GIVEN tour mid-step with seeded data
- WHEN evaluator exits tour
- THEN seeded data remains; no wipe occurs

### Requirement: Entry and deep-link
The system MUST expose a visible self-discoverable button/tab entry. `?demo=1` MUST be secondary deep-link only, never the sole entry. `App.tsx` MUST be the single owner of deep-link parsing and URL cleanup; the tour module MUST NOT read or rewrite the query string.

#### Scenario: Visible entry
- GIVEN app home, no query param
- WHEN evaluator looks for demo
- THEN a button/tab labelled via i18n starts the tour

#### Scenario: Deep-link
- GIVEN URL with `?demo=1`
- WHEN app loads
- THEN tour opens at step 1 without duplicating entry logic

### Requirement: Per-step checks against a frozen oracle
Each step MUST compare live domain output against a frozen demo oracle (`DEMO_EXPECTED` in `application/services/demoExpectations.ts`). Expected values MUST NOT be derived from the same live value the check evaluates — that makes the check unable to fail. Live values come from `calculateTarget`, `classifyFood`, `generateWeeklyPlan`, `suggestAlternative` and `validateRations`/`validateWeeklyRations`. Updating `DEMO_EXPECTED` requires evidence that the new output is clinically correct (spec or ADR in the same commit). One worked hint MAY pin oil-aove GREEN and cola RED.

| Step | Check rule |
|------|-----------|
| 1 datos | seeded flag equals `DEMO_EXPECTED.seeded` |
| 2 perfil | `calculateTarget` BMR/TDEE equals `1345`/`1614` |
| 3 escaneo | `classifyFood('oil-aove')`=GREEN; `classifyFood('proc-refresco-cola')`=RED |
| 4 recomendacion | `generateWeeklyPlan` returns valid plan, 7 days, Day 1 rendered in the plan tab |
| 5 sustitucion | `suggestAlternative(high-carbon food)` returns 1–3 alternatives |
| 6 validaciones | daily/weekly violation counts equal `5`/`3` and are rendered in the Log tab |

#### Scenario: Clinical drift fails loudly
- GIVEN a clinical threshold, catalog food or generator change
- WHEN the tour check runs
- THEN live output diverges from `DEMO_EXPECTED`, the check fails and e2e goes red

### Requirement: Seed dataset isolation
`demoDataset` MUST be production-safe, separate from `src/test/fixtures.ts`. Seed MUST build domain objects (`Food`, entries, metrics); adapters persist.

#### Scenario: No fixture leakage
- GIVEN unit fixtures change
- WHEN demo seeds
- THEN demo output unchanged (independent dataset module)

## Modified Capability: infrastructure-storage

### Requirement: Atomic resetDemo
`resetDemo` MUST atomically clear all `nutrefitdia-*` localStorage keys AND cycle the IndexedDB AES key (delete + regenerate on next write). MUST leave non-prefixed keys untouched. MUST pass under jsdom crypto mock and real Web Crypto.

#### Scenario: Atomic reset
- GIVEN seeded stores + AES key present
- WHEN `resetDemo()` runs
- THEN all prefixed keys gone, key deleted, next `seedDemo` re-encrypts cleanly

#### Scenario: No collateral wipe
- GIVEN unrelated key `other-app-x` in localStorage
- WHEN `resetDemo()` runs
- THEN unrelated key preserved

### Requirement: Guarded seed semantics
`seedDemo` MUST seed ONLY when all target stores empty; else require explicit confirm flag. Exit path MUST NOT call reset.

#### Scenario: Non-empty requires confirm
- GIVEN log store has user entries
- WHEN seed requested without `confirmed=true`
- THEN seed aborts, data untouched, confirm prompt shown

## Modified Capability: composition-root

### Requirement: Port exposure
Container MUST expose `seedDemo`/`resetDemo` behind injected port (props/constructor), preserving `createContainer()` isolation and `container` singleton for provider only.

#### Scenario: Test isolation
- GIVEN two `createContainer()` instances
- WHEN one seeds demo
- THEN other remains empty

## Cross-cutting

### Requirement: i18n
Every tour string MUST have `es`+`en` keys in `src/shared/i18n/`. Missing key MUST fail typecheck/e2e language toggle.
Keys: `demo.title, demo.steps.{1..6}.title, demo.steps.{1..6}.hint, demo.expected, demo.actual, demo.replay, demo.exit, demo.confirmReset, demo.check.{green,red,planValid,alternatives,violations}`.

### Requirement: Tests and gates
The system MUST add `e2e/demo.spec.ts` (6 steps, clean profile, deep-link, EN locale) plus `e2e/offline.spec.ts` under `playwright.offline.config.ts` (production build + preview, service worker, cold reload with the network down), and unit tests for seed/reset/checks/dataset. Functions coverage MUST stay 100%. `pnpm quality`, `verify`, `test:e2e` and `test:e2e:offline` MUST be green.

### Requirement: Rollback
Removal = App entry (`App.tsx` button + `?demo=1` effect) + `seedDemo`/`resetDemo` from the Container port. Feature modules, i18n keys and tests MAY remain dormant and be deleted opportunistically. `resetDemo` only removes `nutrefitdia-*` keys; no domain/threshold revert is needed.

## Non-goals
docs/slides + README demo section; clinical/food/algorithm changes; Storybook harness.
