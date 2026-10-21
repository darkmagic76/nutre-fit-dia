# Exploration: demo-reproducible-flow

## Current State

NutreFitDia is a React 19 + Zustand + Clean/Hexagonal SPA (pnpm, Vite, TS strict with
`erasableSyntaxOnly`, Vitest globals + jsdom, Playwright e2e, PWA offline). UI text is
Spanish via `I18nProvider` + `useT()` (`src/shared/i18n/es.ts|en.ts`); all code,
identifiers and comments are English.

**Setup / seed story (today — there is none):**
- No seed script, no demo-mode flag, no demo patient profile. First run = empty stores.
- Composition root `src/infrastructure/compositionRoot.ts` (`createContainer()` factory +
  `container` singleton) wires Zustand adapter repos → use cases (`calculateTarget`,
  `evaluateNudges`, `exportData`). `src/main.tsx` mounts
  `<ContainerProvider value={container}>` → `<I18nProvider>` → `<App/>`.
- DI rule: components use `useContainer()` (`src/shared/context/useContainer.ts`); direct
  `container` import is an anti-pattern (singleton only for provider + tests use
  `createContainer()` for isolation).
- Persistence: `src/infrastructure/storage.ts` `createPersistConfig(name, {sensitiveFields})`
  → AES-256-GCM via Web Crypto, key in IndexedDB, ciphertext in `localStorage` under
  `${VITE_STORAGE_PREFIX}-${name}`. Tests use `VITE_STORAGE_PREFIX=nutrefitdia` (vite.config.ts
  `test.env`), jsdom setup `src/test/setup.ts` shims localStorage + Web Crypto (XOR+checksum
  mock — tests depending on storage rely on that exact mock). No "reset demo" helper exists.
- Static clinical truth: `src/domain/clinical.ts` (thresholds AESAN/WHO/PREDIMED-Plus),
  `src/shared/data/foods.ts` + `foods-data` (39-food AESAN catalog), `src/domain/rationValidator.ts`
  (`validateRations`, `validateWeeklyRations`, `countRations`), `src/domain/sustainability/`
  (`scoringService`, `substitutionService.suggestAlternative` — LEGUMES + blue FISH ranked by
  env score, max 3 per `MAX_ALTERNATIVES_TO_SHOW`).
- Test fixtures `src/test/fixtures.ts` (`makeFood`, `makeEntries`, `makeCaloricTargetOutput`,
  `makeMetricsFormState` — female 70kg/165cm/45yo sedentary — `makeViolation`,
  `makeRationValidationResult`) are unit-test only, not wired to runtime seed.

**Demo-relevant flows (mapped to the 6 requested steps):**
1. `datos iniciales` — nothing preloaded; evaluator starts from zero.
2. `perfil de paciente` — `metabolic-tracker/MetabolicTrackerContainer.tsx` (uses
   `useContainer().calculateTarget`) → BMR/TDEE via Mifflin-St Jeor; e2e fills glucose=100,
   clicks Calcular, asserts BMR/TDEE.
3. `escaneo` — `nutritional-traffic-light/NutritionalTrafficLightContainer.tsx` +
   `services/classificationService.ts` (`classifyFood`, `classifyFoodWithReasons` → GREEN/ORANGE/RED).
   E2E canonical pins: `oil-aove` → status visible; `proc-refresco-cola` → RED/"evitar".
4. `recomendación` — `application/services/planGenerator.ts` (`generateWeeklyPlan`,
   `buildMealSlots`, `assignFoodsToMeals` → `pickSustainableFood` prefers non-processed,
   high-priority, high env score; `enforceAOVE`) consumed by
   `recipe-engine/RecipeEngineContainer.tsx` (`planRepository.generatePlan()`). E2E asserts
   "plan válido" + "Día 1".
5. `sustitución` — `domain/sustainability/substitutionService.ts` + `nudgeContextBuilder.ts`
   (M2 smart substitution: scanned food → `environmentalScore` + `alternatives: string[]|null`)
   surfaced via nudge-engine (`evaluateNudges`). Trigger gate: high-carbon/white-meat only,
   `LOW_ENVIRONMENTAL_SCORE_THRESHOLD=30`.
