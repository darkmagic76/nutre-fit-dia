# FR → Code Traceability Matrix

Source documents:

- `INFORME_ADR.md` — Functional Specification (FR-1.x → FR-5.x)
- `SPECS_TECH.md` — erMedDiet Technical Manual
- `SPECS_RF.md` — Functional and Non-Functional Requirements (RF-01 → RF-03, RNF-01 → RNF-03)

Generated: 2026-07-12 | Updated: 2026-08-10 | Branch: `develop` | Tests: 809 ✅ (79 files) | Lint: 0 | Typecheck: clean | ADRs: 12

## Status by Requirement

| ID         | Description                                                 | Source                           | Status        | Coverage                                                                                                               |
| ---------- | ----------------------------------------------------------- | -------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **FR-1.1** | Strategic Pillars (AESAN/PREDIMED-Plus)                     | INFORME_ADR                      | 📄 Documented | —                                                                                                                      |
| **FR-1.2** | Nutritional Transition (patterns vs calories)               | INFORME_ADR                      | 📄 Documented | —                                                                                                                      |
| **FR-2.1** | Cereals: 4-ration limit under restriction                   | INFORME_ADR, SPEC_TECH, SPECS_RF | ✅ Completed  | `RATION_LIMITS` + C2 ErMedDietValidator                                                                                |
| **FR-2.2** | Sustainability: environmental scoring + Zero-Waste          | INFORME_ADR, SPEC_TECH           | ✅ Completed  | H3 `computeEnvironmentalScore` + `pickSustainableFood`                                                                 |
| **FR-3.1** | Green/Orange/Red Nutritional Traffic Light                  | Both                             | ✅ Completed  | `classificationService.ts` — 22 tests                                                                                  |
| **FR-3.2** | Occult sugar detection (string-match)                       | Both                             | ✅ Completed  | `occultSugarDetector.ts` — 9 tests                                                                                     |
| **FR-4.1** | Phenotypic Filter (diagnosis age, BMI)                      | INFORME_ADR                      | ✅ Completed  | C1 `UserProfileSchema` + `diagnosisAge` + `getDiagnosisModifier()` (phenotypic deficit scaling: 1.0/0.85/0.7 brackets) |
| **FR-4.2** | 600 kcal deficit + 3-6 meal fractionation                   | Both                             | ✅ Completed  | `caloricTargetService.ts` (deficit) + M7 `MealType` 3-6 meal distribution                                              |
| **FR-4.3** | Activity Tracking + Nudges + carb adjustment                | SPEC_TECH, INFORME_ADR           | ✅ Completed  | H1 (minutes), H2 (nudges: 19 rules with deficit + excess), M6 (strength), M7 (fractionation)                           |
| **FR-5.1** | Professional validation + biomarker monitoring              | Both                             | ✅ Completed  | C3 LegalDisclaimer + C5 `biomarkerTrackingService`                                                                     |
| **FR-5.2** | Cultural metadata + sustainability (UNESCO)                 | INFORME_ADR                      | ✅ Completed  | H5 `CulturalMetadataSchema` + badges in PlanView                                                                       |
| **RF-01**  | AESAN menus: recipes with gram-based rations                | SPECS_RF                         | ✅ Completed  | C2 `AESAN_GRAM_STANDARDS` + `validateFoodPortions`                                                                     |
| **RF-02**  | 600 kcal deficit **only if BMI > 25** (conditional)         | SPECS_RF                         | ✅ Completed  | `caloricTargetService.ts` — IMC_NORMAL_MAX=25                                                                          |
| **RF-03**  | Physical activity: 150-300 min/week + 2 strength days       | SPECS_RF                         | ✅ Completed  | H1 (minutes) + M6 (strength 2d/week)                                                                                   |
| **RNF-01** | Legal disclaimer: validation by Dietista-Nutricionista      | SPECS_RF                         | ✅ Completed  | C3 `LegalDisclaimer` in Dashboard + Plan                                                                               |
| **RNF-02** | Conviviality: eating in company, culinary techniques        | SPECS_RF, SPEC_TECH              | ✅ Completed  | M3 `CulturalBadges` textual suggestions + `COOKING_LABELS`                                                             |
| **RNF-03** | Sustainability: local products, seasonal, minimal packaging | SPECS_RF, SPEC_TECH              | ✅ Completed  | H3 `SCORING_WEIGHTS` + M4 `ZeroWasteBadges` ♻️🥕                                                                       |

## Architecture (ADR-012: Clean Architecture Layers)

| ID        | Description                                                   | Source  | Status       | Coverage                                                                                                                              |
| --------- | ------------------------------------------------------------- | ------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **ARC-1** | Clean Architecture layers (domain/application/infrastructure) | ADR-012 | ✅ Completed | `src/domain/` (28 files), `src/application/` (ports + use cases + dtos), `src/infrastructure/` (stores + adapters + composition root) |
| **ARC-2** | Port interfaces (5 repositorios)                              | ADR-012 | ✅ Completed | `application/ports/{notification,activity,log,plan,biomarker}Repository.ts`                                                           |
| **ARC-3** | Adapters (5 Zustand wrappers)                                 | ADR-012 | ✅ Completed | `infrastructure/adapters/zustand*.ts` + `contract.test.ts` (5 tests)                                                                  |
| **ARC-4** | Composition Root (`createContainer()`)                        | ADR-012 | ✅ Completed | `infrastructure/compositionRoot.ts`, wired in `main.tsx` via `ContainerProvider` (React Context DI)                                   |
| **ARC-5** | Use cases extracted from stores                               | ADR-012 | ✅ Completed | `application/use-cases/{calculateTarget,evaluateNudges,exportData}.ts` (30 tests, in-memory fakes)                                    |
| **ARC-6** | Path aliases (`@domain/*`, `@application/*`)                  | ADR-012 | ✅ Completed | `tsconfig.app.json` + `vite.config.ts`                                                                                                |
| **ARC-7** | Skills structure (flat .md files)                             | ADR-012 | ✅ Completed | `skills/{name}.md` (8 skills)                                                                                                         |
| **ARC-8** | Domain purity (zero shared/utils imports)                     | ADR-012 | ✅ Completed | `src/domain/` imports only `zod` + internal modules                                                                                   |

