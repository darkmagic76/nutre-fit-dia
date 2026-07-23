# TASKS.md — Nutri-Fit-Día: Features por Criticidad Funcional

Generado: 2026-07-17 | Actualizado: 2026-07-23 | Rama: `develop` | Tests: 544 ✅ (56 files) | Lint: 0 (oxlint) | Typecheck: limpio | Coverage: 98.64% Stmts / 100% Funcs / 99.31% Lines | Formatter: Prettier

---

## Estado Actual

| Capa                            | Estado                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Nutritional Traffic Light       | ✅ Implementado (FR-3.1, FR-3.2) — classificationService + occultSugarDetector, 22 tests                                             |
| Metabolic Tracker               | ✅ Implementado (FR-4.2, RF-02) — caloricTargetService con déficit condicional IMC > 25                                              |
| Med Diet Validator              | ✅ Implementado — rationValidator cross-feature, DailyLog con Container/Presentational                                               |
| Recipe Engine                   | ✅ Implementado — planGenerator + PlanContainer, sustainability badges, fraccionamiento 3-6 tomas (M7)                               |
| Domain Types                    | ✅ Implementado — FoodCategory, TrafficLight, Notification, Zod schemas, domain errors                                               |
| UI Primitives                   | ✅ Implementado — 7 componentes con tests unitarios                                                                                  |
| Activity Tracker                | ✅ Implementado (H1) — useActivityTracker, compliance %, streak, dashboard tab                                                       |
| Nudge Engine                    | ✅ Completo (H2+H6+H7) — 14 reglas, CooldownTracker, NudgeStore, NudgePanel UI con badge + historial                                 |
| Sustainability                  | ✅ Implementado (H3) — computeEnvironmentalScore, PROTEIN_EMISSION_RATIOS, SCORING_WEIGHTS, integrado en RecipeEngine (ranking dual) |
| UserProfile + Filtro Fenotípico | ✅ Implementado (C1) — UserProfileSchema (Zod), diagnosisAge, phenotypic filter                                                      |
| Legal Disclaimer                | ✅ Implementado (C3) — RNF-01 banner persistente en Dashboard + Plan                                                                 |
| SafetyAlert UI                  | ✅ Implementado (C4) — SafetyAlertDisplay, high-glycemic fruit detection                                                             |
| Biomarker Tracking              | ✅ Implementado (C5) — GlucoseReading, WeightReading, IMC threshold crossing, getTrend                                               |

---

## Features por Criticidad

### CRITICAL — Seguridad clínica y corrección médica

| #      | Tarea                               | ADR / Fuente           | Descripción                                                                                                                               | Esfuerzo | Dependencias |
| ------ | ----------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| **C1** | **UserProfile + Filtro Fenotípico** | ADR-004, FR-4.1        | ✅ **Completado** — `UserProfileSchema` (Zod), diagnosisAge, validación ≤ currentAge, integrado en trackerStore + UI                      | M        | —            |
| **C2** | **ErMedDietValidator completo**     | FR-2.1, RF-01, ADR-005 | ✅ **Completado** — `AESAN_GRAM_STANDARDS` (10 categorías), `SafetyAlert` type, `validateFoodPortions()`                                  | L        | —            |
| **C3** | **Aviso Legal Dietista (RNF-01)**   | SPECS_RF RNF-01        | ✅ **Completado** — `LegalDisclaimer` banner en Dashboard + Plan, role="alert"                                                            | S        | —            |
| **C4** | **SafetyAlert en UI**               | ADR-008                | ✅ **Completado** — `SafetyAlertDisplay` component, `safetyCheck` service (high-glycemic fruits), acknowledge button                      | M        | —            |
| **C5** | **Monitoreo Biomarcadores**         | FR-5.1                 | ✅ **Completado** — `biomarkerTrackingService`: `GlucoseReading`, `WeightReading`, `IMC` threshold crossing, `getTrend`, glucose UI field | M        | —            |

### Fase 1: 5/5 completada 🎉

### HIGH — Valor funcional principal

