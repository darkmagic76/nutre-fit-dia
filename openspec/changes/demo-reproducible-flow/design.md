# Design: Demo Reproducible Flow (demo-guide)

## Technical Approach

Guided 6-step tour over the REAL app: `DemoGuideContainer` orchestrates navigation (via props callbacks into App-owned `useTabNavigation`) and verification, while a port-injected application service (`seedDemo`/`resetDemo`) owns data setup. Seed builds domain objects (`Food`, entries, metrics input); Zustand adapters persist. Per-step checks compare live domain output against a frozen oracle (`DEMO_EXPECTED`) — expected is never derived from the same value being checked — so clinical drift fails loudly.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Seed service in `application/services/` vs local `features/demo-guide/services/` | Local fits scope-rule (1 consumer); application fits reuse (container root + tour share it) | Application layer: `seedDemoData.ts` + `demoDataset.ts` receive repo ports; tour stays thin (SRP) |
| `demoDataset.ts` vs reuse `src/test/fixtures.ts` | Reuse is DRY but couples prod tour to test doubles | New `demoDataset.ts` next to service; fixtures untouched (Domain Isolation) |
| Tour state in Zustand store vs local `useState` | Store enables cross-feature access but violates scope-rule | Local `currentStep`/`completedChecks` in Container; nothing else reads tour state |
| Seed via stores directly vs via container ports | Direct import is existing anti-pattern (AUDIT_CLEAN P1) | Container calls `useContainer().seedDemo/resetDemo` only; View has zero imports |
| Block advance on failed check vs advisory checks | Blocking is stricter but traps evaluator on drift | Advisory: check shows pass/fail + expected/actual; Next always enabled; `completedChecks` records passes |
| New `demo` tab vs overlay entry | New tab extends `Tab` union (touches nav for all users) | Overlay panel + header button; `?demo=1` opens it. No `Tab` union change (OCP) |

## Data Flow

```
App (owns useTabNavigation + ?demo=1 detect)
 │ onNavigate(tab), onStart/onExit props
 ▼
DemoGuideContainer ──useContainer()──▶ seedDemo/resetDemo (ports)
 │ local: currentStep, completedChecks, seeded
 │ pure domain imports (no DI): classifyFood, calculateTarget,
 │   generateWeeklyPlan, suggestAlternative, validateRations
 ▼
DemoGuideView (+ step components) — pure props, useT() strings only
```

| Step | Tab target | Seed prerequisite | Check rule (live vs `DEMO_EXPECTED`) |
|---|---|---|---|
| 1 datos | — | `isEmpty` or seeded flag | Seeded flag equals frozen `seeded` |
| 2 perfil | metabolic | metrics input (glucose=100) via `calculateTarget` port | BMR/TDEE equal `1345`/`1614` |
| 3 escaneo | scanner | `foodsById.get('oil-aove'/'proc-refresco-cola')` | `classifyFood(oil-aove)`=GREEN; `classifyFood(cola)`=RED (sole worked hint) |
| 4 recomendacion | plan | `generateWeeklyPlan(restriction,4)` → planRepo | Plan valid, 7 days, Day 1 rendered |
| 5 sustitucion | sustainability | high-carbon trigger food from dataset | `suggestAlternative(food,catalog)` returns 1–3 |
| 6 validaciones | log | seeded entries | Daily/weekly violation counts equal `5`/`3` and render in the Log tab |

## State Machine

States: `closed → step[1..6] → completed`; events: `START / NEXT / BACK / REPLAY / EXIT`.
`START`: if stores non-empty and no `confirmed` → show `demo.confirmReset`, abort. Else `seedDemo()` → step 1. `REPLAY`: `resetDemo()` → `seedDemo()` → step 1 (confirm gate identical). `EXIT`: close overlay only — never calls reset. `App.tsx` owns `?demo=1`: it parses the param, strips it with `history.replaceState`, and opens the overlay; the tour module never reads or rewrites the query string.

## Interfaces / Contracts

```typescript
// application/ports/demoGuide.ts
interface DemoGuidePort {
  seedDemo(opts?: { confirmed?: boolean }): Promise<{ seeded: boolean; aborted: boolean }>;
  resetDemo(): Promise<void>;
}
// Container gains: seedDemo; resetDemo (bound to repos, same pattern as calculateTarget)
// DemoGuideContainerProps: { onNavigate(tab: Tab): void; onExit(): void }
```

`seedDemoData.ts` is pure + port-injected: `(repos: { logRepo; biomarkerRepo; planRepo; activityRepo }) => DemoGuidePort`. `demoDataset.ts` exports const `DEMO_METRICS_INPUT` (glucose 100), `DEMO_ENTRY_IDS`, `DEMO_TRIGGER_FOOD_ID` — typed domain objects, no store imports. `resetDemoStorage()` in `infrastructure/storage.ts`:

```
deleteKeyFromIndexedDB() → cachedKey=null → remove all localStorage keys
starting `${env.VITE_STORAGE_PREFIX}-` → next encrypt regenerates key via getOrCreateKey()
```

`Translations` gains `demo.*` keys (spec list); `es.ts` + `en.ts` both required — typecheck enforces.

## Error Handling

| Failure | Behavior |
|---|---|
| Seed on non-empty w/o confirm | Abort, data untouched, confirm prompt |
| IndexedDB unavailable | Warn + continue in-memory (existing `indexedDBAvailable` fallback); reset still clears localStorage |
| Old PBKDF2-format data on reset path | Existing migration error surfaces; reset clears keys so next seed is clean |
| Domain drift (threshold/food/generator change) | Live output diverges from `DEMO_EXPECTED` → mismatch shown, e2e red by design |

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | `seedDemo` guard (empty/non-empty/confirmed), `resetDemo` atomicity + non-prefixed preservation, per-step check fns | Vitest; dual crypto (jsdom mock + real Web Crypto path) |
| Component | Container state machine (start/replay/exit), View pure-props render, es/en toggle | Testing Library `getByRole` |
| E2E | `e2e/demo.spec.ts`: clean profile, 6 steps, deep-link, EN locale | Playwright, dev-server `webServer` |
| E2E offline | `e2e/offline.spec.ts`: build + preview, waits for the service worker, reloads with the network down | Playwright, `playwright.offline.config.ts` (`pnpm test:e2e:offline`) |

Gates: `pnpm quality` + `verify` + `test:e2e` + `test:e2e:offline` green; functions coverage stays 100% (every new function unit-tested).

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Rollback = remove the App entry (`App.tsx` button + `?demo=1` effect) and `seedDemo`/`resetDemo` from the Container port; `resetDemo` only clears `nutrefitdia-*` keys, so foreign data survives; no domain/threshold revert is needed.

Removal checklist:
1. Delete the header demo button and the `?demo=1` effect from `src/App.tsx`.
2. Remove `seedDemo`/`resetDemo` from `src/application/ports/container.ts` and `src/infrastructure/compositionRoot.ts`.
3. Delete `src/application/services/seedDemoData.ts`, `demoDataset.ts`, `demoExpectations.ts` and `src/application/ports/demoGuide.ts`.
4. Delete `src/features/demo-guide/` and its tests.
5. Delete `e2e/demo.spec.ts`, `e2e/offline.spec.ts` and `playwright.offline.config.ts`; drop `test:e2e:offline` and the CI `offline` job.
6. Remove `demo.*` i18n keys from `es.ts`/`en.ts` and `types.ts`.
7. Keep `resetDemoStorage()` only if another caller uses it; otherwise delete it with its tests.

## Open Questions

- [ ] Demo entry placement in header vs hero banner — team visual call (default: header button beside locale toggle).
- [ ] Should step 2 write metrics into biomarkerRepo or preview only? Default: write (needed for valid plan at step 4).

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/demo-guide/DemoGuideContainer.tsx` | Create | Tour state machine, port calls, check computation |
| `src/features/demo-guide/DemoGuideView.tsx` | Create | Pure stepper UI + step components |
| `src/features/demo-guide/types.ts` | Create | Step union (const object, no enums), check result types |
| `src/application/services/seedDemoData.ts` | Create | Port-injected `seedDemo`/`resetDemo` |
| `src/application/services/demoDataset.ts` | Create | Production-safe dataset (no fixture import) |
| `src/application/services/demoExpectations.ts` | Create | Frozen `DEMO_EXPECTED` oracle for the tour checks |
| `src/application/services/demoDataset.test.ts` | Create | Pins dataset values + catalog resolution |
| `src/features/demo-guide/DemoGuideContainer.drift.test.tsx` | Create | Proves every check can fail on domain drift |
| `src/test/storeReset.ts` | Create | Shared `resetGlobalStores()` for composition-root tests |
| `src/application/ports/demoGuide.ts` | Create | `DemoGuidePort` interface |
| `src/application/ports/container.ts` | Modify | Add `seedDemo`/`resetDemo` |
| `src/infrastructure/compositionRoot.ts` | Modify | Wire demo service to repos |
| `src/infrastructure/storage.ts` | Modify | Add `resetDemoStorage()` (IDB key delete + prefixed clear) |
| `src/shared/i18n/types.ts`, `es.ts`, `en.ts` | Modify | `demo.*` keys both locales |
| `src/App.tsx` | Modify | Entry button + overlay mount + `onNavigate` wiring |
| `e2e/demo.spec.ts` | Create | 6-step evaluator path, deep-link, EN locale |
| `e2e/offline.spec.ts` | Create | Cold reload with the network down |
| `playwright.offline.config.ts` | Create | Build + preview webServer for the offline suite |
| `playwright.config.ts` | Modify | `testIgnore` the offline spec (needs a build) |
| `.github/workflows/ci.yml` | Modify | `offline` job: install Chromium + run `test:e2e:offline` |
