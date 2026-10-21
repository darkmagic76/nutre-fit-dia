# Proposal: Demo Reproducible Flow (demo-guide)

## Intent

TFM evaluators are async and self-serve with minutes of attention. Today first run is empty stores with no path to value, so evaluation stalls. This change ships a visible guided tour that lets an evaluator reach a valid plan plus expected validations in minutes, offline, loading their own data.

## Scope

### In Scope
- `features/demo-guide/` stepper: 6 steps (datos iniciales → perfil → escaneo → recomendación → sustitución → validaciones esperadas), Container+View split, tour state local.
- Visible entry (button/tab, self-discoverable); `?demo=1` secondary deep-link only.
- `seedDemo`/`resetDemo` application service behind container port; replay-from-scratch button; exit keeps loaded data; reset seeds ONLY when stores empty, else explicit confirm.
- Per-step rule-based checks: expected vs actual computed from domain truth (`classifyFood`, `validateRations`/`validateWeeklyRations`, `suggestAlternative`, plan válido) — never hardcoded strings alone; one optional worked hint (oil-aove GREEN / cola RED).
- i18n es+en for all tour strings; full offline PWA on clean profile.
- `e2e/demo.spec.ts` mirroring 6 steps + unit tests for seed/reset/checks.

### Out of Scope
- `docs/slides/` + README demo section (separate docs change).
- New clinical thresholds, foods, or plan algorithm changes.
- Storybook-like harness (rejected).

## Capabilities

### New Capabilities
- `demo-guide`: 6-step tour orchestration, entry/replay/exit, rule-based per-step checks.

### Modified Capabilities
- `infrastructure-storage`: atomic `resetDemo` (localStorage prefix keys + IndexedDB AES key lifecycle).
- `composition-root`: expose `seedDemo`/`resetDemo` behind port without breaking singleton/test isolation.

## Approach

Tour drives REAL containers via container ports (props/callbacks, no store imports). `demoDataset` (new, production-safe) stays separate from `src/test/fixtures.ts` test doubles. Seed builds domain objects; adapters persist. Tour rejected seed-only: async evaluator needs on-screen guidance, not a doc script.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/demo-guide/` | New | Stepper Container+View, local tour state |
| `src/application/services/seedDemoData.ts` | New | Port-injected `seedDemo`/`resetDemo` |
| `src/infrastructure/compositionRoot.ts` | Modified | Expose seed service |
| `src/infrastructure/storage.ts` | Modified | Atomic reset |
| `src/shared/i18n/` | Modified | es+en tour keys |
| `e2e/demo.spec.ts` | New | 6-step evaluator path |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Demo flag wipes real data | Med | Seed only when empty; confirm otherwise |
| Reset orphans AES key | Med | Atomic reset incl. IndexedDB key; test w/ mock + real crypto |
| Fixture/prod coupling | Med | Separate `demoDataset` from test doubles |
| Clinical drift breaks checks | Med | Assert via domain functions, not strings |
| Coverage gate (functions 100%) | Low | Unit tests for seed/reset/checks |
| i18n debt | Low | Both locales required per string |
| Tab-nav coupling | Low | Props/callbacks only |

## Rollback Plan

Remove `demo-guide` route/entry + container seed exposure; prefixed-key reset leaves other data untouched. No domain/threshold changes to revert.

## Dependencies

- None. Read-only use of `clinical.ts`, `foods.ts`, `rationValidator`, `substitutionService`, `planGenerator`.

## Success Criteria

- [ ] Evaluator completes 6 steps alone in minutes, offline, clean profile.
- [ ] Each step shows expected vs actual from domain truth; drift breaks e2e, not silently.
- [ ] Replay resets from scratch; exit preserves data; never wipes non-empty stores unconfirmed.
- [ ] `pnpm quality` + `verify` + `test:e2e` green; functions coverage 100%.
