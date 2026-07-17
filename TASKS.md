# TASKS.md — Nutri-Fit-Día: Features por Criticidad Funcional

Generado: 2026-07-17 | Rama: `develop` | Tests: 169 ✅ | Lint: 0 | Typecheck: limpio

---

## Estado Actual

| Capa | Estado |
|---|---|
| Nutritional Traffic Light | ✅ Implementado (FR-3.1, FR-3.2) — classificationService + occultSugarDetector, 22 tests |
| Metabolic Tracker | ✅ Implementado (FR-4.2, RF-02) — caloricTargetService con déficit condicional IMC > 25 |
| Med Diet Validator | ✅ Implementado — rationValidator cross-feature, DailyLog con Container/Presentational |
| Recipe Engine | ✅ Implementado — planGenerator + PlanContainer, sustainability badges integrados |
| Domain Types | ✅ Implementado — FoodCategory, TrafficLight, Notification, Zod schemas, domain errors |
| UI Primitives | ✅ Implementado — 7 componentes con tests unitarios |
| Activity Tracker | 🔶 Scaffold (types + store, sin lógica) |
| Nudge Engine | 🔶 Scaffold (types + store, sin reglas ni motor) |
| Sustainability | 🔶 Scaffold (solo types, sin scoring ni substitution) |

---

## Features por Criticidad

### CRITICAL — Seguridad clínica y corrección médica

| # | Tarea | ADR / Fuente | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| **C1** | **UserProfile + Filtro Fenotípico** | ADR-004, FR-4.1 | Implementar `UserProfileSchema` (Zod) con edad diagnóstico, IMC, género. Crear `useProfile` hook que persista en `trackerStore`. Conectar con `caloricTargetService` para el déficit condicional. | M | Ninguna |
| **C2** | **ErMedDietValidator completo** | FR-2.1, RF-01, ADR-005 | Implementar validador de raciones AESAN 2022 con gramos exactos por ración (40-60g pan, 150-200g pescado). Límites: cereales ≤4/día en restricción, AOVE 3-6/día, legumbres ≥4/semana. Alertas `SafetyAlert` para excesos. | L | ADR-005 (tipos listos) |
| **C3** | **Aviso Legal Dietista (RNF-01)** | SPECS_RF RNF-01 | Componente UI obligatorio: banner persistente "Este plan debe ser validado por un dietista-nutricionista colegiado". No bloqueante pero siempre visible en Dashboard y Plan. | S | Ninguna |
| **C4** | **SafetyAlert en UI** | ADR-008 | Implementar renderizado de `SafetyAlert` en ScannerContainer: si cereales > 4 en restricción → hard block. Si frutas alta carga glucémica → soft warning. Incluir acknowledge obligatorio. | M | C2 (necesita las reglas) |
| **C5** | **Monitoreo Biomarcadores** | FR-5.1 | Implementar `biomarkerTrackingService` para registro de glucosa, peso, IMC. Recalcular objetivo calórico si IMC cruza el umbral de 25. Tipos `GlucoseReading`, `WeightReading` ya existen. | M | C1 |

### HIGH — Valor funcional principal

| # | Tarea | ADR / Fuente | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| **H1** | **Activity Goal Tracker V1** | ADR-006, RF-03 | Implementar `useActivityTracker` hook con entrada manual de minutos semanales (150-300) y días de fuerza (≥2). Mostrar compliance % y streak en dashboard. Tipos y store ya existen. | M | Ninguna |
| **H2** | **Nudge Engine: Reglas Core** | ADR-008 | Implementar `evaluateRules()` con las 17 reglas de INFORME_ADR mapeadas a la taxonomía (SafetyAlert/SystemAction/BehavioralNudge). Incluir cooldown para evitar fatiga de notificaciones. Tipos y store ya existen. | L | C1 (necesita UserProfile) |
| **H3** | **Sustainability Scoring Core** | ADR-007, FR-2.2 | Implementar `computeEnvironmentalScore()` con constantes de emisiones AESAN/EAT-Lancet y pesos configurables. Conectar con RecipeEngine para ranking dual (salud + sostenibilidad). Tipos ya existen. | M | Ninguna |
| **H4** | **Dual Qualification Scanner** | ADR-003 + ADR-007 | Extender `ScanResult` con `environmentalScore` opcional. Modificar `classificationService` para devolver ambas puntuaciones. Backward-compatible: si no hay datos ambientales, solo clasificación de salud. | S | H3 |
| **H5** | **Metadata Cultural UNESCO** | FR-5.2 | Añadir campos `culturalMetadata` a `RecipeSchema`: valor biológico proteico, huella de carbono/hídrica, flag erMedDiet, procedencia geográfica. Mostrar badges informativos en RecipePlanDisplay. | S | Ninguna |
| **H6** | **NudgeEngine: SPECS_TECH Rules** | ADR-008, SPECS_TECH | Añadir reglas SPECS_TECH: nudge de hiperglucemia (caminata/receta fibra), ajuste HC por inactividad. Dependen de datos de actividad y glucosa. | S | H1, H2, C5 |
| **H7** | **BehavioralNudge UI** | ADR-008 | Implementar panel de nudges en dashboard: lista de `BehavioralNudge` activos con dismiss. Badge de contador. Historial de engagement. | M | H2 |