## SPEC_TECH: New verified information

| SPEC_TECH Requirement                                  | Status | Coverage                                                                               |
| ------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| Dual Qualification (health + environmental)            | ✅     | H4 `ClassificationResult.environmentalScore`                                           |
| Hyperglycemia Nudge (glucose → walk/fiber)             | ✅     | H2 PR2 `HYPERGLYCEMIA_NUDGE`                                                           |
| Bacalao Optimization (0.7% fat)                        | ✅     | H2 PR3 `FISH_COD_TAG` + `classificationService` GREEN                                  |
| Carb adjustment by activity (< 150 min → reduce carbs) | ✅     | H2 PR3 `HC_INACTIVITY_ADJUST`                                                          |
| 3-6 daily meal fractionation                           | ✅     | M7 `MealType` + `buildDailyTemplate(mealCount)` + `enforceAOVE`                        |
| Strength training 2 days/week                          | ✅     | M6 — already implemented in H1 `useActivityTracker`                                    |
| Smart Substitution (Red_Meat → Legume/BlueFish)        | ✅     | M1 `suggestAlternative` + M2 `SUSTAINABLE_SUBSTITUTION` nudge                          |
| Deficit Nudge: Cereals < 3/day (2026-07-23)            | ✅     | `CEREALS_DEFICIT` rule, cooldown 6h                                                    |
| Deficit Nudge: Fruits < 2/day (2026-07-23)             | ✅     | `FRUITS_DEFICIT` rule, cooldown 6h                                                     |
| Vegetable Nudge: threshold 20h→14h (2026-07-23)        | ✅     | `VEGETABLE_NUDGE_HOUR_THRESHOLD` lowered from 20 to 14                                 |
| Scope Rule: nudge engine → shared/nudge/ (2026-07-23)  | ✅     | Rule engine extracted to `src/shared/nudge/`                                           |
| i18n: 0 hardcoded strings (2026-07-23)                 | ✅     | 12 strings → i18n keys + categories in ES/EN                                           |
| streakCount → Zustand (2026-07-23)                     | ✅     | Streak state moved to `activityStore`                                                  |
| Vegetable Nudge: UX time gate (2026-07-24)             | ✅     | DailyViolations reports time gate 14:00 (2 i18n messages)                              |
| Coverage: zombies removed (2026-07-24)                 | ✅     | 4 zombies deleted, 5 imports corrected, 3 Boy Scout tests                              |
| Coverage: views at 100% stmts (2026-07-24)             | ✅     | ErrorBoundary, ScannerView, Container + tests (556→561 tests)                          |
| Coverage: easy gaps (2026-07-24)                       | ✅     | installPrompt, rationValidator, planGenerator (561→578 tests)                          |
| i18n: violations ES/EN (2026-07-24)                    | ✅     | formatViolation(), 8 keys, CATEGORY_DISPLAY_NAMES deprecated                           |
| Coverage: 100% lines, 99.76% stmts (2026-07-24)        | ✅     | 578 tests (59 files), green pipeline, Scope Rule 0 violations                          |
| Legume-Carb-Source Nudge (2026-08-05)                  | ✅     | `LEGUME_CARB_SOURCE` rule, 4 tests, co-fires with CEREALS_DEFICIT                      |
| AOVE_TAGGING fix: `=== 0` → `< 3` (2026-08-06)         | ✅     | `AOVE_TAGGING` condition corrected to AESAN min (3 rations), 5 tests                   |
| Clean Architecture refactor (2026-08-06)               | ✅     | ADR-012: 3 layers, 5 ports, 5 adapters, composition root, 773 tests green              |
| Fase 1: break Infra→Features (2026-08-07)              | ✅     | planGenerator → application/services, sugarAliases → shared/data, 803 tests            |
| Fase 2: activate Composition Root (2026-08-07)         | ✅     | ContainerContext + useContainer DI, React Context wiring, 803 tests green              |
| Phase 1: decouple stores + Container port (2026-08-10) | ✅     | logStore independent, Container interface, useNudgeTrigger in infra, 809 tests         |
| Phase 2: type safety (2026-08-10)                      | ✅     | StateExporter port, remove `any` from exportData, typed test fakes, 809 tests          |
| Phase 3.1: Container/Presentational fix (2026-08-10)   | ✅     | Move `<Card>` from Container to View, pure logic container, regression test, 810 tests |

## Legend

| Symbol        | Meaning                                    |
| ------------- | ------------------------------------------ |
| ✅ Completed  | Implemented with TDD tests                 |
| 🔶 Partial    | Partly implemented, gap covered in roadmap |
| 🔜 Pending    | In roadmap, not started                    |
| 📄 Documented | In specification only, not coded           |
