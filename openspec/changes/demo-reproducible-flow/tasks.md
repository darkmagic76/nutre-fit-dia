# Tasks: Demo Reproducible Flow (demo-guide)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600–900 (7 creates + 7 modifies + unit/component/e2e tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation → PR 2 tour UI → PR 3 e2e + gates |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Ports + dataset + seed/reset service + storage reset + unit tests | PR 1 | `pnpm vitest run src/application/services/seedDemoData.test.ts` | N/A (no UI yet; service exercised via unit tests) | Revert service + port + storage fn; no UI depends on it yet |
| 2 | Tour types + Container + View + i18n es/en + App overlay wiring + component tests | PR 2 | `pnpm vitest run src/features/demo-guide/` | `pnpm dev` → header demo button → walk 6 steps manually | Remove overlay entry + `demo-guide/` dir; service stays unused |
| 3 | `e2e/demo.spec.ts` + full gates (`quality` → `verify` → `test:e2e`) | PR 3 | `pnpm test:e2e -- demo` | `pnpm test:e2e` clean profile offline run | Delete `e2e/demo.spec.ts` only; zero prod impact |

## Phase 1: Foundation — ports, dataset, storage

- [x] 1.1 RED: add failing unit tests for `seedDemo` guard (empty seeds / non-empty aborts / `confirmed=true` seeds) in `src/application/services/seedDemoData.test.ts`
- [x] 1.2 Create `src/application/ports/demoGuide.ts` with `DemoGuidePort` (`seedDemo`/`resetDemo`)
- [x] 1.3 Create `src/application/services/demoDataset.ts` (`DEMO_METRICS_INPUT` glucose 100, `DEMO_ENTRY_IDS`, `DEMO_TRIGGER_FOOD_ID`; no `fixtures.ts` import)
- [x] 1.4 GREEN: create `src/application/services/seedDemoData.ts` port-injected over `logRepo`/`biomarkerRepo` (metrics write)/`planRepo`/`activityRepo`
- [x] 1.5 Modify `src/application/ports/container.ts`: expose `seedDemo`/`resetDemo` on container
- [x] 1.6 Modify `src/infrastructure/compositionRoot.ts`: wire demo service to repos, keep `createContainer()` isolation
- [x] 1.7 RED→GREEN: add `resetDemoStorage()` to `src/infrastructure/storage.ts` (IDB key delete + prefixed-key clear, preserve foreign keys) with dual-crypto unit tests

## Phase 2: Core — tour UI (Container/View split)

- [x] 2.1 Create `src/features/demo-guide/types.ts` (step union via const object, check-result types)
- [x] 2.2 RED: failing Container state-machine tests (`START`/`NEXT`/`BACK`/`REPLAY`/`EXIT`, `?demo=1` fires once then stripped)
- [x] 2.3 GREEN: create `src/features/demo-guide/DemoGuideContainer.tsx` (local `currentStep`/`completedChecks`, `useContainer()` ports only, advisory checks, metrics write at step 2)
- [x] 2.4 Create `src/features/demo-guide/DemoGuideView.tsx` (pure props stepper + step components, `useT()` strings only)
- [x] 2.5 Modify `src/shared/i18n/types.ts`, `es.ts`, `en.ts`: all `demo.*` keys in both locales

## Phase 3: Integration — App wiring

- [x] 3.1 Modify `src/App.tsx`: header button beside locale toggle + overlay mount + `onNavigate` props; `?demo=1` deep-link secondary only
- [x] 3.2 Component tests: View pure-props render + es/en toggle via `getByRole` queries

## Phase 4: Testing — e2e + gates

- [x] 4.1 Create `e2e/demo.spec.ts`: clean profile offline 6-step path (tour complete, replay resets, exit preserves data, drift-fails-loudly)
- [x] 4.2 Run `pnpm quality` → fix format/lint/typecheck (functions coverage must stay 100%)
- [x] 4.3 Run `pnpm verify` then `pnpm test:e2e` green

## Phase 5: Cleanup

- [x] 5.1 Verify rollback note: removal = overlay entry + container port exposure only; no domain/threshold revert
- [x] 5.2 Confirm no `Tab` union change, no `fixtures.ts` import in prod code, no store-direct imports in View

## Phase 6: Remediation (2026-10-21) — spec gaps closed

- [x] 6.1 WU1 — ephemeral `StoreSet` per `createContainer()`; singleton wired to the global stores + `resetDemo` (`f426cd8`)
- [x] 6.2 WU2 — frozen `DEMO_EXPECTED` oracle + drift canaries for steps 2 and 6 (`705aac5`)
- [x] 6.3 WU3 — `App.tsx` owns `?demo=1`; the tour no longer parses or rewrites the URL (`dc9e436`)
- [x] 6.4 WU4 — real offline cold start: `playwright.offline.config.ts`, `e2e/offline.spec.ts`, CI `offline` job (`eafc2ac`)
- [x] 6.5 WU5 — dataset pinned; Day 1, Log violations and EN locale asserted (`95f5140`)
- [x] 6.6 WU6 — spec/design/archive aligned with the implementation (D2-B ports-only, D4-A rollback)
