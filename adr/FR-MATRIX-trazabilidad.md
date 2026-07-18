# Matriz de Trazabilidad FR → Código

Documentos fuente:
- `INFORME_ADR.md` — Especificación Funcional (FR-1.x → FR-5.x)
- `SPECS_TECH.md` — Manual Técnico erMedDiet
- `SPECS_RF.md` — Requisitos Funcionales y No Funcionales (RF-01 → RF-03, RNF-01 → RNF-03)

Generada: 2026-07-12 | Actualizada: 2026-07-18 | Rama: `develop` | Tests: 273 ✅

## Estado por Requisito

| ID | Descripción | Fuente | Estado | Cobertura |
|---|---|---|---|---|
| **FR-1.1** | Pilares Estratégicos (AESAN/PREDIMED-Plus) | INFORME_ADR | 📄 Documentado | — |
| **FR-1.2** | Transición Nutricional (patrones vs calorías) | INFORME_ADR | 📄 Documentado | — |
| **FR-2.1** | Cereales: límite 4 raciones en restricción | INFORME_ADR, SPEC_TECH, SPECS_RF | ✅ Completado | `RATION_LIMITS` + C2 ErMedDietValidator |
| **FR-2.2** | Sostenibilidad: puntuación ambiental + Zero-Waste | INFORME_ADR, SPEC_TECH | ✅ Completado | H3 `computeEnvironmentalScore` + `pickSustainableFood` |
| **FR-3.1** | Semáforo Nutricional Verde/Naranja/Rojo | Ambos | ✅ Completado | `classificationService.ts` — 22 tests |
| **FR-3.2** | Detección azúcares ocultos (string-match) | Ambos | ✅ Completado | `occultSugarDetector.ts` — 9 tests |
| **FR-4.1** | Filtro Fenotípico (edad diagnóstico, IMC) | INFORME_ADR | ✅ Completado | C1 `UserProfileSchema` + `diagnosisAge` + trackerStore |
| **FR-4.2** | Déficit 600 kcal + fraccionamiento 3-6 tomas | Ambos | 🔶 Parcial | `caloricTargetService.ts` (déficit ✅). Fraccionamiento → M7 |
| **FR-4.3** | Activity Tracking + Nudges + reajuste HC | SPEC_TECH, INFORME_ADR | 🔶 Parcial | H1 (minutos ✅), H2 (nudges ✅). Fortalecimiento → M6 |
| **FR-5.1** | Validación profesional + monitoreo biomarcadores | Ambos | ✅ Completado | C3 LegalDisclaimer + C5 `biomarkerTrackingService` |
| **FR-5.2** | Metadata cultural + sostenibilidad (UNESCO) | INFORME_ADR | ✅ Completado | H5 `CulturalMetadataSchema` + badges en PlanView |
| **RF-01** | Menús AESAN: recetas con raciones gramadas | SPECS_RF | ✅ Completado | C2 `AESAN_GRAM_STANDARDS` + `validateFoodPortions` |
| **RF-02** | Déficit 600 kcal **solo si IMC > 25** (condicional) | SPECS_RF | ✅ Completado | `caloricTargetService.ts` — IMC_NORMAL_MAX=25 |
| **RF-03** | Actividad física: 150-300 min/semana + 2 días fuerza | SPECS_RF | 🔶 Parcial | H1 (minutos ✅). Fortalecimiento → M6 |
| **RNF-01** | Aviso legal: validación por Dietista-Nutricionista | SPECS_RF | ✅ Completado | C3 `LegalDisclaimer` en Dashboard + Plan |
| **RNF-02** | Convivialidad: comer en compañía, técnicas culinarias | SPECS_RF, SPEC_TECH | 🔶 Parcial | H5 tipos (✅). UI sugerencias → M3 |
| **RNF-03** | Sostenibilidad: productos locales, temporada, mínimos envases | SPECS_RF, SPEC_TECH | ✅ Completado | H3 `SCORING_WEIGHTS` + `Seasonality` + `Proximity` |

## SPEC_TECH: Nueva información verificada

| Requisito SPEC_TECH | Estado | Cobertura |
|---|---|---|
| Dual Qualification (salud + ambiental) | ✅ | H4 `ClassificationResult.environmentalScore` |
| Nudge de Hiperglucemia (glucosa → caminata/fibra) | ✅ | H2 PR2 `HYPERGLYCEMIA_NUDGE` |
| Optimización Bacalao (0.7% grasa) | ✅ | H2 PR3 `FISH_COD_TAG` + `classificationService` GREEN |
| Ajuste HC por actividad (< 150 min → reducir HC) | ✅ | H2 PR3 `HC_INACTIVITY_ADJUST` |
| Fraccionamiento 3-6 tomas diarias | 🔜 | M7 |
| Fortalecimiento muscular 2 días/semana | 🔜 | M6 |
| Sustitución Inteligente (Red_Meat → Legume/BlueFish) | 🔜 | M1 |

## Leyenda

| Símbolo | Significado |
|---|---|
| ✅ Completado | Implementado con tests TDD |
| 🔶 Parcial | Parte implementado, gap cubierto en roadmap |
| 🔜 Pendiente | En roadmap, no iniciado |
| 📄 Documentado | Solo en especificación, no codificado |
