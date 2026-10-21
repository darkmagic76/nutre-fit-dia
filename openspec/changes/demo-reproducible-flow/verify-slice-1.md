# Verify Report: demo-reproducible-flow — Slice 1 (Phase 1 foundation)

- Change: `demo-reproducible-flow`
- Slice: 1 only (tasks 1.1–1.7, Phase 1). Phases 2/3/4/5 OUT OF SCOPE — not judged.
- Branch: `feature/demo-reproducible-flow` (local, no push)
- Commits: `7e88dac`, `6adc871`, `3677faf` — 9 files, 359 insertions, 0 deletions
- Verifier: sdd-verify (read-only; no code edits, no commits, no pushes)
- Date: 2026-10-13

## Verdict: PASS

All 7 slice tasks complete. Focused unit tests (33/33) green, typecheck (`tsc -b`) green.
Spec sections judged at unit level only; e2e belongs to a later slice.

## Completeness (slice 1)

| Task | Status | Evidence |
|------|--------|----------|
| 1.1 RED guard tests | ✅ done | `src/application/services/seedDemoData.test.ts` — 5 tests (empty seeds / non-empty aborts / confirmed seeds / reset cycles storage / instance isolation) |
| 1.2 `DemoGuidePort` | ✅ done | `src/application/ports/demoGuide.ts` — matches design contract exactly (`seedDemo`/`resetDemo` signatures) |
| 1.3 `demoDataset.ts` | ✅ done | `DEMO_METRICS_INPUT` (glucose `'100'`), `DEMO_ENTRY_IDS` (`oil-aove`, `proc-refresco-cola`), `DEMO_TRIGGER_FOOD_ID` (`meat-ternera`); zero `fixtures.ts` import (only a doc-comment mention) |
| 1.4 `seedDemoData.ts` | ✅ done | `createDemoGuideService(deps)` port-injected over `logRepo`/`biomarkerRepo`/`planRepo`/`activityRepo`; guard = all-empty OR `confirmed` |
| 1.5 container port exposure | ✅ done | `container.ts` gains `seedDemo`/`resetDemo` typed as `DemoGuidePort[...]`; type-level test asserts both |
| 1.6 compositionRoot wiring | ✅ done | `createContainer()` binds service to repo adapters, injects real `resetDemoStorage`; factory isolation kept (fresh `demoGuide` per call, no module state) |
| 1.7 `resetDemoStorage()` | ✅ done | IDB key delete + `cachedKey=null` + prefixed-key clear, foreign keys preserved, IDB-unavailable fallback; 3 crypto-agnostic tests |

## Build / test evidence (executed by verifier, not copied from apply-progress)

- `pnpm vitest run src/infrastructure/resetDemoStorage.test.ts src/application/services/seedDemoData.test.ts src/application/ports/container.test.ts src/infrastructure/compositionRoot.test.ts src/infrastructure/storage.test.ts` → **5 files, 33 tests, all pass** (2.25 s)
- `pnpm tsc -b` → **exit 0**, no errors
- Full `pnpm quality` not re-run (apply-progress records it green at 89 files / 962 tests; slice touches nothing outside its 9 files; typecheck + focused tests re-confirmed here)

## Spec compliance matrix (slice-relevant sections only)

