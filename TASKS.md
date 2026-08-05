# TASKS.md — Nutri-Fit-Día: Features by Functional Criticality

Generated: 2026-07-17 | Updated: 2026-08-02 | Branch: `develop` | Tests: 730 ✅ (72 files) | Lint: 0 (oxlint) | Typecheck: clean | Coverage: Stmts/Branches/Funcs/Lines | Formatter: Prettier | HTTP dev ✅ | CI/CD: ✅ | i18n: ✅ ES/EN | Deploy: https://darkmagic76.github.io/nutre-fit-dia/

---

## Current Status

| Layer                           | Status                                                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nutritional Traffic Light       | ✅ Implemented (FR-3.1, FR-3.2) — classificationService + occultSugarDetector, 22 tests                                                                        |
| Metabolic Tracker               | ✅ Implemented (FR-4.2, RF-02) — caloricTargetService with conditional deficit BMI > 25                                                                        |
| Med Diet Validator              | ✅ Implemented — rationValidator cross-feature, DailyLog with Container/Presentational                                                                         |
| Recipe Engine                   | ✅ Implemented — planGenerator + PlanContainer, sustainability badges, 3-6 meal fractionation (M7)                                                             |
| Domain Types                    | ✅ Implemented — FoodCategory, TrafficLight, Notification, Zod schemas, domain errors                                                                          |
| UI Primitives                   | ✅ Implemented — 7 components with unit tests                                                                                                                  |
| Activity Tracker                | ✅ Implemented (H1) — useActivityTracker, compliance %, streak, dashboard tab                                                                                  |
| Nudge Engine                    | ✅ Complete (H2+H6+H7) — 17 rules, CooldownTracker, NudgeStore, NudgePanel UI with badge + history                                                             |
| Sustainability                  | ✅ Implemented (H3) — computeEnvironmentalScore, PROTEIN_EMISSION_RATIOS, SCORING_WEIGHTS, integrated in RecipeEngine (dual ranking)                           |
| UserProfile + Phenotypic Filter | ✅ Implemented (C1) — UserProfileSchema (Zod), diagnosisAge, phenotypic filter                                                                                 |
| Legal Disclaimer                | ✅ Implemented (C3) — RNF-01 persistent banner in Dashboard + Plan                                                                                             |
| SafetyAlert UI                  | ✅ Implemented (C4) — SafetyAlertDisplay, high-glycemic fruit detection                                                                                        |
| Biomarker Tracking              | ✅ Implemented (C5) — GlucoseReading, WeightReading, IMC threshold crossing, getTrend                                                                          |
| Offline Persistence             | ✅ Implemented (H8) — 6 stores with Zustand persist, AES-256-GCM for health data, Zod Mapper.toDomain() in onRehydrateStorage, JSON export, persisted cooldown |
| HTTPS Transport (OWASP 2025)    | ✅ Implemented (RNF-04) — HTTP localhost dev, GitHub Pages HTTPS prod, CSP `upgrade-insecure-requests`                                                         |
| Vegetable Nudge Timegate UX     | ✅ Implemented — DailyViolations informs the user why the vegetable nudge activates after 14:00 (REQ-VEGETABLES-DEFICIT)                                       |
| Coverage Zombie Cleanup         | ✅ Implemented — 4 zombie files removed from `features/nudge-engine/`, 5 imports corrected to `@shared/nudge`                                                  |
| i18n Violation Messages (ES/EN) | ✅ Implemented — `formatViolation()` utility, 8 new i18n keys, violations and safety alerts in English and Spanish, `CATEGORY_DISPLAY_NAMES` deprecated        |
| Statement Coverage 100% Lines   | ✅ Implemented — 3 files to 100% statements (ErrorBoundary, ScannerView, installPrompt, rationValidator, planGenerator), 17 new tests                          |

---

## Features by Criticality

### CRITICAL — Clinical safety and medical correctness

| #      | Task                                    | ADR / Source           | Description                                                                                                                                                                    | Effort | Dependencies |
| ------ | --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------ |
| **C1** | **UserProfile + Phenotypic Filter**     | ADR-004, FR-4.1        | ✅ **Completed** — `UserProfileSchema` (Zod), diagnosisAge, validation ≤ currentAge, integrated in trackerStore + UI                                                           | M      | —            |
| **C2** | **Complete ErMedDietValidator**         | FR-2.1, RF-01, ADR-005 | ✅ **Completed** — `AESAN_GRAM_STANDARDS` (10 categories), `SafetyAlert` type, `validateFoodPortions()`                                                                        | L      | —            |
| **C3** | **Dietitian Legal Disclaimer (RNF-01)** | SPECS_RF RNF-01        | ✅ **Completed** — `LegalDisclaimer` banner in Dashboard + Plan, role="alert"                                                                                                  | S      | —            |
| **C4** | **SafetyAlert in UI**                   | ADR-008                | ✅ **Completed** — `SafetyAlertDisplay` component, `safetyCheck` service (high-glycemic fruits), acknowledge button                                                            | M      | —            |
| **C5** | **Biomarker Monitoring**                | FR-5.1                 | ✅ **Completed** — `biomarkerStore`: `GlucoseReading`, `WeightReading`, `IMC` threshold crossing, `getTrend`, glucose UI field, JSON data export (button in metabolic profile) | M      | —            |

