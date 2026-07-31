# Tasks: Fix Audit Findings

> **Artifact store**: OpenSpec + Engram (hybrid)
> **Delivery strategy**: `ask-always`
> **Chain strategy**: `stacked-to-main`
> **Review budget**: 400 lines

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 (P1: ~120 lines) → PR2 (P2: ~200 lines) → PR3 (P3: ~250 lines) → PR4 (P4: ~60 lines) |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | planStore move + encryption | PR 1 | Base: main. Barrel re-export preserves git blame. |
| 2 | CSP headers + profileService + t prop | PR 2 | Stacks on PR 1. 7 View props changes. |
| 3 | Tests, renames, i18n, code smells | PR 3 | Stacks on PR 2. Med-risk: view renames touch files across features. |
| 4 | Docs + value wrappers + rename | PR 4 | Stacks on PR 3. Low-risk cleanup. |

---

## Phase 1 — CRITICAL (P1)

### P1.1 — Move planStore to shared/stores/

- [x] **P1.1.1** Move `src/features/recipe-engine/planStore.ts` → `src/shared/stores/planStore.ts`
- [x] **P1.1.2** Move `src/features/recipe-engine/planStore.test.ts` → `src/shared/stores/planStore.test.ts`
- [x] **P1.1.3** Create barrel re-export at `src/features/recipe-engine/planStore.ts` → `export { usePlanStore } from '@shared/stores/planStore'`
- [x] **P1.1.4** Update `src/shared/hooks/useExportData.ts` import: `@features/recipe-engine/planStore` → `@shared/stores/planStore`
- [x] **P1.1.5** Update `src/shared/hooks/useExportData.test.ts` import accordingly
- [x] **P1.1.6** Update `src/features/recipe-engine/RecipeEngineContainer.tsx` import → `@shared/stores/planStore`
- [x] **P1.1.7** Run `pnpm typecheck && pnpm test:run` — all 680 tests must pass

**Specs**: store-architecture ADDED R1-R4, MODIFIED R1-R4; data-export MODIFIED R1-R2
**Effort**: M
**Deps**: None (foundational)
**Verification**: `pnpm quality` green, zero `from.*@features` imports in `src/shared/`

### P1.2 — Replace hardcoded encryption key

- [x] **P1.2.1** TDD RED: Write tests for `generateStorageKey()`, `getOrCreateKey()`, `encryptWithKey()`, `decryptWithKey()`
- [x] **P1.2.2** GREEN: Implement `src/infrastructure/storage.ts` with `crypto.subtle.generateKey()` + IndexedDB key store
- [x] **P1.2.3** Implement old-key fallback: try decrypt with old `KEY_MATERIAL` → re-encrypt with new key → delete old localStorage
- [x] **P1.2.4** Add IndexedDB unavailable fallback: session-only key (in-memory, warn user)
- [x] **P1.2.5** Update all store `createPersistConfig` calls to use new `getOrCreateKey()` infrastructure
- [x] **P1.2.6** Run `pnpm test:run` — verify encryption tests pass + all 680 existing tests green

**Specs**: infrastructure-storage ADDED R1-R4, MODIFIED R2-R3
**Effort**: L
**Deps**: P1.1 (planStore already in shared, no other blockers)
**Verification**: Zero `KEY_MATERIAL` in source; roundtrip encrypt/decrypt passes; old-format data throws clear migration error

---

## Phase 2 — HIGH (P2)

### P2.1 — Add CSP + security headers

