# Matriz de Trazabilidad FR → Código

Documentos fuente:

- `INFORME_ADR.md` — Especificación Funcional (FR-1.x → FR-5.x)
- `SPECS_TECH.md` — Manual Técnico erMedDiet
- `SPECS_RF.md` — Requisitos Funcionales y No Funcionales (RF-01 → RF-03, RNF-01 → RNF-03)

Generada: 2026-07-12 | Actualizada: 2026-07-24 | Rama: `develop` | Tests: 578 ✅ (59 files) | Coverage: 99.76% Stmts / 95.72% Branches / 100% Funcs / 100% Lines

## Estado por Requisito

| ID         | Descripción                                                   | Fuente                           | Estado         | Cobertura                                                                                                              |
| ---------- | ------------------------------------------------------------- | -------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **FR-1.1** | Pilares Estratégicos (AESAN/PREDIMED-Plus)                    | INFORME_ADR                      | 📄 Documentado | —                                                                                                                      |
| **FR-1.2** | Transición Nutricional (patrones vs calorías)                 | INFORME_ADR                      | 📄 Documentado | —                                                                                                                      |
| **FR-2.1** | Cereales: límite 4 raciones en restricción                    | INFORME_ADR, SPEC_TECH, SPECS_RF | ✅ Completado  | `RATION_LIMITS` + C2 ErMedDietValidator                                                                                |
| **FR-2.2** | Sostenibilidad: puntuación ambiental + Zero-Waste             | INFORME_ADR, SPEC_TECH           | ✅ Completado  | H3 `computeEnvironmentalScore` + `pickSustainableFood`                                                                 |
| **FR-3.1** | Semáforo Nutricional Verde/Naranja/Rojo                       | Ambos                            | ✅ Completado  | `classificationService.ts` — 22 tests                                                                                  |
| **FR-3.2** | Detección azúcares ocultos (string-match)                     | Ambos                            | ✅ Completado  | `occultSugarDetector.ts` — 9 tests                                                                                     |
| **FR-4.1** | Filtro Fenotípico (edad diagnóstico, IMC)                     | INFORME_ADR                      | ✅ Completado  | C1 `UserProfileSchema` + `diagnosisAge` + `getDiagnosisModifier()` (phenotypic deficit scaling: 1.0/0.85/0.7 brackets) |
| **FR-4.2** | Déficit 600 kcal + fraccionamiento 3-6 tomas                  | Ambos                            | ✅ Completado  | `caloricTargetService.ts` (déficit) + M7 `MealType` distribución 3-6 tomas                                             |
| **FR-4.3** | Activity Tracking + Nudges + reajuste HC                      | SPEC_TECH, INFORME_ADR           | ✅ Completado  | H1 (minutos), H2 (nudges: 17 reglas con déficit + exceso), M6 (fortalecimiento), M7 (fraccionamiento)                  |
| **FR-5.1** | Validación profesional + monitoreo biomarcadores              | Ambos                            | ✅ Completado  | C3 LegalDisclaimer + C5 `biomarkerTrackingService`                                                                     |
| **FR-5.2** | Metadata cultural + sostenibilidad (UNESCO)                   | INFORME_ADR                      | ✅ Completado  | H5 `CulturalMetadataSchema` + badges en PlanView                                                                       |
| **RF-01**  | Menús AESAN: recetas con raciones gramadas                    | SPECS_RF                         | ✅ Completado  | C2 `AESAN_GRAM_STANDARDS` + `validateFoodPortions`                                                                     |
| **RF-02**  | Déficit 600 kcal **solo si IMC > 25** (condicional)           | SPECS_RF                         | ✅ Completado  | `caloricTargetService.ts` — IMC_NORMAL_MAX=25                                                                          |
| **RF-03**  | Actividad física: 150-300 min/semana + 2 días fuerza          | SPECS_RF                         | ✅ Completado  | H1 (minutos) + M6 (fortalecimiento 2d/semana)                                                                          |
| **RNF-01** | Aviso legal: validación por Dietista-Nutricionista            | SPECS_RF                         | ✅ Completado  | C3 `LegalDisclaimer` en Dashboard + Plan                                                                               |
| **RNF-02** | Convivialidad: comer en compañía, técnicas culinarias         | SPECS_RF, SPEC_TECH              | ✅ Completado  | M3 `CulturalBadges` textual suggestions + `COOKING_LABELS`                                                             |
| **RNF-03** | Sostenibilidad: productos locales, temporada, mínimos envases | SPECS_RF, SPEC_TECH              | ✅ Completado  | H3 `SCORING_WEIGHTS` + M4 `ZeroWasteBadges` ♻️🥕                                                                       |