### Phase 1: 5/5 completed 🎉

### HIGH — Core functional value

| #      | Task                              | ADR / Source        | Description                                                                                                                                                                                                                                     | Effort | Dependencies  |
| ------ | --------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- |
| **H1** | **Activity Goal Tracker V1**      | ADR-006, RF-03      | ✅ **Completed** — `useActivityTracker` hook, compliance %, streak, "🏃 Activity" tab                                                                                                                                                           | M      | —             |
| **H2** | **Nudge Engine: Core Rules**      | ADR-008             | ✅ **Completed** — 14 rules: 3 SafetyAlert + 5 BehavioralNudge + 6 SystemAction, CooldownTracker, NudgeStore (255 tests).                                                                                                                       | L      | C1 ✅         |
| **H3** | **Sustainability Scoring Core**   | ADR-007, FR-2.2     | ✅ **Completed** — `computeEnvironmentalScore()` with AESAN/EAT-Lancet constants, 50/30/20 weights, integrated in `pickSustainableFood()` of RecipeEngine for dual ranking (health + sustainability). 14 tests.                                 | M      | None          |
| **H4** | **Dual Qualification Scanner**    | ADR-003 + ADR-007   | ✅ **Completed** — `ScanResult.environmentalScore?` (ADR-003), `ClassificationResult.environmentalScore?` integrated in `classifyFoodWithReasons`. Backward-compatible. 3 tests.                                                                | S      | H3 ✅         |
| **H5** | **UNESCO Cultural Metadata**      | FR-5.2              | ✅ **Completed** — `CulturalMetadataSchema` in `Food` (optional): traditionalCuisine, socialEating, cookingTechnique, geographicOrigin, proteinBiologicalValue, erMedDiet. 6 traditional dishes populated. Badges in PlanView (🏺👥🌿). 1 test. | S      | None          |
| **H6** | **NudgeEngine: SPECS_TECH Rules** | ADR-008, SPECS_TECH | ✅ **Completed** — Implemented within H2 PR2/PR3: `HYPERGLYCEMIA_NUDGE` (glucose > 180 → walk/fiber) + `HC_INACTIVITY_ADJUST` (< 150 min/week → reduce carbs). 4 combined tests.                                                                | S      | H1, H2, C5 ✅ |
| **H7** | **BehavioralNudge UI**            | ADR-008             | ✅ **Completed** — `NudgePanelContainer/View`: pending nudge list with dismiss, counter badge, engagement history. New "🔔 Nudges" tab in dashboard. 6 tests.                                                                                   | M      | H2 ✅         |

### MEDIUM — Functional completeness

| #      | Task                             | ADR / Source         | Description                                                                                                                                                                                                                        | Effort | Dependencies |
| ------ | -------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ |
| **M1** | **Substitution Service**         | ADR-007, SPECS_RF    | ✅ **Completed** — `suggestAlternative(food)`: WHITE_MEAT → LEGUMES + blue FISH (BLUE_FISH_IDS validated by AESAN 2.4.2.1). Ranking by descending environmental score, top 3. 13 tests, 100% coverage.                             | S      | H3 ✅        |
| **M2** | **Nudge: Smart Substitution**    | ADR-007 + ADR-008    | ✅ **Completed** — `SUSTAINABLE_SUBSTITUTION` rule in NudgeEngine: if environmentalScore < 30 → BehavioralNudge with alternatives from `suggestAlternative()`. Dynamic body, cooldown 4h. 6 tests, 100% coverage.                  | S      | M1 ✅, H2 ✅ |
| **M3** | **Conviviality (RNF-02)**        | SPECS_RF RNF-02      | ✅ **Completed** — `CulturalBadges` extended with textual suggestions: "Ideal para comer en compañía" + "Preparación: {técnica}". `COOKING_LABELS` for 5 techniques (Spanish). Data-driven test (it.each) covers all 5. 8/8 specs. | S      | H5 ✅        |
| **M4** | **Zero-Waste Module**            | SPECS_TECH           | ✅ **Completed** — `isUglyProduce` + `isZeroWaste` in FoodSchema. 7 tagged foods. `ZeroWasteBadges` (♻️🥕) in PlanView. Dataset integrity tests. 9/9 specs.                                                                        | S      | H3 ✅        |
| **M5** | **FR-MATRIX Sync**               | FR-MATRIX            | ✅ **Completed** — Matrix synchronized with actual implementation. RF-02 already ✅, M1-M4 reflected, date 2026-07-22.                                                                                                             | XS     | None         |
| **M6** | **Strength Training 2d/week**    | SPECS_TECH §6, RF-03 | ✅ **Completed** — Implemented in H1: `strengthSessionsMin=2`, `meetsStrength` in useActivityTracker, "✅ Objetivo" badge in ActivityTrackerView. Existing test verifies 100% compliance.                                          | S      | H1 ✅        |
| **M7** | **3-6 Daily Meal Fractionation** | SPECS_TECH §5        | ✅ **Completed** — `MealType` enum, `buildDailyTemplate(mealCount)` 3-6 meals, `enforceAOVE` post-processing, PlanView grouped by meal with kcal + % target. 24 new tests.                                                         | M      | H4           |