- [ ] **P2.1.1** Add `server.headers` in `vite.config.ts` with dev-mode relaxed CSP (allows HMR WebSocket)
- [ ] **P2.1.2** Create `public/_headers` with production CSP + `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] **P2.1.3** Verify CSP does NOT block service worker registration, PWA manifest fetch, or Vite HMR
- [ ] **P2.1.4** Run `pnpm build` — verify `dist/_headers` exists with all four headers

**Specs**: content-security-policy R1-R7
**Effort**: S
**Deps**: None (independent of other phases)
**Verification**: `pnpm build` outputs `_headers`; dev `pnpm run dev` allows HMR

### P2.2 — Extract profileService

- [ ] **P2.2.1** TDD RED: Write tests for `computeIMC`, `validateProfile`, `buildProfile`
- [ ] **P2.2.2** GREEN: Create `src/shared/services/profileService.ts` — pure functions, zero framework imports
- [ ] **P2.2.3** REFACTOR: Update `trackerStore.ts` to delegate to profileService; remove inline IMC and validation
- [ ] **P2.2.4** Run `pnpm test:run` — profileService tests + trackerStore regression must pass

**Specs**: profile-service R1-R6; tracker-store ADDED requirement (domain delegation, i18n errors)
**Effort**: M
**Deps**: None (pure functions, no store coupling)
**Verification**: Zero `zustand`/`react` imports in profileService; trackerStore tests still green

### P2.3 — Pass `t` as prop to 7 Views

- [ ] **P2.3.1** Update each View props interface: add `translate: Translations` (typed `TFunction`)
- [ ] **P2.3.2** Switch View internals: `const t = useT()` → use `translate` prop for all i18n lookups
- [ ] **P2.3.3** Update each Container: call `useT()`, pass `translate={t}` to its child View
- [ ] **P2.3.4** Update all View test files: provide `translate={mockTranslations}` in render
- [ ] **P2.3.5** Run `pnpm typecheck && pnpm test:run` — zero `useT()` imports in View files

**7 Views**: ActivityTrackerView, DailyLogView, MetabolicTrackerView, NudgePanelView, ScannerView, PlanView, SustainabilityView
**Effort**: L
**Deps**: None (self-contained refactor)
**Verification**: `grep -r "useT" src/features/*/components/*View.tsx` returns empty

---

## Phase 3 — MEDIUM (P3)

### P3.1 — Add 4 missing test files (TDD)

- [ ] **P3.1.1** RED: `src/features/activity-tracker/ActivityTrackerContainer.test.tsx`
- [ ] **P3.1.2** RED: `src/features/activity-tracker/ActivityTrackerView.test.tsx`
- [ ] **P3.1.3** RED: `src/features/nudge-engine/NudgeEngineContainer.test.tsx`
- [ ] **P3.1.4** RED: `src/features/sustainability/SustainabilityView.test.tsx`
- [ ] **P3.1.5** GREEN + REFACTOR: Write minimal impl if tests reveal bugs; prefer getByRole/getByText

**Effort**: L
**Deps**: P2.3 (Views now receive `translate` prop — must be reflected in test fixtures)
**Verification**: 4 new test files pass; AAA pattern used

### P3.2 — Replace getByTestId with accessible queries

- [ ] **P3.2.1** `ErrorBoundary.test.tsx`: 9× `getByTestId` → `getByRole('alert')`, `getByText()`, `getByRole('button')`
- [ ] **P3.2.2** `InstallPrompt.test.tsx`: 4× `getByTestId` → `getByRole('button')`, `getByText()`

**Effort**: XS
**Deps**: None
**Verification**: Zero `getByTestId` in ErrorBoundary/InstallPrompt tests; equivalent assertions preserved

### P3.3 — Rename 4 Views

- [ ] **P3.3.1** `git mv DailyLogView.tsx MedDietValidatorView.tsx` + update container import + test file + barrel
- [ ] **P3.3.2** `git mv ScannerView.tsx NutritionalTrafficLightView.tsx` + updates
- [ ] **P3.3.3** `git mv NudgePanelView.tsx NudgeEngineView.tsx` + updates
- [ ] **P3.3.4** `git mv PlanView.tsx RecipeEngineView.tsx` + updates

**Effort**: M
**Deps**: P2.3 (Views already receiving `translate` prop — rename after stable interface)
**Verification**: `pnpm typecheck` green; `git log --follow` preserves history on renamed files

### P3.4 — Spanish errors → i18n

- [ ] **P3.4.1** Add 5 error keys to `es.ts`: `errors.invalidGender`, `errors.diagnosisAgeExceedsCurrentAge`, `errors.glucoseRequiredForMetabolicProfile`, `errors.imcThresholdCrossedUp`, `errors.imcThresholdCrossedDown`
- [ ] **P3.4.2** Add 5 error keys to `en.ts` (English translations)
- [ ] **P3.4.3** Update `trackerStore.ts`: replace hardcoded Spanish strings with i18n key lookups

**Effort**: S
**Deps**: P2.2 (trackerStore already delegates to profileService; i18n cleanup follows)
**Verification**: Zero hardcoded Spanish strings in trackerStore; `grep -r "Error al" src/shared/stores/` empty

### P3.5 — Code smell refactors

- [ ] **P3.5.1** Split `buildDailyTemplate` → `buildMealSlots`, `assignFoodsToMeals`, `enforceAOVE`
- [ ] **P3.5.2** Split `generateWeeklyPlan` → `initializeWeekPlan`, `buildDayPlan`
- [ ] **P3.5.3** Extract `CulturalBadges.tsx` + `ZeroWasteBadges.tsx` to `recipe-engine/components/`

**Effort**: M
**Deps**: P3.3 (PlanView already renamed to RecipeEngineView)
**Verification**: `pnpm test:run` green; no method exceeds 30 lines

---

## Phase 4 — LOW (P4)

### P4.1 — Document "validation" polysemy

- [ ] **P4.1.1** Add doc comment in `rationValidator.ts`: explains validation as ration-rule checks
- [ ] **P4.1.2** Add doc comment in `domain/errors.ts`: explains `ValidationError` as form/domain validation
- [ ] **P4.1.3** Add doc comment in `DailyViolations.tsx`: explains UI-level violation display

**Effort**: XS
**Deps**: None
**Verification**: Comments present in all 3 files

### P4.2 — Primitive Obsession value wrappers

- [ ] **P4.2.1** Create `ModerateMinutes` value wrapper in `activity-tracker` feature
- [ ] **P4.2.2** Create `GlucoseInput` value wrapper in `metabolic-tracker` feature

**Effort**: S
**Deps**: None
**Verification**: TypeScript enforces wrapper types at boundaries

### P4.3 — Rename emptyCounts

- [ ] **P4.3.1** Rename `emptyCounts` → `defaultRationCounts` in `rationValidator.ts` + all references in `planGenerator.ts`

**Effort**: XS
**Deps**: P3.5 (planGenerator already refactored)
**Verification**: Zero occurrences of `emptyCounts` in codebase; `pnpm typecheck` green

---

## Verification Summary

| Phase | Command | Expected |
|-------|---------|----------|
| P1 | `pnpm quality` | 0 failures, 680+ tests green, zero `from.*@features` in `src/shared/` |
| P2 | `pnpm quality` + `pnpm build` | All green, CSP headers in `dist/_headers`, zero `useT()` in Views |
| P3 | `pnpm quality` | 4 new test files pass, zero `getByTestId` in ErrorBoundary/InstallPrompt, zero `emptyCounts` |
| P4 | `pnpm quality` | All green, docs present, `ModerateMinutes`/`GlucoseInput` typed wrappers exist |
| All | `pnpm verify` | build + typecheck + lint + test:run: all green, 684+ tests pass |

## Dependencies Graph

```
P1.1 (planStore move)
  ├── P1.2 (encryption) — no dep on P1.1
  └── P3 tasks — depend on stable shared store

P2.1 (CSP) — independent
P2.2 (profileService) — independent
P2.3 (t prop) — independent

P3.1 (new tests) — depends on P2.3 (Views have translate prop)
P3.2 (getByTestId) — independent
P3.3 (renames) — depends on P2.3 (stable View interface)
P3.4 (i18n) — depends on P2.2 (trackerStore already refactored)
P3.5 (code smells) — depends on P3.3 (PlanView renamed)

P4.1 (polysemy docs) — independent
P4.2 (value wrappers) — independent
P4.3 (rename emptyCounts) — depends on P3.5 (planGenerator refactored)
```