| #      | Tarea                             | ADR / Fuente        | Descripción                                                                                                                                                                                                                                       | Esfuerzo | Dependencias  |
| ------ | --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| **H1** | **Activity Goal Tracker V1**      | ADR-006, RF-03      | ✅ **Completado** — `useActivityTracker` hook, compliance %, streak, tab "🏃 Actividad"                                                                                                                                                           | M        | —             |
| **H2** | **Nudge Engine: Reglas Core**     | ADR-008             | ✅ **Completado** — 14 reglas: 3 SafetyAlert + 5 BehavioralNudge + 6 SystemAction, CooldownTracker, NudgeStore (255 tests).                                                                                                                       | L        | C1 ✅         |
| **H3** | **Sustainability Scoring Core**   | ADR-007, FR-2.2     | ✅ **Completado** — `computeEnvironmentalScore()` con constantes AESAN/EAT-Lancet, pesos 50/30/20, integrado en `pickSustainableFood()` del RecipeEngine para ranking dual (salud + sostenibilidad). 14 tests.                                    | M        | Ninguna       |
| **H4** | **Dual Qualification Scanner**    | ADR-003 + ADR-007   | ✅ **Completado** — `ScanResult.environmentalScore?` (ADR-003), `ClassificationResult.environmentalScore?` integrado en `classifyFoodWithReasons`. Backward-compatible. 3 tests.                                                                  | S        | H3 ✅         |
| **H5** | **Metadata Cultural UNESCO**      | FR-5.2              | ✅ **Completado** — `CulturalMetadataSchema` en `Food` (optional): traditionalCuisine, socialEating, cookingTechnique, geographicOrigin, proteinBiologicalValue, erMedDiet. 6 platos tradicionales poblados. Badges en PlanView (🏺👥🌿). 1 test. | S        | Ninguna       |
| **H6** | **NudgeEngine: SPECS_TECH Rules** | ADR-008, SPECS_TECH | ✅ **Completado** — Implementado dentro de H2 PR2/PR3: `HYPERGLYCEMIA_NUDGE` (glucosa > 180 → caminata/fibra) + `HC_INACTIVITY_ADJUST` (< 150 min/semana → reducir HC). 4 tests combinados.                                                       | S        | H1, H2, C5 ✅ |
| **H7** | **BehavioralNudge UI**            | ADR-008             | ✅ **Completado** — `NudgePanelContainer/View`: lista de nudges pendientes con dismiss, badge contador, historial de engagement. Nueva pestaña "🔔 Nudges" en dashboard. 6 tests.                                                                 | M        | H2 ✅         |

### MEDIUM — Completitud funcional

| #      | Tarea                                  | ADR / Fuente         | Descripción                                                                                                                                                                                                                         | Esfuerzo | Dependencias |
| ------ | -------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| **M1** | **Substitution Service**               | ADR-007, SPECS_RF    | ✅ **Completado** — `suggestAlternative(food)`: WHITE_MEAT → LEGUMES + blue FISH (BLUE_FISH_IDS validado por AESAN 2.4.2.1). Ranking por environmental score descendente, top 3. 13 tests, 100% coverage.                           | S        | H3 ✅        |
| **M2** | **Nudge: Sustitución Inteligente**     | ADR-007 + ADR-008    | ✅ **Completado** — `SUSTAINABLE_SUBSTITUTION` rule en NudgeEngine: si environmentalScore < 30 → BehavioralNudge con alternativas de `suggestAlternative()`. Dynamic body, cooldown 4h. 6 tests, 100% coverage.                     | S        | M1 ✅, H2 ✅ |
| **M3** | **Convivialidad (RNF-02)**             | SPECS_RF RNF-02      | ✅ **Completado** — `CulturalBadges` extendido con sugerencias textuales: "Ideal para comer en compañía" + "Preparación: {técnica}". `COOKING_LABELS` para 5 técnicas (español). Data-driven test (it.each) cubre las 5. 8/8 specs. | S        | H5 ✅        |
| **M4** | **Zero-Waste Module**                  | SPECS_TECH           | ✅ **Completado** — `isUglyProduce` + `isZeroWaste` en FoodSchema. 7 alimentos etiquetados. `ZeroWasteBadges` (♻️🥕) en PlanView. Dataset integrity tests. 9/9 specs.                                                               | S        | H3 ✅        |
| **M5** | **FR-MATRIX Sync**                     | FR-MATRIX            | ✅ **Completado** — Matriz sincronizada con implementación real. RF-02 ya ✅, M1-M4 reflejados, fecha 2026-07-22.                                                                                                                   | XS       | Ninguna      |
| **M6** | **Fortalecimiento Muscular 2d/semana** | SPECS_TECH §6, RF-03 | ✅ **Completado** — Implementado en H1: `strengthSessionsMin=2`, `meetsStrength` en useActivityTracker, badge "✅ Objetivo" en ActivityTrackerView. Test existente verifica compliance 100%.                                        | S        | H1 ✅        |
| **M7** | **Fraccionamiento 3-6 tomas diarias**  | SPECS_TECH §5        | ✅ **Completado** — `MealType` enum, `buildDailyTemplate(mealCount)` 3-6 tomas, `enforceAOVE` post-processing, PlanView agrupado por comida con kcal + % target. 24 tests nuevos.                                                   | M        | H4           |

