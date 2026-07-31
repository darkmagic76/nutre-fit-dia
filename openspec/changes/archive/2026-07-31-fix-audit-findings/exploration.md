# Exploration: Full Audit — 8-Skill Cross-Reference

> **Date**: 2026-07-31  
> **Scope**: Complete codebase audit mapped to all 8 skills in `skills/`
> **Status**: Findings only — no solutions proposed

---

## Current State

The project applies Screaming Architecture with 7 feature directories, shared utilities in `shared/`, and cross-cutting infrastructure in `infrastructure/`. A previous audit (2026-07-31) found quality issues. This exploration maps EVERY finding to the specific skill rule it violates.

**Test stats**: 66 test files, ~680 unit tests, Playwright E2E  
**Stack**: React 19.2.7, TypeScript 6.0.2, Vite 8.1.1, Tailwind 4.3.2, Zod 4.4.3, Zustand 5.0.8

---

## Affected Areas (Full Map)

| Area | What's affected | Skills triggered |
|------|----------------|-----------------|
| `src/shared/hooks/useExportData.ts` | Scope Rule violation | scope-rule |
| `src/features/*/View.tsx` files (7) | useT() in View = hook in presentational | container-presentational, work-methodology |
| `src/features/*/Container.tsx` (2 missing tests) | Missing test coverage | tdd-strict |
| `src/features/*/View.tsx` (3 missing tests) | Missing test coverage | tdd-strict |
| `src/shared/ui/ErrorBoundary.test.tsx` | 9× getByTestId | tdd-strict, work-methodology |
| `src/shared/ui/InstallPrompt.test.tsx` | 4× getByTestId | tdd-strict, work-methodology |
| `src/infrastructure/storage.ts` | Hardcoded encryption key material | architecture-decisions (SecByDesign), OWASP |
| `src/infrastructure/env.ts` | Missing CSP headers in Vite config | architecture-decisions (SecByDesign), OWASP |
| `src/shared/stores/trackerStore.ts` (222 lines) | Mixed concerns (domain + persistence + state) | architecture-decisions (SRP), code-smells |
| `src/shared/services/rationValidator.ts` (306 lines) | Large file, mixed responsibilities | code-smells |
| `src/features/recipe-engine/services/planGenerator.ts` (289 lines) | Long functions, large file | code-smells |
| `src/features/recipe-engine/PlanView.tsx` (241 lines) | Inline sub-components, business logic in View | container-presentational, code-smells |
| `src/features/recipe-engine/PlanView.tsx` | Naming mismatch: PlanView ≠ RecipeEngineView | container-presentational, scope-rule (screaming) |
| `src/features/med-diet-validator/DailyLogView.tsx` | Naming mismatch: DailyLogView ≠ MedDietValidatorView | container-presentational, scope-rule (screaming) |
| `src/features/nutritional-traffic-light/ScannerView.tsx` | Naming mismatch: ScannerView ≠ NutritionalTrafficLightView | container-presentational, scope-rule (screaming) |
| `src/features/nudge-engine/NudgePanelView.tsx` | Naming mismatch: NudgePanelView ≠ NudgeEngineView | container-presentational, scope-rule (screaming) |
| `src/shared/stores/trackerStore.ts` | Spanish error messages inline (not in i18n) | work-methodology |
| `src/shared/domain/` | No framework imports (clean) — no violation | architecture-decisions (Domain Isolation) |

---

## Findings Grouped by Skill

