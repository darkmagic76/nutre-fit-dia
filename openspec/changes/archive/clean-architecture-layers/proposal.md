# Proposal: Clean Architecture Layered Refactor

## Intent

7 Clean Architecture violations (ADR-012): domain imports `shared/utils`, application imports Zustand stores, no ports or composition root, `CATEGORY_DISPLAY_NAMES` mixes UI in domain, `useExportData` violates Scope Rule. Layer into `domain/` → `application/` → `infrastructure/` via 6 phases, each leaving 735 tests green.

## Scope

### In Scope
- Domain sanitization: move `defineEnum` in, remove `CATEGORY_DISPLAY_NAMES`
- Reorganize ~45 files into `domain/`, `application/{ports,use-cases,dtos}`, `infrastructure/{stores,adapters}`
- Extract `calculateTarget` and `exportData` as pure use cases
- 4 repository port interfaces + Zustand adapters
- `infrastructure/compositionRoot.ts` wiring factory
- Test updates: in-memory fakes for use cases, contract tests for adapters

### Out of Scope
- Changing persistence backend, removing Zustand, full DI framework

## Capabilities

### New Capabilities
- **domain-purity**: domain/ imports only `zod`
- **application-ports**: `NotificationRepository`, `ActivityRepository`, `LogRepository`, `BiomarkerRepository`
- **application-use-cases**: `calculateTarget`, `evaluateNudges`, `exportData`
- **composition-root**: `createContainer()` factory
- **infrastructure-adapters**: Zustand-backed port impls
- **path-aliases**: `@domain/*`, `@application/*` in tsconfig + vite

### Modified Capabilities
- **shared-utils**: `enum.ts` → `domain/enum.ts`
- **food-category-display**: `CATEGORY_DISPLAY_NAMES` removed from domain
- **tracker-store**: `calculateTarget()` extracted to use case
- **nudge-engine**: `engine.ts` → `application/use-cases/evaluateNudges.ts`
- **store-architecture**: R2 `shared/stores/` → `infrastructure/stores/`; R3 extended to `application/`
- **data-export**: extracted to use case; Scope Rule violation fixed
- **clinical-thresholds**: → `domain/clinical.ts`
- **infrastructure-storage**: no behavioral change

## Approach

6-phase per ADR-012 §273. Deployable PRs, each passing `pnpm test:run`. Dependencies: `presentation → application → domain`. Infrastructure implements ports, wired in one factory.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/shared/domain/**` + `services/**` (14 files) | → `src/domain/` |
| `src/shared/stores/**` (5 files) | → `src/infrastructure/stores/` |
| `src/shared/{constants/clinical,utils/enum,nudge/engine}` (3) | → domain + application |
| `src/shared/hooks/useExportData.ts` | → `application/use-cases/exportData.ts` |
| `src/application/` | New — `ports/` (4), `use-cases/` (3), `dtos/` (3) |
| `src/infrastructure/{adapters/** (4),compositionRoot.ts}` | New |
| `vite.config.ts`, `tsconfig.app.json` | `@domain/*`, `@application/*` aliases |
| `src/main.tsx` | Calls `createContainer()` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Import breakage across ~45 files | High | Per-phase PRs; full test suite gate |
| `useExportData` Scope Rule violation | Medium | Phase 3.2 extracts use case; `planStore` stays in infra |
| Adapter contract mismatches | Low | Contract tests; same store internals |

## Rollback Plan

Per-phase `git revert`. Phase 1 atomic. Phases 2-6 independent — revert failing phase, no cascade.

## Dependencies

- 735 tests pass; coverage ≥80%; `pnpm verify` green before each phase

## Success Criteria

- [ ] Domain: zero imports of `shared/utils`, React, or Zustand
- [ ] Use cases accept ports as constructor params, not stores
- [ ] `createContainer()` wires everything; `application/` zero Zustand/Web API imports
- [ ] 735 tests pass; coverage unchanged
- [ ] `@domain/*`, `@application/*` aliases resolve
