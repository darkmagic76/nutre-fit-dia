# Design: Clean Architecture Layered Refactor

## Technical Approach

ADR-012's 6-phase plan transforms the current `shared/` monolith into `domain/` → `application/` → `infrastructure/` → `features/`. Each phase is a deployable PR preserving 735 green tests. Dependency rule: `presentation → application → domain`. Infrastructure implements ports, wired via `createContainer()` called once in `main.tsx`.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Zustand adapters (thin `getState()` wrappers) vs. rewrite stores as pure repositories | Rewriting = higher risk, no behavioral gain. Stores already tested | Thin adapters — zero store logic changes |
| `createContainer()` as React Context vs. module-level singleton | Context requires prop threading; singleton is simpler for Zustand | Module-level singleton exported from `compositionRoot.ts` |
| `planStore` → infrastructure vs. `PlanRepository` port | Port adds indirection for 2 consumers; moving file fixes Scope Rule immediately | Move `planStore` to `infrastructure/stores/`; keep barrel re-export in feature |
| `rationValidator` in domain vs. application | Pure computation (no ports, no state) = domain | `src/domain/rationValidator.ts` |
| `cooldownTracker` in domain vs. infrastructure | Pure class with injected ops (already DI) = domain | `src/domain/cooldownTracker.ts` |

## Layer Separation Contract

| Layer | Allowed imports | Forbidden |
|-------|----------------|-----------|
| `domain/` | `zod`, sibling domain modules | React, Zustand, Web APIs, `@shared/utils`, `@infrastructure/*` |
| `application/` | `domain/`, `application/ports/`, `zod` | Zustand, React, Web APIs, `@infrastructure/*`, `@features/*`, `@shared/*` (except i18n types) |
| `infrastructure/` | `domain/`, `application/ports/`, Zustand, React, Web APIs | Must NOT import `@features/*` (except stores it hosts) |
| `features/` | Everything via composition root or import | Must NOT import `application/use-cases` internals directly |

## File Migration Map

| Current Path | New Path | Action |
|-------------|----------|--------|
| `src/shared/domain/*` (14 files) | `src/domain/*` | Move |
| `src/shared/domain/index.ts` | `src/domain/index.ts` | Move + add re-exports for `clinical`, `imc`, `enum`, `services/*`, `cooldownTracker` |
| `src/shared/constants/clinical.ts` | `src/domain/clinical.ts` | Move |
| `src/shared/utils/enum.ts` | `src/domain/enum.ts` | Move |
| `src/shared/utils/imc.ts` | `src/domain/imc.ts` | Move |
| `src/shared/services/caloricTargetService.ts` | `src/domain/caloricTargetService.ts` | Move |
| `src/shared/services/profileService.ts` | `src/domain/profileService.ts` | Move |
| `src/shared/services/rationValidator.ts` | `src/domain/rationValidator.ts` | Move |
| `src/shared/services/biomarkerTypes.ts` | `src/domain/biomarkerTypes.ts` | Move |
| `src/shared/nudge/cooldownTracker.ts` | `src/domain/cooldownTracker.ts` | Move |
| `src/shared/nudge/cooldownDurations.ts` | `src/domain/cooldownDurations.ts` | Move |
| `src/shared/stores/trackerStore.ts` | `src/infrastructure/stores/trackerStore.ts` | Move |
| `src/shared/stores/logStore.ts` | `src/infrastructure/stores/logStore.ts` | Move |
| `src/shared/stores/nudgeStore.ts` | `src/infrastructure/stores/nudgeStore.ts` | Move |
| `src/shared/stores/biomarkerStore.ts` | `src/infrastructure/stores/biomarkerStore.ts` | Move |
| `src/shared/stores/activityStore.ts` | `src/infrastructure/stores/activityStore.ts` | Move |
| `src/features/recipe-engine/store/planStore.ts` | `src/infrastructure/stores/planStore.ts` | Move |
| `src/shared/nudge/types.ts` (ContextInput, NudgeContext from lines 15-78) | `src/application/dtos/ContextInput.ts` | Split |
| `src/shared/nudge/types.ts` (NudgeRule, SafetyRule, NudgeEvaluation) | `src/application/dtos/NudgeTypes.ts` | Split |
| `src/shared/nudge/engine.ts:26-75` (`buildNudgeContext`) | `src/domain/nudgeContextBuilder.ts` | Extract pure function |
| `src/shared/nudge/engine.ts:112-123` (`evaluateRules`) | `src/domain/nudgeEvaluator.ts` | Extract pure function |
| `src/shared/nudge/engine.ts:134-164` (`evaluateAndEnqueue`) | `src/application/use-cases/evaluateNudges.ts` | Extract use case |
| `src/shared/nudge/rules.ts` | `src/infrastructure/nudge/rules.ts` | Move (data, not logic) |
| `src/shared/hooks/useExportData.ts:29-62` | `src/application/use-cases/exportData.ts` | Extract use case |
| `src/shared/stores/trackerStore.ts:103-196` (`calculateTarget`) | `src/application/use-cases/calculateTarget.ts` | Extract use case |
| New | `src/application/ports/notificationRepository.ts` | Create (interface) |
| New | `src/application/ports/activityRepository.ts` | Create (interface) |
| New | `src/application/ports/logRepository.ts` | Create (interface) |
| New | `src/application/ports/biomarkerRepository.ts` | Create (interface) |
| New | `src/application/ports/planRepository.ts` | Create (interface) |
| New | `src/infrastructure/adapters/zustandNotificationRepository.ts` | Create |
| New | `src/infrastructure/adapters/zustandActivityRepository.ts` | Create |
| New | `src/infrastructure/adapters/zustandLogRepository.ts` | Create |
| New | `src/infrastructure/adapters/zustandBiomarkerRepository.ts` | Create |
| New | `src/infrastructure/adapters/zustandPlanRepository.ts` | Create |
| New | `src/infrastructure/compositionRoot.ts` | Create |
| `src/shared/utils/index.ts` | Keep as re-export barrel | Modify (delegate to `@domain`) |
| `src/shared/stores/index.ts` | `src/infrastructure/stores/index.ts` | Move + add `planStore` re-export |
| `src/shared/domain/foodCategory.ts` | `src/domain/foodCategory.ts` | Remove `CATEGORY_DISPLAY_NAMES` (lines 46-58) |