### 1. `skills/scope-rule.md` — Scope Rule

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| SR-1 | `src/shared/hooks/useExportData.ts` | 6 | `shared/` imports from `@features/recipe-engine/planStore` — **shared must NEVER depend on features** | **CRITICAL** |
| SR-2 | `src/features/med-diet-validator/DailyLogView.tsx` | — | View component name (`DailyLogView`) doesn't match feature name (`med-diet-validator`) → should be `MedDietValidatorView` | MEDIUM |
| SR-3 | `src/features/nutritional-traffic-light/ScannerView.tsx` | — | View component name (`ScannerView`) doesn't match feature name (`nutritional-traffic-light`) → should be `NutritionalTrafficLightView` | MEDIUM |
| SR-4 | `src/features/nudge-engine/NudgePanelView.tsx` | — | View component name (`NudgePanelView`) doesn't match feature name (`nudge-engine`) → should be `NudgeEngineView` | MEDIUM |
| SR-5 | `src/features/recipe-engine/PlanView.tsx` | — | View component name (`PlanView`) doesn't match feature name (`recipe-engine`) → should be `RecipeEngineView` | MEDIUM |

**Rule cited**: "Scope determines structure" / "Los componentes Container deben tener el mismo nombre que su feature"

---

### 2. `skills/container-presentational.md` — Container/Presentational Pattern

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| CP-1 | ALL 7 View files (see below) | multiple | `useT()` called inside View components — Views are presentational and SHOULD NOT access hooks/stores directly. `t` should be passed as a prop. | **HIGH** |
| CP-2 | `src/features/recipe-engine/PlanView.tsx` | 9-13, 38-76, 86-101 | Inline business logic (`computeMealKcal`) and sub-components (`CulturalBadges`, `ZeroWasteBadges`) — should be extracted to `components/` | MEDIUM |
| CP-3 | `src/features/activity-tracker/ActivityTrackerContainer.tsx` | — | No test file for Container | MEDIUM |
| CP-4 | `src/features/activity-tracker/ActivityTrackerView.tsx` | — | No test file for View | MEDIUM |
| CP-5 | `src/features/nudge-engine/NudgeEngineContainer.tsx` | — | No test file for Container | MEDIUM |
| CP-6 | `src/features/sustainability/SustainabilityView.tsx` | — | No test file for View | MEDIUM |

**View files using `useT()` (violating CP-1):**

| View File | Lines |
|-----------|-------|
| `src/features/activity-tracker/ActivityTrackerView.tsx` | 1, 28 |
| `src/features/med-diet-validator/DailyLogView.tsx` | 8, 25 |
| `src/features/metabolic-tracker/MetabolicTrackerView.tsx` | 1, 26 |
| `src/features/nudge-engine/NudgePanelView.tsx` | 1, 26 |
| `src/features/nutritional-traffic-light/ScannerView.tsx` | 7, 40 |
| `src/features/recipe-engine/PlanView.tsx` | 1, 39, 110 |
| `src/features/sustainability/SustainabilityView.tsx` | 3, 11 |

**Rule cited**: "Presentational: componentes puros de UI que reciben props. NO acceden a stores ni servicios."

---

### 3. `skills/tdd-strict.md` — TDD Estricto

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| TD-1 | `src/shared/ui/ErrorBoundary.test.tsx` | 95, 128, 173, 218, 242, 260, 278, 296, 440 | 9× uses `getByTestId` instead of accessible queries (`getByRole`, `getByText`, etc.) | MEDIUM |
| TD-2 | `src/shared/ui/InstallPrompt.test.tsx` | 111, 112, 113, 128 | 4× uses `getByTestId` instead of accessible queries | MEDIUM |
| TD-3 | `src/features/activity-tracker/ActivityTrackerContainer.tsx` | — | No test file (RED → GREEN cycle incomplete) | MEDIUM |
| TD-4 | `src/features/activity-tracker/ActivityTrackerView.tsx` | — | No test file | MEDIUM |
| TD-5 | `src/features/nudge-engine/NudgeEngineContainer.tsx` | — | No test file | MEDIUM |
| TD-6 | `src/features/sustainability/SustainabilityView.tsx` | — | No test file | MEDIUM |

**Rule cited**: "`getByRole` > `getByTestId` (Testing Library)"

---

### 4. `skills/architecture-decisions.md` — Architecture Decisions (4 Pillars)