### MEDIUM — Completitud funcional

| # | Tarea | ADR / Fuente | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| **M1** | **Substitution Service** | ADR-007, SPECS_RF | Implementar `suggestAlternative(food): Food[]` — si carne roja → sugerir legumbres o pescado azul. Usar `PROTEIN_EMISSION_RATIOS` y `Seasonality` para ordenar alternativas. | S | H3 |
| **M2** | **Nudge: Sustitución Inteligente** | ADR-007 + ADR-008 | Integrar `substitutionService` con `NudgeEngine`: si `environmentalScore < 30` → disparar `BehavioralNudge` con alternativas sostenibles. | S | M1, H2 |
| **M3** | **Convivialidad (RNF-02)** | SPECS_RF RNF-02 | Añadir metadata de "comer en compañía" y técnicas culinarias a recetas. Mostrar sugerencias de preparación en RecipePlanDisplay. | S | H5 |
| **M4** | **Zero-Waste Module** | SPECS_TECH | Etiquetar ingredientes con "defectos estéticos" y productos locales/temporada. Extender `Food` schema con `isUglyProduce`, `isZeroWaste`. | S | H3 |
| **M5** | **FR-MATRIX Sync** | FR-MATRIX | Actualizar matriz de trazabilidad: marcar RF-02 como ✅ (ya implementado con condicional IMC > 25), reflejar estado real de cada feature. | XS | Ninguna |

### LOW — Pulido y experiencia

| # | Tarea | ADR / Fuente | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| **L1** | **Bacalao Priority Tag** | SPECS_TECH | Etiquetar Bacalao como "High_Protein_Low_Fat" (0.7% grasa) y priorizarlo en planGenerator como proteína de alta prioridad. | XS | Ninguna |
| **L2** | **Dashboard Unificado** | — | Refactor `App.tsx` para un dashboard unificado con las 4 pestañas actuales + Activity + Nudges + Sustainability. Layout responsive. | L | H1, H4, H7 |
| **L3** | **i18n ES/EN** | — | Extraer todos los strings de UI a archivos de traducción. Inglés por defecto, español como locale principal. | L | Ninguna |
| **L4** | **E2E Smoke Tests** | — | Tests end-to-end con Playwright: flujo completo de escaneo → clasificación → registro → plan semanal. | M | L2 |
| **L5** | **A11y Audit** | RNF-03 | Auditoría de accesibilidad WCAG 2.1 AA: focus management, aria labels, contraste, navegación por teclado. | M | Ninguna |

---

## Orden Recomendado de Ejecución

```
Fase 1 — Seguridad Clínica (CRITICAL)
  C1 → C2 → C4 → C3 → C5
  (UserProfile → ErMedDietValidator → SafetyAlert UI → Aviso Legal → Biomarcadores)

Fase 2 — Valor Principal (HIGH)
  H1 → H3 → H4 → H5 → H2 → H7 → H6
  (Activity → Sustainability → Dual Scan → UNESCO → Nudge Engine → Nudge UI → SPECS_TECH)

Fase 3 — Completitud (MEDIUM)
  M1 → M2 → M3 → M4 → M5

Fase 4 — Pulido (LOW)
  L1 → L2 → L3 → L4 → L5
```

---

## Notas

- **FR-MATRIX desactualizada**: RF-02 (déficit 600 kcal condicional a IMC > 25) ya está implementado en `caloricTargetService.ts` con tests. La matriz lo marca como ⚠️ Pendiente. Corregir en M5.
- **169 tests verdes**: cualquier feature nueva debe mantener el TDD estricto (RED → GREEN → TRIANGULATE → REFACTOR).
- **Scope Rule**: código usado por 1 feature → dentro de esa feature. Usado por 2+ → `shared/` con estructura de domain module.
- **ADR-003 ScannerAdapter**: la interfaz ya existe. `MockScannerAdapter` implementado. La extensión para Dual Qualification (H4) es backward-compatible.
- **Supabase reservado V2**: sin imports en V1. La app funciona completamente offline con datos estáticos del catálogo.