6. `validaciones esperadas` — `rationValidator` daily+weekly results rendered in plan/log views
   (`shared/ui/formatters/formatViolation.ts`); gates are `pnpm quality` (format→lint→typecheck→test)
   + `pnpm verify` (+build) + `pnpm test:e2e` (webServer auto-starts `pnpm dev` on :5173).
   Coverage thresholds: statements/branches/lines 80%, functions 100%.
- App shell `src/App.tsx`: 7 tabs (scanner/log/metabolic/plan/activity/nudges/sustainability),
  each tab lazy-mounts its Container inside `ErrorBoundary`. Tab nav via `useTabNavigation`.
- Docs linkage: `docs/slides/`, `README/SPECS_RF/SPECS_TECH/TASKS`, `openspec/specs/` (37 specs),
  `adr/` (11 ADRs) — no demo script references them today.

## Affected Areas

- `src/infrastructure/compositionRoot.ts` — seed injection point (new `seedDemoData()` use case
  or container method); must not break singleton/test isolation contract.
- `src/infrastructure/storage.ts` — needs deterministic reset/clear + re-seed (all
  `nutrefitdia-*` keys + IndexedDB key lifecycle); security-by-default must hold.
- `src/test/fixtures.ts` — promote/extend unit fixtures into a runtime demo dataset (demo patient,
  scan picks, expected validation outcomes); risk of coupling test mocks to prod seed.
- `src/features/*` (new `demo-*` or `demo-guide` feature?) — guided-steps UI; scope-rule decision:
  local vs shared.
- `src/shared/i18n/es.ts` + `en.ts` + `types.ts` — every visible demo string needs both locales.
- `e2e/smoke.spec.ts` (+ new `e2e/demo.spec.ts`?) — reproducible evaluator path; Playwright
  `webServer` already boots dev server.
- `src/domain/clinical.ts`, `src/shared/data/foods.ts`, `src/domain/rationValidator.ts`,
  `src/domain/sustainability/substitutionService.ts`, `src/application/services/planGenerator.ts`
  — read-only sources of truth the demo asserts against; demo must pin known-good ids
  (`oil-aove`, `proc-refresco-cola`) and expected outcomes, never fork thresholds.
- `docs/slides/` + `README.md` — evaluator script linkage (non-goal unless proposed).

## Approaches

1. **Seed-script + demo-mode flag + reset button** — a `seedDemo()` application service
   (deterministic demo patient + log entries + scan selection) triggered by `?demo=1` query
   param or a discreet "Cargar demo" button; plus "Restablecer" clearing prefixed localStorage
   keys and re-seeding. Docs give the 6-step script with expected assertions.
   - Pros: smallest diff; reuses composition root + fixtures; works offline/PWA; trivially
     resettable; e2e can `goto('/?demo=1')` and assert the full chain in seconds.
   - Cons: no hand-holding UI — evaluator still follows a doc; risk of demo flag leaking into
     prod UX; seed/reset must handle AES-GCM async encrypt correctly.
   - Effort: Low (1 focused feature + storage helpers + e2e test + docs page).

2. **Fixture-driven guided tour (demo-guide feature)** — new `features/demo-guide/` Container+View
   stepper (datos → perfil → escaneo → recomendación → sustitución → validaciones) driving the
   real containers via container ports, with checkmarks against expected values
   (e.g. "AOVE = GREEN", "cola = RED + 3 alternatives", "plan válido 7 días").
   - Pros: best evaluator experience ("value in minutes"); self-verifying — each step shows
     expected vs actual; reuses real flows so it doubles as living regression spec.
   - Cons: Medium complexity; new feature must respect container-presentational split,
     scope-rule (tour state local, seed service shared only if 2+ consumers), i18n for all
     steps, `erasableSyntaxOnly` (no enums); tab-navigation coupling (`useTabNavigation`)
     needs a clean contract (props/callbacks, not store imports).
   - Effort: Medium (new feature slices + seed service + i18n + e2e `demo.spec.ts`).

3. **Storybook-like demo harness (NOT recommended)** — isolated harness outside the app shell
   rendering each View with canned props.
   - Pros: zero risk to prod stores; fast visual review.
   - Cons: duplicates shell wiring, bypasses composition root/persistence/i18n providers,
     proves nothing about the real reproducible flow; new tooling (Storybook dep) contradicts
     minimal-toolchain discipline; High effort for Low evaluator value.
   - Effort: High.