#### 4a. Security by Design / Security by Default

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| AD-S1 | `src/infrastructure/storage.ts` | 4 | **Hardcoded encryption key**: `KEY_MATERIAL = new TextEncoder().encode('nutre-fit-dia-storage-encryption-v1')` — key material is a compile-time constant, defeating the purpose of encryption. Anyone with the source code can decrypt sensitive user data (weight, health metrics). Violates Security by Design and Defense in Depth. | **CRITICAL** |
| AD-S2 | `vite.config.ts` | — | **Missing CSP headers**: No Content-Security-Policy configured. The PWA serves without script-src or other CSP directives. | **HIGH** |
| AD-S3 | `src/infrastructure/env.ts` | 3-7 | Zod schema validates env vars ✓ — no violation | ✅ OK |

#### 4b. SRP + Modularidad (OCP)

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| AD-SRP1 | `src/shared/stores/trackerStore.ts` | 1-222 | **Mixed concerns**: Zustand store contains domain logic (`computeIMC`, `computeCaloricTarget`), data persistence (via `createPersistConfig` with Zod rehydration), validation (`ValidationError` generation), and biomarker recording. Multiple reasons to change. | **HIGH** |
| AD-SRP2 | `src/shared/services/rationValidator.ts` | 1-306 | **Large module with mixed data + logic**: `RATION_LIMITS` data definition, validation functions, and count utilities all in one file. | MEDIUM |
| AD-SRP3 | `src/features/recipe-engine/services/planGenerator.ts` | 1-289 | **Mixed responsibilities**: template building, food selection (with sustainability scoring), AOVE enforcement, and weekly plan generation in one module. | MEDIUM |

#### 4c. Domain Isolation

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| AD-DI1 | `src/shared/domain/` | — | **Clean**: No React, Zustand, or framework imports found in domain files. Domain types use only Zod and internal utils. | ✅ OK |
| AD-DI2 | `src/shared/domain/food.ts` | 1 | Imports `z` from zod — acceptable (Zod is a validation library, not a framework) | ✅ OK |

#### 4d. Ubiquitous Language

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| AD-UL1 | `src/shared/domain/sugarAliases.ts` | 7-26 | Spanish terms in domain code (`'azúcar'`, `'sacarosa'`, `'jarabe'`, etc.) — these are domain terms for food ingredients, but language mixing could cause confusion. Acceptable as domain data. | LOW |
| AD-UL2 | `src/shared/services/rationValidator.ts` | 107 | `emptyCounts()` — technical name, not domain language. Domain would say `defaultRationCounts` or similar. | LOW |

---

### 5. `skills/code-smells.md` — Code Smells

#### Structural

| # | File | Details | Smell | Severity |
|---|------|---------|-------|----------|
| CS-S1 | `src/features/recipe-engine/services/planGenerator.ts` | `buildDailyTemplate()` ~68 lines | **Long Method** (>20) | MEDIUM |
| CS-S2 | `src/features/recipe-engine/services/planGenerator.ts` | `generateWeeklyPlan()` ~50 lines | **Long Method** (>20) | MEDIUM |
| CS-S3 | `src/features/recipe-engine/PlanView.tsx` | `CulturalBadges` inline ~45 lines | **Long Method** + inline component | MEDIUM |
| CS-S4 | `src/features/recipe-engine/services/planGenerator.ts` | 289 lines total | **Large Class / Long File** | MEDIUM |
| CS-S5 | `src/shared/services/rationValidator.ts` | 306 lines total | **Large Class / Long File** | MEDIUM |
| CS-S6 | `src/shared/stores/trackerStore.ts` | 222 lines total | **Large Class / Long File** | MEDIUM |
| CS-S7 | `src/features/recipe-engine/PlanView.test.tsx` | 510 lines total | **Large Test File** — suggests too many test cases per SUT | LOW |

#### Behavioral

