# Matriz de Trazabilidad FR → Código

Documentos fuente:
- `docs/INFORME_ADR.md` — Especificación Funcional (FR-1.x → FR-5.x)
- `docs/SPEC_TECH_INTERVENCCIONES_DIGITALES_DT2.md` — Manual Técnico erMedDiet
- `docs/SPECS_RF.md` — Requisitos Funcionales y No Funcionales (RF-01 → RF-03, RNF-01 → RNF-03)

Generada: 2026-07-12 | Actualizada: 2026-07-12

## Estado por Requisito

| ID | Descripción | Fuente | Estado | Cobertura |
|---|---|---|---|---|
| **FR-1.1** | Pilares Estratégicos (AESAN/PREDIMED-Plus) | INFORME_ADR | 📄 Documentado | — |
| **FR-1.2** | Transición Nutricional (patrones vs calorías) | INFORME_ADR | 📄 Documentado | — |
| **FR-2.1** | Cereales: límite 4 raciones en restricción | INFORME_ADR, SPEC_TECH, SPECS_RF | 🔜 Pendiente | ErMedDietValidator |
| **FR-2.2** | Sostenibilidad: puntuación ambiental + Zero-Waste | INFORME_ADR, SPEC_TECH | 🔜 Pendiente | RecipeEngine |
| **FR-3.1** | Semáforo Nutricional Verde/Naranja/Rojo | Ambos | ✅ Completado | `classificationService.ts` — 13 tests |
| **FR-3.2** | Detección azúcares ocultos (string-match) | Ambos | ✅ Completado | `occultSugarDetector.ts` — 9 tests |
| **FR-4.1** | Filtro Fenotípico (edad diagnóstico, IMC) | INFORME_ADR | 🔶 Tipos listos | `UserProfileSchema`, pendiente servicio |
| **FR-4.2** | Déficit 600 kcal + fraccionamiento 3-6 tomas | Ambos | ✅ Completado | `caloricTargetService.ts` — 7 tests |
| **FR-4.3** | Activity Tracking + Nudges + reajuste HC | SPEC_TECH, INFORME_ADR | 🔜 Pendiente | Pendiente de diseño |
| **FR-5.1** | Validación profesional + monitoreo biomarcadores | Ambos | 🔶 Tipos listos | `GlucoseReading`, `WeightReading` |
| **FR-5.2** | Metadata cultural + sostenibilidad (UNESCO) | INFORME_ADR | 🔜 Pendiente | Pendiente de diseño |
| **RF-01** | Menús AESAN: recetas con raciones gramadas | SPECS_RF | 🔜 Pendiente | RecipeEngine |
| **RF-02** | Déficit 600 kcal **solo si IMC > 25** (condicional) | SPECS_RF | ⚠️ Pendiente | Refinar `caloricTargetService` |
| **RF-03** | Actividad física: 150-300 min/semana + 2 días fuerza | SPECS_RF | 🔜 Pendiente | ActivityTracker |
| **RNF-01** | Aviso legal: validación por Dietista-Nutricionista | SPECS_RF | 🔜 Pendiente | UI Component |
| **RNF-02** | Convivialidad: comer en compañía, técnicas culinarias | SPECS_RF, SPEC_TECH | 🔜 Pendiente | RecipeEngine |
| **RNF-03** | Sostenibilidad: productos locales, temporada, mínimos envases | SPECS_RF, SPEC_TECH | 🔜 Pendiente | RecipeEngine |

## Nueva información clave de SPEC_TECH y SPECS_RF

### Del Manual Técnico (SPEC_TECH):
- **Dual Qualification**: el escáner debe evaluar salud metabólica + impacto ambiental simultáneamente
- **Nudge de Hiperglucemia**: si glucosa elevada → sugerir caminata inmediata o receta rica en fibra soluble
- **Optimización Bacalao**: priorizar como "proteína pura" (0.7% grasa) en planes semanales
- **Zero-Waste Module**: etiquetar ingredientes con "defectos estéticos" y productos locales/temporada
- **Ajuste HC por actividad**: si actividad nula, reducir carga de carbohidratos para prevenir picos

### De los Requisitos (SPECS_RF):
- **RF-01**: gramos exactos por ración (ej. 40-60g pan integral) — no solo raciones, sino pesos concretos
- **RF-02**: el déficit 600 kcal es **condicional** a IMC > 25, no automático
- **RF-03**: métricas de actividad física muy concretas (150-300 min moderada, 2 días fuerza)
- **RNF-01**: requerimiento UI obligatorio (no es opcional)
- **RNF-02/RNF-03**: criterios de diseño para el motor de recetas

## Implicaciones para el roadmap

| Acción | Requisitos afectados |
|---|---|
| ✅ Ya implementado | FR-3.1, FR-3.2, FR-4.2 (parcial) |
| 🔜 ErMedDietValidator | FR-2.1, RF-01 |
| ⚠️ Refactor `caloricTargetService` | RF-02 (hacer condicional IMC > 25) |
| 🔜 ActivityTracker + NudgeEngine | FR-4.3, RF-03 |
| 🔜 RecipeEngine dual-sostenibilidad | FR-2.2, FR-5.2, RNF-02, RNF-03 |
| 🔜 UI LegalBanner + ProfileContainer | RNF-01, FR-4.1, FR-5.1 |

## Leyenda

| Símbolo | Significado |
|---|---|
| ✅ Completado | Implementado con tests TDD |
| ⚠️ Pendiente | Refactor necesario |
| 🔶 Tipos listos | Modelo de datos creado, falta servicio |
| 🔜 Pendiente | No iniciado |
| 📄 Documentado | Solo en especificación, no codificado |
