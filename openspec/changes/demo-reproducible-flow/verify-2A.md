# Verify Report: demo-reproducible-flow — Sub-slice 2A (WARNING fix + 2.1 + 2.5)

- Change: `demo-reproducible-flow`
- Slice: 2A ONLY — tasks 2.1 (tour types) + 2.5 (i18n keys) + verify-slice-1
  WARNING fix (in-memory clear semantics + resetDemo 4-clears + replay
  regression test). Tasks 2.2/2.3/2.4 (Container/View), Phases 3/4/5
  OUT OF SCOPE — not judged, not failures.
- Branch: `feature/demo-reproducible-flow` (local, no push)
- Commits: `8534462`, `bbdf153`, `84c3821`, `9236b30` — 17 files,
  230 insertions, 1 deletion
- Verifier: sdd-verify sub-slice 2A (read-only; no edits, no commits, no pushes)
- Date: 2026-10-13

## Verdict: PASS

Slice-1 WARNING resolved. Sub-slice tasks 2.1 + 2.5 complete per spec/design.
Focused unit tests (97/97) green, typecheck (`tsc -b`) exit 0 — both
re-executed by this verifier, not copied from apply-progress.

## Completeness (sub-slice 2A)

| Task | Status | Evidence |
|------|--------|----------|
| 2.1 `src/features/demo-guide/types.ts` | ✅ done | `DEMO_STEPS` const object + `DemoStep` union + `DEMO_STEP_ORDER` (6 steps), `DemoCheckResult`, `DemoGuideContainerProps` (`onNavigate(tab: Tab)`, `onExit`), `DemoGuideViewProps` (pure props). No `enum` anywhere in `features/demo-guide/` (grep clean) — `erasableSyntaxOnly` holds |
| 2.5 i18n `demo.*` es+en | ✅ done | `src/shared/i18n/types.ts` + `es.ts` + `en.ts` gain identical 29-key `demo.*` block; `Translations` interface enforces parity at typecheck |
| WARNING fix: clear-port methods | ✅ done | `clearBiomarkers()` on `BiomarkerRepository` → delegates to existing `resetBiomarkerHistory()` (`zustandBiomarkerRepository.ts:18`); `clearActivity()` on `ActivityRepository` → delegates to existing `resetWeek()` (`zustandActivityRepository.ts:17`); new `clearPlan()` store action (`planStore.ts:52-54`, `set({ weeklyPlan: null })`) exposed via `PlanRepository` → `zustandPlanRepository.ts:14` |
| WARNING fix: `resetDemo` 4-clears | ✅ done | `seedDemoData.ts:62-68` invokes `logRepo.clearLog()` + `biomarkerRepo.clearBiomarkers()` + `planRepo.clearPlan()` + `activityRepo.clearActivity()` + `await resetStorage()` |
| WARNING fix: regression test | ✅ done | `seedDemoData.test.ts`: extended reset test asserts all 5 stores empty + `resetStorage` called once; new `seed → reset → seed without confirm (replay regression)` test asserts `{ seeded: true, aborted: false }` and log length `=== DEMO_ENTRY_IDS.length` |
| 2.2/2.3/2.4, Phase 3/4/5 | ➖ OUT OF SCOPE | Untouched by these 4 commits (file list confirms); judged in later slices |

## Slice-1 WARNING resolution

Verify-slice-1 WARNING (`seedDemoData.ts:62-65`): service-level `resetDemo`
cleared only the log port + persisted storage, so REPLAY (reset→seed) with
live stores would leave stale glucose/weight/plan/activity in memory and the
guard would abort. **RESOLVED**: `resetDemo` now clears all 4 in-memory
stores before cycling storage, and the replay regression test proves the
reset→seed path works (`seeded: true, aborted: false`). The second WARNING
(plan-content note for future step-2/step-4 checks) remains advisory for
slice 2B — no action now.

## Build / test evidence (executed by verifier)

- `pnpm vitest run src/application/services/seedDemoData.test.ts src/infrastructure/adapters/repository.test.ts src/infrastructure/adapters/contract.test.ts src/application/use-cases/calculateTarget.test.ts src/infrastructure/stores/trackerStore.test.ts src/infrastructure/stores/planStore.test.ts` → **6 files, 97 tests, all pass** (2.47 s)
- `pnpm tsc -b` → **exit 0**, no errors
- Full `pnpm quality` not re-run (apply-progress records it green at 89 files / 966 tests via pre-commit hooks; sub-slice touches nothing outside its 17 files; typecheck + focused tests re-confirmed here)

## Spec compliance matrix (sub-slice-relevant sections only)