| # | File | Details | Smell | Severity |
|---|------|---------|-------|----------|
| CS-B1 | `src/shared/services/rationValidator.ts` | `checkCategoryLimits()` with complex if/else chain | **Long Method** — could use strategy pattern per category | LOW |
| CS-B2 | `src/features/nudge-engine/engine.test.ts` | Large context object repeated 6+ times (NudgeContext with 20+ fields) | **Data Clump** — NudgeContext construction repeated verbatim across tests | LOW |

#### Data

| # | File | Details | Smell | Severity |
|---|------|---------|-------|----------|
| CS-D1 | `src/features/activity-tracker/ActivityTrackerContainer.tsx` | `const mm = Number(minutes) \|\| 0` — raw DOM string to number | **Primitive Obsession** — no value object for `ModerateMinutes` | LOW |
| CS-D2 | `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` | `canCalculate = glucose.trim().length > 0` | **Primitive Obsession** | LOW |

---

### 6. `skills/ddd-analysis.md` — DDD Analysis

| # | Area | Finding | Severity |
|---|------|---------|----------|
| DDD-1 | Bounded Contexts | 7 features (activity-tracker, med-diet-validator, metabolic-tracker, nudge-engine, nutritional-traffic-light, recipe-engine, sustainability) — map cleanly to bounded contexts. No overlap detected. | ✅ OK |
| DDD-2 | Polysemia: "validation" | Used in `rationValidator.ts` (ration limits), `ValidationError` (profile/form errors), and `DailyViolations` (UI) — 3 meanings for "validation" | MEDIUM |
| DDD-3 | Polysemia: "classification" | `classificationService.ts` (traffic light) — only one usage context found | ✅ OK |
| DDD-4 | Ubiquitous Language | Domain names match domain concepts: `classifyFood`, `evaluateRules`, `FoodCategory`, `TrafficLightColor`. Consistent across files. | ✅ OK |

---

### 7. `skills/work-methodology.md` — Work Methodology

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| WM-1 | `src/shared/ui/ErrorBoundary.test.tsx` | Multiple | `getByTestId` used instead of accessible queries | MEDIUM |
| WM-2 | `src/shared/ui/InstallPrompt.test.tsx` | Multiple | `getByTestId` used instead of accessible queries | MEDIUM |
| WM-3 | `src/shared/stores/trackerStore.ts` | 123-124, 134-136, 144-145, 167-170 | Spanish error messages hardcoded inline instead of in i18n files (`Error al procesar:`, `La edad de diagnóstico no puede ser mayor...`, `La glucosa debe ser un valor positivo...`, `IMC ha superado 25...`) | MEDIUM |
| WM-4 | `tsconfig.app.json` | 20 | `"strict": true` — TypeScript strict mode enabled ✓ | ✅ OK |
| WM-5 | `package.json` | 24-25 | `pnpm quality` and `pnpm verify` scripts exist ✓ | ✅ OK |

---

### 8. OWASP 2025 (Cross-Cutting)

| # | File | Line | Violation | Severity |
|---|------|------|-----------|----------|
| OW-1 | `src/infrastructure/storage.ts` | 4 | **Hardcoded encryption key** — see AD-S1. Sensitive health data (weight, glucose, age) encrypted with a compile-time constant. Anyone who reads the source can derive the AES key. | **CRITICAL** |
| OW-2 | `vite.config.ts` | — | **Missing CSP headers** — see AD-S2. No Content-Security-Policy configured, increasing XSS risk surface. | **HIGH** |
| OW-3 | Entire codebase | — | No `eval()`, `dangerouslySetInnerHTML`, or `document.write` found ✓ | ✅ OK |
| OW-4 | Domain models | — | Zod validation used throughout domain models ✓ | ✅ OK |
| OW-5 | `src/infrastructure/env.ts` | 11-15 | Zod validates environment variables ✓ | ✅ OK |
| OW-6 | `.env.example` | — | No secrets committed ✓ | ✅ OK |

---

## Priority Recommendations

