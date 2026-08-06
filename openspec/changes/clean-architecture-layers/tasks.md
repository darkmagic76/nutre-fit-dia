# Tasks: Clean Architecture Layered Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800–1200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (P1-2) → PR 2 (P3) → PR 3 (P4-6) |
| Chain strategy | feature-branch-chain |
| Tracker branch | `feature/clean-architecture-layers` |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

| Unit | Goal | PR | Base |
|------|------|----|------|
| 1 | Domain sanitization + reorganization (P1-2) | PR 1 | `develop` |
| 2 | Use case extraction (P3) | PR 2 | PR 1 |
| 3 | Ports, adapters, composition root, tests (P4-6) | PR 3 | PR 2 |

## Phase 1: Domain Sanitization

- [x] 1.1 [RED→GREEN] Move `shared/utils/enum.ts` → `domain/enum.ts`. Update `notification.ts`, `trafficLight.ts`, `foodCategory.ts`. Barrel re-export at `shared/utils/index.ts`.
- [x] 1.2 Remove `CATEGORY_DISPLAY_NAMES` from `domain/foodCategory.ts`. Fix `foodCategory.test.ts:19-20` + `rationValidator.test.ts:369` to use i18n.
- [x] 1.3 `pnpm test:run` green. `pnpm quality`.

## Phase 2: Reorganization

- [x] 2.1 Move `shared/domain/*` → `src/domain/`, `shared/constants/clinical.ts` → `domain/`, `shared/services/*` → `domain/`, `shared/nudge/cooldown*.ts` → `domain/`, `shared/utils/imc.ts` → `domain/`. Update barrel.
- [x] 2.2 Move `shared/stores/*` (5) + `features/recipe-engine/store/planStore.ts` → `infrastructure/stores/`. Move barrel + add `planStore` re-export. Update ALL consumer imports.
- [x] 2.3 Move `shared/nudge/rules.ts` → `infrastructure/nudge/rules.ts`. Update clinical imports to `@domain/clinical`.
- [x] 2.4 `pnpm test:run` green. `pnpm quality`.

## Phase 3: Use Case Extraction

- [x] 3.1 [RED→GREEN] Extract `trackerStore.ts:103-196` → `application/use-cases/calculateTarget.ts`. Accepts `ProfileInput`, `BiomarkerRepository`, `translate`. Store delegates via container.
- [x] 3.2 [RED→GREEN] Extract `useExportData.ts:29-62` → `application/use-cases/exportData.ts`. Accepts 6 ports. Hook becomes thin `container.exportData()` wrapper.
- [x] 3.3 Split `engine.ts`: `buildNudgeContext` → `domain/nudgeContextBuilder.ts`, `evaluateRules` → `domain/nudgeEvaluator.ts`, `evaluateAndEnqueue` → `application/use-cases/evaluateNudges.ts`. Split types → `application/dtos/`.
- [x] 3.4 `pnpm test:run` green. `pnpm quality`.

## Phase 4: Ports & Adapters

- [ ] 4.1 Create `application/ports/{notification,activity,log,biomarker,plan}Repository.ts` — pure interfaces. Create `application/dtos/{ProfileInput,CaloricTargetOutput,ContextInput,NudgeTypes}.ts`.
- [ ] 4.2 Create `infrastructure/adapters/zustand{Notification,Activity,Log,Biomarker,Plan}Repository.ts` — thin `getState()` wrappers. Zero new logic.
- [ ] 4.3 `pnpm test:run` green. `pnpm quality`.

## Phase 5: Composition Root

- [x] 5.1 Add `@domain/*`, `@application/*` aliases to `tsconfig.app.json` + `vite.config.ts`.
- [ ] 5.2 Create `infrastructure/compositionRoot.ts`: factory wires 5 adapters → 3 use cases. Export `container` singleton. Update `main.tsx`.
- [ ] 5.3 `pnpm test:run` green. `pnpm build`.

## Phase 6: Testing & Cleanup

- [ ] 6.1 In-memory fake tests for `calculateTarget`, `evaluateNudges`, `exportData` — zero jsdom, zero Zustand.
- [ ] 6.2 Contract tests: assign each adapter to port-typed variable → TS acceptance.
- [ ] 6.3 Update store test imports: `@shared/stores` → `@infrastructure/stores`.
- [ ] 6.4 `pnpm verify`: 735 green, coverage ≥ 80%.