| Spec requirement / scenario | Status | Covering test (passed at runtime) |
|---|---|---|
| Seed dataset isolation — no fixture leakage | ✅ COMPLIANT | No prod import of `fixtures` (grep: only `*.test.ts` import fixtures; `demoDataset.ts` mentions fixtures solely in a doc comment); dataset untouched by this sub-slice |
| Guarded seed — non-empty requires confirm | ✅ COMPLIANT | `aborts without touching data when stores are non-empty and no confirm flag` (unchanged, still passing) |
| Atomic reset — prefixed keys gone, key cycled, clean re-encrypt | ✅ COMPLIANT | Slice-1 storage tests unchanged and passing; service-level reset now additionally clears all in-memory stores (extended test above) |
| No collateral wipe (`other-app-x` preserved) | ✅ COMPLIANT | Slice-1 test unchanged and passing |
| Port exposure — `createContainer()` isolation | ✅ COMPLIANT | Slice-1 isolation test unchanged and passing; 3 typed fakes updated with clear-method bodies; `contract.test.ts` asserts all 3 new adapter arrows exist |
| REPLAY reset→seed path (slice-1 WARNING) | ✅ COMPLIANT (new) | `supports seed → reset → seed without confirm (replay regression)` — passed at runtime |
| i18n — every tour string has es+en keys | ✅ COMPLIANT | All spec-listed keys present in both locales (see key audit below); `Translations` type enforces parity at compile time (`tsc -b` exit 0) |
| Tour orchestration / entry / per-step checks / e2e gates | ➖ OUT OF SCOPE | Tasks 2.2–2.4, Phase 3/4 — judged when those slices land |

## i18n key audit (spec § i18n list vs `types.ts`)

Spec-required keys — all present in `types.ts` + `es.ts` + `en.ts`:

- `demo.title` ✅ | `demo.steps.{1..6}.title` ✅ (6/6) | `demo.steps.{1..6}.hint` ✅ (6/6)
- `demo.expected` ✅ | `demo.actual` ✅ | `demo.replay` ✅ | `demo.exit` ✅
- `demo.confirmReset` ✅ | `demo.check.green/red/planValid/alternatives/violations` ✅ (5/5)

Superset (not required, harmless): `demo.next/back/pass/fail/confirm/cancel`
(6 keys, both locales, identical sets). es strings use voseo
(`Verificá`, `Calculá`, `Generá`, `Pedí`, `Revisá`, `Querés`) matching the
existing `es.ts` convention.

## Correctness checks

- `isEmptyStores` guard still covers all 5 stores; `resetDemo` now clears the
  same 5 surfaces (log, glucose, weight, plan, activity) + storage — guard and
  reset are symmetric. ✅
- `clearBiomarkers`/`clearActivity` reuse existing store semantics
  (`resetBiomarkerHistory`/`resetWeek`) — no new store behavior except
  `clearPlan`, which has no existing counterpart (`set({ weeklyPlan: null })`
  is the minimal correct discard). ✅
- Application service still imports ports + shared data only — no
  infrastructure import (Clean Architecture dependency rule holds). ✅
- `DemoGuideViewProps` includes `confirmReset` + `onConfirmSeed` for the
  spec's non-empty guard prompt; 2B may refine when wiring the Container
  (pre-noted in apply-progress, not a deviation). ✅

## Design coherence

- `DEMO_STEPS` const object + derived union matches design File Changes row
  (`types.ts`: "step union via const object, check-result types"). ✅
- `DemoGuidePort` shape untouched; clear methods added to the three
  repository ports (not to `DemoGuidePort` itself) — matches the delegation
  the slice-1 report suggested. ✅
- `Translations` gains `demo.*` keys in both locales per design contract
  ("`es.ts` + `en.ts` both required — typecheck enforces"). ✅
- Scope-rule: `types.ts` lives local in `features/demo-guide/` (1 consumer). ✅
- Container/presentational: `DemoGuideViewProps` is pure data + callbacks, no
  store imports. ✅

## Scope-confinement checks (must-haves for 2A)

- (a) Slice-1 WARNING resolved — YES (replay regression test green, § above).
- (b) No `Tab` union change — YES (`git diff 3677faf..9236b30 --name-only`
  contains no navigation/hook file; `types.ts:1` is a type-only
  `import type { Tab }`, no union edit). No `fixtures` import in prod — YES
  (grep clean, § above). No `App.tsx` touch — YES (absent from 17-file list).
- (c) i18n keys complete in both locales per spec list — YES (§ key audit).

## Issues

### CRITICAL

None.

### WARNING

None (the slice-1 WARNING is resolved; remaining slice-1 advisory about
step-2/step-4 check strictness belongs to 2B and is not re-raised as a
finding against this sub-slice).

### SUGGESTION

- The `repository.test.ts` clear tests exercise delegation through the real
  Zustand stores (not mocks) — good. When 2B wires `REPLAY`, prefer an
  integration test through `createContainer()` proving reset→seed works
  against the real adapters, not just the typed fakes.
- Prior slice-1 SUGGESTION (IDB-unavailable hardening via
  `indexedDBAvailable=false` stub) is still open and still deferred — no
  action for 2A, noted so 2B/Phase 4 can pick it up.

## Out of scope (explicitly NOT failures)

Tasks 2.2 (Container RED tests), 2.3 (Container GREEN), 2.4 (View),
Phase 3 (App wiring), Phase 4 (e2e + full gates), Phase 5 (cleanup/rollback
verification). Spec §§ tour orchestration, entry/deep-link, per-step checks,
tests-and-gates (e2e level) are judged when those slices land.

## Next recommended

Sub-slice 2B per apply-progress: tasks 2.2 + 2.3 + 2.4 + Phase 3 App wiring
(needs its own budget decision — Phase 2 remainder was forecast over budget;
do NOT assume single-PR). Carry into 2B: (1) the `DemoGuideViewProps`
`confirmReset`/`onConfirmSeed` shape may be refined when the Container lands;
(2) step-2/step-4 checks must assert seeded values satisfy
`calculateTarget`/`generateWeeklyPlan` truth (slice-1 advisory); (3) the
IDB-unavailable hardening suggestion is still open.