| Priority | Finding | Skills | Rationale |
|----------|---------|--------|-----------|
| **CRITICAL** | SR-1: Shared → Feature import | scope-rule | Violates the fundamental architectural principle. Shared must never depend on features. |
| **CRITICAL** | AD-S1 / OW-1: Hardcoded encryption key | architecture-decisions, OWASP | Sensitive health data (weight, glucose, age) protected by trivially derivable key. PII/health data exposure risk. |
| **HIGH** | AD-S2 / OW-2: Missing CSP | architecture-decisions, OWASP | No XSS protection at HTTP header level for PWA. |
| **HIGH** | CP-1: useT() in all 7 Views | container-presentational | Systemic pattern violation affecting every feature. |
| **HIGH** | AD-SRP1: trackerStore mixed concerns | architecture-decisions | 3+ reasons to change in one module. |
| **MEDIUM** | TD-1/TD-2: getByTestId usage | tdd-strict, work-methodology | Testing maintainability and accessibility. |
| **MEDIUM** | TD-3 through TD-6: Missing tests | tdd-strict | Gaps in test coverage for 4 components. |
| **MEDIUM** | SR-2 through SR-5: View naming mismatch | scope-rule, container-presentational | Screaming Architecture — View names don't scream the feature. |
| **MEDIUM** | WM-3: Spanish errors inline | work-methodology | i18n bypass — errors won't translate when locale switches. |
| **MEDIUM** | CS-S1 through CS-S7: Code smells | code-smells | Long methods, large files reduce maintainability. |
| **LOW** | DDD-2: "validation" polysemy | ddd-analysis | Three meanings could cause confusion in future work. |

---

## Scope Boundaries

### In Scope (for remediation)

- `src/shared/hooks/useExportData.ts` — refactor to remove feature dependency
- All 7 View files — make `t` a prop or use i18n via context at Container level
- All Containers/Views with missing tests — add test files
- `ErrorBoundary.test.tsx` and `InstallPrompt.test.tsx` — replace `getByTestId` with accessible queries
- `src/infrastructure/storage.ts` — fix encryption key strategy
- `vite.config.ts` — add CSP headers
- `src/shared/stores/trackerStore.ts` — extract domain logic
- View naming: `DailyLogView`, `ScannerView`, `NudgePanelView`, `PlanView` — rename to match features
- `src/shared/stores/trackerStore.ts` — extract inline Spanish error messages to i18n
- `src/features/recipe-engine/PlanView.tsx` — extract inline sub-components
- Code smell refactors in `planGenerator.ts`, `rationValidator.ts`
- `emptyCounts` renaming consideration

### Out of Scope (separate change or won't fix)

- Complete domain model extraction to `shared/domain/` (already clean — OK)
- E2E test coverage (Playwright tests exist, not audited)
- Performance optimization
- New feature development
- UI redesign
- Database migration (no backend)
- ADR documentation updates

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Heavy scope leads to decision paralysis | Medium | High | Prioritize by severity. Fix CRITICAL/HIGH first in isolated PRs. |
| Refactoring shared → feature breaks consumers | Low | High | Extract first, then fix imports. Use deprecation warning pattern. |
| Encryption fix changes stored data format | Medium | Medium | Add migration path for existing localStorage data. |
| View naming changes break git blame/history | Low | Low | Acceptable cost for architectural consistency. |

---

## Ready for Proposal

**Yes**. This exploration has identified all findings mapped to specific skill rules. The proposal phase can proceed with grouped remediation plans:

1. **Phase 1** (CRITICAL): Fix Scope Rule violation + encryption key
2. **Phase 2** (HIGH): CSP headers + extract domain logic from trackerStore + make `t` a prop in Views
3. **Phase 3** (MEDIUM): Missing tests, getByTestId → getByRole, View naming, i18n extraction
4. **Phase 4** (LOW): Code smell cleanup, polysemy documentation

The orchestrator should present the grouped phases to the user and ask which to tackle.