### Recommendation

**Approach 1 now, designed to grow into Approach 2.** Ship the deterministic seed + reset
(`?demo=1` + button) with a docs script and an e2e `demo.spec.ts` asserting the 6 steps — this
alone delivers "reproducible in minutes". Structure the seed as an application service behind
a port (not a component hack) so a later `demo-guide` stepper can drive the same service
without rework. Explicitly reject Approach 3: it decouples the demo from the real wiring the
evaluator must trust.

Concretely: `application/services/seedDemoData.ts` (pure, port-injected) + container exposure
+ `shared/hooks/useDemoSeed.ts` (query-param + button) + `shared/ui` reset control +
`e2e/demo.spec.ts` mirroring the 6 steps with the already-pinned ids (`oil-aove`,
`proc-refresco-cola`, glucose=100 → BMR/TDEE, plan válido/Día 1, substitution alternatives,
violations=0). Keep tour UI out of v1 scope.

## Risks

- **Persistence reset vs encryption**: clearing `localStorage` without handling the IndexedDB
  AES key leaves orphaned/undecryptable state; reset must be atomic and tested under the jsdom
  crypto mock AND real Web Crypto.
- **Fixture/prod coupling**: promoting `src/test/fixtures.ts` into runtime seed risks test-mock
  leakage (XOR mock vs real AES-GCM); keep a separate `demoDataset.ts` built from the same
  domain factories, not from test doubles.
- **Demo flag leakage**: `?demo=1` auto-seed must never wipe a real user's log; gate on empty
  state or explicit confirm, and exclude from production deploy or hide behind dev-only UI.
- **Clinical truth drift**: demo pins expected outcomes (GREEN/RED, plan válido); any threshold
  change in `clinical.ts`/`rationValidator` silently breaks the script — demo e2e must assert
  against the same domain functions, not hardcoded strings alone.
- **Coverage gates**: new code must keep functions-coverage at 100%; seed/reset paths need unit
  tests, not just e2e.
- **i18n debt**: every demo string needs `es` + `en` keys; missing keys break the language-toggle
  e2e.

## Ready for Proposal

Yes — proceed to `sdd-propose`. Orchestrator should confirm with the user: (a) target evaluator
+ time-box (e.g. TFM tribunal, ≤5 min?), (b) whether guided-tour UI is v1 or v2, (c) reset
semantics (wipe-on-`?demo=1` vs explicit button only), (d) offline/PWA demo requirement,
(e) non-goals (slides update? production-visible demo entry?).

## Open Product Questions (for proposal)

1. Who is the evaluator and what is the time-box (tribunal ≤5 min? tutor walkthrough? async click-through)?
2. Is v1 "seed + script + e2e" enough, or must v1 include the on-screen guided stepper?
3. How should reset behave — auto-seed on `?demo=1` only when stores are empty, or always with confirm?
4. Must the demo work fully offline (PWA service worker) on a clean browser profile?
5. Non-goals: update `docs/slides/` + README demo section in this change, or separate docs change?

## DDD / Architecture Notes

- Ubiquitous language (do NOT rename): `classify` (escaneo), `generatePlan` (recomendación),
  `suggestAlternative/substitution` (sustitución), `validateRations/validateWeeklyRations`
  (validaciones), `seedDemo/resetDemo` (new, proposed). "Demo" ≠ "Fixture": fixture = test
  double; demo dataset = curated production-safe seed.
- Bounded contexts touched: Scanning (traffic-light), Logging (med-diet), Profiling (metabolic),
  Planning (recipe-engine), Nudging (substitution) — demo-guide would be a new upstream
  orchestrating context depending on all five via container ports (downstream of each).
- Pillars check: SRP (one `seedDemoData` service, one reason to change); OCP (extend via new
  dataset versions, not by editing validators); Domain Isolation (seed builds `Food`/ration
  domain objects, never touches Zustand directly — adapters do); Security by Default (reset
  preserves AES-GCM + IndexedDB invariants; never ships plaintext seed bypass).
- Scope-rule: seed service used by ≥2 consumers (button + e2e + future tour) → `application/`
  or `shared/`; tour stepper state used by 1 feature → local in `features/demo-guide/`.