### Fase 3: 7/7 completada 🎉

### LOW — Pulido y experiencia

| #      | Tarea                    | ADR / Fuente | Descripción                                                                                                                                                                                                                                            | Esfuerzo | Dependencias |
| ------ | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------ |
| **L1** | **Bacalao Priority Tag** | SPECS_TECH   | ✅ **Completado** — `isHighPriority: true` en FoodSchema + Bacalao. `pickSustainableFood()` prioriza high-priority foods sobre environmental score. 2 tests nuevos.                                                                                    | XS       | Ninguna      |
| **L2** | **Dashboard Unificado**  | —            | ✅ **Completado** — Nueva feature `sustainability/` con Container/Presentational (emisiones, zero-waste, scoring). Tab "🌍 Eco" integrado. Nav responsive: iconos en mobile, icono+label en desktop. `overflow-x-auto` + `flex-wrap`. 4 tests.         | L        | H1, H4, H7   |
| **L3** | **i18n ES/EN**           | —            | ✅ **Completado** — Infraestructura i18n con React Context tipado (`useT()`). Archivos `es.ts` + `en.ts` con 60+ claves. App shell, PlanView, SustainabilityView, LegalDisclaimer y ViolationList traducidos. Nav responsive con labels i18n. 4 tests. | L        | Ninguna      |
| **L4** | **E2E Smoke Tests**      | —            | ✅ **Completado** — Playwright instalado + chromium. 3 smoke tests: flujo completo (scan→classify→log→plan), procesado ROJO, perfil metabólico. `playwright.config.ts` + `e2e/smoke.spec.ts`. Scripts: `test:e2e`, `test:e2e:ui`.                      | M        | L2           |
| **L5** | **A11y Audit**           | RNF-03       | ✅ **Completado** — Emojis decorativos con `aria-hidden`. Sin tabindex positivos. Heading hierarchy correcto (h1→h2→h3). Roles ARIA en tabs, alerts, status. Labels en botones y formularios. Min-height 44px en interactivos.                         | M        | Ninguna      |

---

## Orden Recomendado de Ejecución

```
Fase 1 — Seguridad Clínica (CRITICAL)
  C1 → C2 → C4 → C3 → C5
  (UserProfile → ErMedDietValidator → SafetyAlert UI → Aviso Legal → Biomarcadores)

Fase 2 — Valor Principal (HIGH) — completada 🎉
  H1 → H3 → H4 → H5 → H2 → H6 → H7
  (Activity → Sustainability → Dual Scan → UNESCO → Nudge Engine → Nudge UI)

Fase 3 — Completitud (MEDIUM)
  M1 → M2 → M3 → M4 → M5 → M6 → M7

Fase 4 — Pulido (LOW)
  L1 → L2 → L3 → L4 → L5
```

---

## Notas

- **544 tests verdes (56 files)**: cualquier feature nueva debe mantener el TDD estricto (RED → GREEN → TRIANGULATE → REFACTOR).
- **Scope Rule**: código usado por 1 feature → dentro de esa feature. Usado por 2+ → `shared/` con estructura de domain module. Motor de nudge extraído a `src/shared/nudge/` (2026-07-23).
- **Infra**: `tsconfig.app.json` excluye tests del build. Husky activo: pre-commit (lint) + pre-push (quality). `coverage/` en `.gitignore`.
- **i18n**: 0 strings hardcodeados. Categorías de alimento (11 keys) con traducción ES/EN. `AOVE` se mantiene como término clínico en ambos idiomas.