## Path Aliases

Add to BOTH `tsconfig.app.json` (paths) and `vite.config.ts` (resolve.alias):
```
"@domain/*": ["./src/domain/*"]
"@application/*": ["./src/application/*"]
```
Keep existing: `@/*`, `@features/*`, `@shared/*`, `@infrastructure/*`.

## Composition Root

```ts
// src/infrastructure/compositionRoot.ts
export function createContainer() {
  // 1. Adapters — thin Zustand wrappers implementing port interfaces
  const notificationRepo = createZustandNotificationRepository();
  const activityRepo = createZustandActivityRepository();
  const logRepo = createZustandLogRepository();
  const biomarkerRepo = createZustandBiomarkerRepository();
  const planRepo = createZustandPlanRepository();

  // 2. Use cases — receive ports, never import stores
  const calculateTarget = (input: ProfileInput, t: Translations) =>
    calculateTargetUseCase(input, biomarkerRepo, t);
  const evaluateNudges = (input: ContextInput) =>
    evaluateNudgesUseCase(input, NUDGE_RULES, notificationRepo, activityRepo, biomarkerRepo, logRepo);
  const exportData = () =>
    exportDataUseCase(trackerRepo, logRepo, notificationRepo, activityRepo, planRepo, biomarkerRepo);

  return { calculateTarget, evaluateNudges, exportData };
}

export const container = createContainer();
```

Called once in `main.tsx`. Features import `{ container }` from `@infrastructure/compositionRoot`.

## Scope Rule Fix: useExportData → planStore

`useExportData.ts` imports `usePlanStore` from `@features/recipe-engine/store/planStore` — violates Scope Rule (shared importing features). Solution: move `planStore.ts` to `infrastructure/stores/`. Keep barrel `src/features/recipe-engine/store/planStore.ts` as re-export for backward compat. `useExportData` becomes thin hook: `useExportData() { ... container.exportData() ... }`.

## Nudge Engine Migration

| Component | Current | Target | Rationale |
|-----------|---------|--------|-----------|
| `buildNudgeContext()` | `engine.ts:26-75` | `domain/nudgeContextBuilder.ts` | Pure function, zero stores — domain |
| `evaluateRules()` | `engine.ts:112-123` | `domain/nudgeEvaluator.ts` | Pure function, receives injected cooldown — domain |
| `evaluateAndEnqueue()` | `engine.ts:134-164` | `application/use-cases/evaluateNudges.ts` | Orchestrates via ports — application |
| `ContextInput`, `NudgeContext` | `types.ts:15-78` | `application/dtos/ContextInput.ts` | DTOs crossing application boundary |
| `NudgeRule`, `SafetyRule`, `NudgeEvaluation` | `types.ts` | `application/dtos/NudgeTypes.ts` | Rule contracts |
| `NUDGE_RULES` array | `rules.ts` | `infrastructure/nudge/rules.ts` | Data, imports clinical from domain |
| `CooldownTracker` class | `cooldownTracker.ts` | `domain/cooldownTracker.ts` | Pure class, DI ops — domain |
| `cooldownDurations` | `cooldownDurations.ts` | `domain/cooldownDurations.ts` | Constants — domain |

## Category Display Names Migration

`CATEGORY_DISPLAY_NAMES` in `foodCategory.ts` already `@deprecated`. All 11 `category.*` keys exist in i18n. Only 2 test files reference it: `foodCategory.test.ts` (line 19-20) and `rationValidator.test.ts` (line 369). Migration: delete `CATEGORY_DISPLAY_NAMES` export + its 2 test assertions. Update test that tests "raw category key fallback" to test via i18n instead.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Domain | `computeIMC`, `countRations`, `CooldownTracker`, `buildNudgeContext`, `evaluateRules`, `validateProfile` | Existing unit tests (move file + update import) |
| Application | `calculateTarget`, `evaluateNudges`, `exportData` | New unit tests with in-memory port fakes — no jsdom needed |
| Infrastructure adapters | All 5 `zustand*Repository` factories | New contract tests: assign to port-typed var, verify TypeScript satisfaction |
| Stores | Zustand stores (unchanged behavior) | Existing tests — update imports from `@shared/stores` to `@infrastructure/stores` |
| E2E | Full app behavior | No changes |

## Open Questions

- [ ] Should feature-level stores (`activityStore` has 1 consumer — `activity-tracker`) move to `infrastructure/stores/` anyway for consistency, or stay in feature directories per Scope Rule? (Proposal says move all; ADR-012 says 1-consumer stays. **Resolved: move all to infrastructure for consistency** per store-architecture spec R1)
- [ ] `useExportData` hook currently uses `useCallback` + `useState`. After extracting use case, should the hook be a React Context consumer or direct `container` import? (Design: direct `container` import — simpler, no Context re-render overhead)