### Phase 3: 7/7 completed 🎉

### LOW — Polish and experience

| #      | Task                        | ADR / Source | Description                                                                                                                                                                                                                                         | Effort | Dependencies |
| ------ | --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ |
| **L1** | **Bacalao Priority Tag**    | SPECS_TECH   | ✅ **Completed** — `isHighPriority: true` in FoodSchema + Bacalao. `pickSustainableFood()` prioritizes high-priority foods over environmental score. 2 new tests.                                                                                   | XS     | None         |
| **L2** | **Unified Dashboard**       | —            | ✅ **Completed** — New `sustainability/` feature with Container/Presentational (emissions, zero-waste, scoring). Integrated "🌍 Eco" tab. Responsive nav: icons on mobile, icon+label on desktop. `overflow-x-auto` + `flex-wrap`. 4 tests.         | L      | H1, H4, H7   |
| **L3** | **i18n ES/EN**              | —            | ✅ **Completed** — i18n infrastructure with typed React Context (`useT()`). `es.ts` + `en.ts` files with 60+ keys. App shell, PlanView, SustainabilityView, LegalDisclaimer and ViolationList translated. Responsive nav with i18n labels. 4 tests. | L      | None         |
| **L4** | **E2E Smoke Tests**         | —            | ✅ **Completed** — Playwright installed + chromium. 3 smoke tests: full flow (scan→classify→log→plan), RED processing, metabolic profile. `playwright.config.ts` + `e2e/smoke.spec.ts`. Scripts: `test:e2e`, `test:e2e:ui`.                         | M      | L2           |
| **L5** | **A11y Audit**              | RNF-03       | ✅ **Completed** — Decorative emojis with `aria-hidden`. No positive tabindex. Correct heading hierarchy (h1→h2→h3). ARIA roles on tabs, alerts, status. Labels on buttons and forms. Min-height 44px on interactive elements.                      | M      | None         |
| **L6** | **HTTPS Transport (OWASP)** | RNF-04       | ✅ **Completed** — HTTP localhost dev, GitHub Pages HTTPS prod. CSP `upgrade-insecure-requests`. Pluggable infrastructure without touching domain.                                                                                                  | S      | None         |
| **H8** | **Offline Persistence**     | ADR-011      | ✅ **Completed** — 6 stores with Zustand persist + AES-256-GCM (health data) + Zod onRehydrateStorage (Mapper.toDomain). biomarkerStore, persisted cooldown, JSON data export, locale/tab localStorage. 680 tests (66 files).                       | XL     | C5, H2, H6   |

---

## Recommended Execution Order

```
Phase 1 — Clinical Safety (CRITICAL)
  C1 → C2 → C4 → C3 → C5
  (UserProfile → ErMedDietValidator → SafetyAlert UI → Legal Disclaimer → Biomarkers)

Phase 2 — Core Value (HIGH) — completed 🎉
  H1 → H3 → H4 → H5 → H2 → H6 → H7
  (Activity → Sustainability → Dual Scan → UNESCO → Nudge Engine → Nudge UI)

Phase 3 — Completeness (MEDIUM)
  M1 → M2 → M3 → M4 → M5 → M6 → M7

Phase 4 — Polish (LOW)
  L1 → L2 → L3 → L4 → L5
```

---

## Notes

- **730 green tests (72 files)**: any new feature must maintain strict TDD (RED → GREEN → TRIANGULATE → REFACTOR).
- **Scope Rule**: code used by 1 feature → inside that feature. Used by 2+ → `shared/` with domain module structure. Nudge engine extracted to `src/shared/nudge/` (2026-07-23). `planStore` moved to `features/recipe-engine/store/` (2026-08-02).
- **Nudge engine**: pure `buildNudgeContext()` via `ContextInput`. `CooldownTracker` with dependency injection (`CooldownOps`). `biomarkerTrackingService` removed (Middle Man — inlined in `trackerStore`).
- **FR-5.1 Export**: `useExportData` connected to "📥 Exportar datos" button in Metabolic Profile. Downloads JSON with 6 stores.
- **Infra**: `tsconfig.app.json` excludes tests from build. Husky active: pre-commit (lint) + pre-push (quality). `coverage/` in `.gitignore`.
- **i18n**: 0 hardcoded strings. Food categories (11 keys) with ES/EN translation. `AOVE` is kept as a clinical term in both languages.