## SPEC_TECH: Nueva información verificada

| Requisito SPEC_TECH                                   | Estado | Cobertura                                                       |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------- |
| Dual Qualification (salud + ambiental)                | ✅     | H4 `ClassificationResult.environmentalScore`                    |
| Nudge de Hiperglucemia (glucosa → caminata/fibra)     | ✅     | H2 PR2 `HYPERGLYCEMIA_NUDGE`                                    |
| Optimización Bacalao (0.7% grasa)                     | ✅     | H2 PR3 `FISH_COD_TAG` + `classificationService` GREEN           |
| Ajuste HC por actividad (< 150 min → reducir HC)      | ✅     | H2 PR3 `HC_INACTIVITY_ADJUST`                                   |
| Fraccionamiento 3-6 tomas diarias                     | ✅     | M7 `MealType` + `buildDailyTemplate(mealCount)` + `enforceAOVE` |
| Fortalecimiento muscular 2 días/semana                | ✅     | M6 — ya implementado en H1 `useActivityTracker`                 |
| Sustitución Inteligente (Red_Meat → Legume/BlueFish)  | ✅     | M1 `suggestAlternative` + M2 `SUSTAINABLE_SUBSTITUTION` nudge   |
| Nudge Déficit: Cereales < 3/día (2026-07-23)          | ✅     | `CEREALS_DEFICIT` rule, cooldown 6h                             |
| Nudge Déficit: Frutas < 2/día (2026-07-23)            | ✅     | `FRUITS_DEFICIT` rule, cooldown 6h                              |
| Nudge Hortalizas: umbral 20h→14h (2026-07-23)         | ✅     | `VEGETABLE_NUDGE_HOUR_THRESHOLD` bajado de 20 a 14              |
| Scope Rule: nudge engine → shared/nudge/ (2026-07-23) | ✅     | Motor de reglas extraído a `src/shared/nudge/`                  |
| i18n: 0 strings hardcodeados (2026-07-23)             | ✅     | 12 strings → claves i18n + categorías en ES/EN                  |
| streakCount → Zustand (2026-07-23)                    | ✅     | Estado de racha movido a `activityStore`                        |
| Nudge Hortalizas: UX time gate (2026-07-24)           | ✅     | DailyViolations informa time gate 14:00 (2 mensajes i18n)       |
| Coverage: zombies eliminados (2026-07-24)             | ✅     | 4 zombies borrados, 5 imports corregidos, 3 Boy Scout tests     |
| Coverage: vistas al 100% stmts (2026-07-24)           | ✅     | ErrorBoundary, ScannerView, Container + tests (556→561 tests)   |
| Coverage: gaps fáciles (2026-07-24)                   | ✅     | installPrompt, rationValidator, planGenerator (561→578 tests)   |
| i18n: violaciones ES/EN (2026-07-24)                  | ✅     | formatViolation(), 8 claves, CATEGORY_DISPLAY_NAMES deprecado   |
| Coverage: 100% lines, 99.76% stmts (2026-07-24)       | ✅     | 578 tests (59 files), pipeline verde, Scope Rule 0 violaciones  |

## Leyenda

| Símbolo        | Significado                                 |
| -------------- | ------------------------------------------- |
| ✅ Completado  | Implementado con tests TDD                  |
| 🔶 Parcial     | Parte implementado, gap cubierto en roadmap |
| 🔜 Pendiente   | En roadmap, no iniciado                     |
| 📄 Documentado | Solo en especificación, no codificado       |
