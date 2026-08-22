# ADR-014: Refactorización de Deuda de Clean Architecture — DI, Validación de Persistencia y Trazabilidad AESAN

**Status:** Accepted — Implemented 2026-08-22
**Date:** 2026-08-22
**Deciders:** darkmagic76, gentle-orchestrator

## Context

ADR-012 dejó la migración a Clean Architecture **aceptada e implementada**, pero una auditoría posterior sobre `develop` (`1c7e8e5`) — verificada contra el código real y el pipeline ejecutado (933 tests, typecheck, lint, format: todo verde) — reveló que varios objetivos quedaron **parcialmente aplicados**, además de deuda de trazabilidad documental frente al informe AESAN 2022.

La verificación distinguió deliberadamente entre **afirmaciones documentales** (cifras de `TASKS.md`) y **hechos ejecutados**: se corrió el pipeline completo para no planificar sobre premisas sin comprobar.

| Hallazgo | Área                       | Estado verificado en código                                                                                                  |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A1       | DI de containers           | 5 containers importaban `@infrastructure/stores` directo, violando la regla de dependencias y la convención `useContainer()` |
| A3       | Validación de persistencia | `z.any()` en `planStore`, `trackerStore`, `logStore` — sin validación estructural en rehidratación (contradice ADR-002)      |
| C1       | Trazabilidad clínica       | `FISH max:7` documentado como "decisión interna" pero sin fundamento explícito; AESAN pone piso ≥3 sin techo                 |
| C2       | Comentario fantasma        | `classificationService.ts` prometía un `whole-grain override` inexistente                                                    |
| C3       | Atribución AESAN           | ADR-007 y `TASKS.md` atribuían a AESAN valores numéricos (pesos, CO₂eq) que AESAN no publica                                 |

### Alcance y método

- Un único ADR-014 conceptual, implementado en **3 slices encadenados** (feature-branch-chain, rama tracker `adr-014`), cada uno revisable y dentro del presupuesto de 400 líneas.
- **TDD estricto** (RED → GREEN → REFACTOR) para todo cambio de comportamiento.
- Refactor de **calidad**, no rescate: la base ya funcionaba; no se cambiaron reglas de negocio a escondidas.

## Decision

### Slice 1 — Desacoplar containers de la infraestructura (A1)

Cada feature deja de importar `@infrastructure/stores` directo y accede a su store mediante un **hook local en `features/<x>/hooks/`** que lo encapsula.

**Decisión de diseño (alternativas consideradas):** se descartó exponer los stores de UI como puertos en el `Container`. Los stores Zustand contienen estado de formulario/presentación que no pertenece al puerto de dominio; exponerlos habría inflado el `Container` con estado de UI y superado el presupuesto sin beneficio real. El hook por feature respeta la **Scope Rule** (cada feature es dueña de su acceso) y elimina el acoplamiento `feature → infrastructure` sin sobre-ingeniería. Los stores siguen siendo Zustand; los hooks son passthroughs transparentes, por lo que los tests existentes que mockean el store siguen intactos.

Containers migrados: `MetabolicTracker`, `MedDietValidator`, `RecipeEngine`, `NutritionalTrafficLight`, `NudgeEngine`.

### Slice 2 — Reemplazar `z.any()` por schemas de dominio (A3)

Se crean schemas Zod de dominio como **única fuente de verdad** y se reusan en la capa de persistencia:

- `CaloricTargetOutputSchema` (`caloricTargetService.ts`)
- `RationViolationSchema` + `RationValidationResultSchema` (`rationValidator.ts`, reusando `FoodCategorySchema`)
- `planStore`: `food → FoodSchema`; `dailyResults`/`weeklyResult → RationValidationResultSchema`
- `logStore`: `todayValidation → RationValidationResultSchema`
- `trackerStore`: `caloricTarget → CaloricTargetOutputSchema`

**Decisión de diseño — `profileError`:** se valida su **forma** (`{name, message, code, context?}`), no se reconstruye la instancia de clase. Un `ValidationError` serializado pierde `instanceof` en el round-trip JSON, y el valor rehidratado **nunca se consume como instancia**: `calculateTarget()` siempre produce un `ValidationError` fresco en runtime, y la UI consume el error por sus campos de datos (`code → i18n`). No es deuda escondida: es una decisión consciente, documentada en el código con un punto de extensión (`.transform()`) por si alguna vez se necesitara reconstrucción.

El schema estricto **cazó un test laxo real** (`weeklyResult: {}` que `z.any()` enmascaraba): se corrigió y se añadió un test negativo que afirma el rechazo.

### Slice 3 — Reconciliación de trazabilidad AESAN (C1/C2/C3)

Solo documentación y comentarios — **cero cambios de semántica clínica**.

**Decisión de diseño — no cambiar valores clínicos:** el `FISH max:7` y el techo son **decisiones de producto**, no reglas AESAN (AESAN fija piso ≥3/semana, sin máximo). Cambiar el valor habría alterado el comportamiento de validación y roto tests sin justificación clínica. Se **documenta** el fundamento (equilibrio de proteína animal) y se aclara explícitamente que no es un límite AESAN.

- C1: comentarios formales en `clinical.ts` (`FISH_EXCESS_THRESHOLD`) y `rationValidator.ts`; corrección de la inconsistencia `SPECS_TECH` (`3-4/sem` → `≥3 piso AESAN + techo interno 7`).
- C2: comentario honesto en `classificationService.ts` — cereales por defecto `ORANGE`; la distinción grano entero/refinado es trabajo futuro (sin atributo `isWholeGrain`, diferido por ADR-005).
- C3: `ADR-007` y `TASKS.md` H3 — los pesos 50/30/20 son decisión de diseño interna; las cifras de huella de carbono derivan de Poore & Nemecek (2018) / EAT-Lancet, no de AESAN.

## Consequences

### Positivas

- La regla de dependencias de Clean Architecture se aplica completamente en la capa de presentación: ninguna feature importa infraestructura directo.
- La rehidratación de persistencia tiene validación estructural real; se cerró la brecha frente al objetivo de ADR-002.
- La trazabilidad AESAN es honesta: origen cualitativo (AESAN) separado de valores numéricos (decisiones de diseño / fuentes primarias).
- Cero deuda técnica escondida: cada decisión límite (profileError, max:7) queda documentada con su razón y su punto de extensión.

### Neutras / costos

- Un hook por feature añade un archivo pequeño por feature (passthrough). Es superficie mínima y alineada con la Scope Rule.
- El `profileError` no reconstruye instancia; si en el futuro se necesita, el schema de forma es el punto de extensión natural.

### Verificación

- 944 tests verdes (933 base + hook de nudge + test negativo de schema), typecheck / lint / format limpios, cobertura functions 100 % / statements 98.68 %.
- Entrega bajo política ordinaria del repositorio (Husky `pnpm quality` en pre-commit/pre-push); RDD desactivado a scope clone-local para este repo.

## Related

- ADR-002 — Modelo de dominio con Zod (objetivo de validación runtime que este ADR completa)
- ADR-005 — Modelo canónico de categorías (difiere la distinción grano entero/refinado)
- ADR-007 — Sustainability scoring (atribución corregida en C3)
- ADR-012 — Refactor Clean Architecture por capas (este ADR completa su migración DI parcial)
- `INFORME_RECOMENDACIONES_DIETETICAS.pdf` — AESAN 2022, fuente primaria verificada