| Spec requirement / scenario | Status | Covering test (passed at runtime) |
|---|---|---|
| Seed dataset isolation — no fixture leakage | ✅ COMPLIANT | `seedDemoData.test.ts` builds expectations from `demoDataset` + `foodsById`, never `fixtures.ts`; grep confirms no prod import of `fixtures` |
| Guarded seed — non-empty requires confirm | ✅ COMPLIANT | `aborts without touching data when stores are non-empty and no confirm flag` (+ asserts biomarker untouched) |
| Guarded seed — empty seeds / confirmed seeds | ✅ COMPLIANT | `seeds demo data when all target stores are empty`; `seeds when confirmed=true even if non-empty` |
| Atomic reset — prefixed keys gone, key cycled, clean re-encrypt | ✅ COMPLIANT | `removes all prefixed keys and preserves foreign keys`; `cycles the key: encrypt → reset → encrypt → decrypt roundtrips cleanly` |
| No collateral wipe (`other-app-x` preserved) | ✅ COMPLIANT | `removes all prefixed keys and preserves foreign keys` asserts `other-app-x === 'untouched'` |
| Port exposure — `createContainer()` isolation | ✅ COMPLIANT | `keeps two service instances isolated (separate repos)`; container type test |
| Tour orchestration / entry / per-step checks / i18n / e2e gates | ➖ OUT OF SCOPE | Phases 2–4, judged in later slices |

## Correctness checks

- Guard predicate covers all 5 stores (log, glucose, weight, plan, activity). ✅
- Seed writes domain objects via ports only (`foodsById` is a shared data catalog, not a store — allowed by design). ✅
- `resetDemo` calls `logRepo.clearLog()` + injected `resetStorage` — never imports infrastructure (Clean Architecture dependency rule holds; application imports ports + shared data only). ✅
- `deleteKeyFromIndexedDB` degrades gracefully (warn + `indexedDBAvailable=false`), reset still clears localStorage. ✅
- LocalStorage scan collects doomed keys before deleting (no live-index mutation bug). ✅

## Design coherence

- `DemoGuidePort` shape matches design contract verbatim. ✅
- DI via ports: `resetStorage` injected through `DemoGuideDeps` (deviation from task text noted in apply-progress; architecturally superior — preserves Domain Isolation). Accepted, not a violation. ✅
- No `Tab` union change, no `App.tsx` touch, no View/store imports in prod code (`git diff` slice = 9 files, none in `features/` or `App`). ✅
- `DEMO_METRICS_INPUT.diagnosisAge = '30'` deviation (documented: `parseNumeric('')` throws) — valid input, no spec impact. ✅

## Issues

### CRITICAL

None.

### WARNING

- **Service-level `resetDemo` clears only the log port + persisted storage.** In-memory biomarker/plan/activity adapters have no clear-port methods, so a `REPLAY` (reset→seed) with live stores would leave stale glucose/weight/plan/activity in memory and the subsequent `seedDemo` guard would abort (stores non-empty). Deferred to Phase 2 per apply-progress (may add clear methods then). Must be resolved before the Phase 2 REPLAY path is wired — flagging so slice 2 plans for it. (`src/application/services/seedDemoData.ts:62-65`)
- **`recordWeight(Number('70'), Number('165'))` recomputes IMC via `computeIMC`, and `generatePlan()` is called with no args** — plan content derives from whatever the adapters hold, not from an explicit restriction/4-week param. Fine for slice 1 (no per-step checks yet), but slice 2 step-2/step-4 checks must assert the seeded values actually satisfy `calculateTarget`/`generateWeeklyPlan` truth. No action now.

### SUGGESTION

- `resetDemoStorage.test.ts` third test name (`succeeds without IndexedDB`) does not force IDB unavailability — under jsdom it passes trivially since `fake-indexeddb` (if present) or the fallback both succeed. Consider a slice-2 hardening: stub `indexedDBAvailable=false` (module reset + vi.mock) to genuinely exercise the warn-and-continue path.

## Out of scope (explicitly NOT failures)

Phases 2 (tour UI), 3 (App wiring), 4 (e2e + full gates), 5 (cleanup/rollback verification). Spec §§ tour orchestration, entry/deep-link, per-step checks, i18n, tests-and-gates (e2e level) are judged when those slices land.

## Next recommended

Slice 2 (Phase 2 tour UI per `tasks.md` 2.1–2.5), addressing the WARNING above: decide in-memory clear semantics for biomarker/plan/activity adapters (add clear-port methods or document REPLAY via full `resetDemoStorage` + store rehydrate) before wiring `REPLAY`.
