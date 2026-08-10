# REFACTOR_ARCH.md — Informe de Refactorización Arquitectónica

**Fecha:** 2026-08-07  
**Autor:** Auditoría automatizada (SDD)  
**Skills auditados:** `skills/clean-architecture-audit.md` + `skills/architecture-decisions.md`  
**Estado:** 809 tests pasando | 79 archivos de test | 12 violaciones detectadas | Fases 1-4 completadas + Phase 1-2 (type safety) completadas

---

## 1. Executive Summary

Se auditaron **7 principios de Clean Architecture** y **4 pilares de Architecture Decisions** contra el código fuente completo de NutreFitDia. Se encontraron **12 violaciones** (7 HIGH, 4 MEDIUM, 1 LOW) que afectan la regla de dependencias, la inversión de control, y los barrels cross-layer.

**Progreso de refactorización:**

- ✅ **Fase 1 completada** (2026-08-07): Rotas dependencias Infra→Features (planGenerator, sugarAliases)
- ✅ **Fase 2 completada** (2026-08-07): Composition Root activada via React Context
- ✅ **Fase 3 completada** (2026-08-07): Application layer limpia (errors → domain, parseNumeric → domain, calculateTarget sin Translations)
- ✅ **Fase 4 completada** (2026-08-07): Barrels cross-layer limpiados (shared/stores, shared/utils eliminados, feature barrels limitados a Container, ProfileInput movido a application/dtos/)
- ✅ **Phase 1 completada** (2026-08-10): Decouple stores (logStore 100% independiente de trackerStore), extract Container port a `application/ports/container.ts`, move `useNudgeTrigger` a `infrastructure/hooks/`. 809 tests, `pnpm quality` limpio.
- ✅ **Phase 2 completada** (2026-08-10): Type safety — eliminado `any` de `exportData` (StateExporter port), fixeados 8× `as any` en tests (`FakeNotificationRepo` implementa port completo), removido `as unknown as` innecesario en fixtures, documentado singleton `container` con JSDoc. 809 tests, `pnpm quality` limpio.

**Dominio:** ✅ Puro, rico, sin anemia. Reglas de negocio correctamente aisladas.  
**Application:** ✅ Limpio. Use cases no importan de `@shared/` (excepto datos de dominio compartidos).  
**Infrastructure:** ✅ Sin imports directos desde features.  
**Composition Root:** ✅ Activa. Features consumen el container via useContainer().

**Impacto:** Las 12 violaciones originales han sido resueltas. Arquitectura limpia y escalable.

---

## 2. Audit Scope

### Skills verificados

| Skill                         | Principios auditados                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clean-architecture-audit.md` | 7 principios: regla de dependencias, modelo de dominio explícito, casos de uso, puertos/adaptadores, gestión de errores, testing, inversión de dependencias |
| `architecture-decisions.md`   | 4 pilares: Security by Design, SRP + Modularity, Domain Isolation, Organizational Scalability                                                               |

### Archivos auditados (source)

**Dominio (15 archivos):**

- `src/domain/caloricTargetService.ts`
- `src/domain/profileService.ts`
- `src/domain/rationValidator.ts`
- `src/domain/imc.ts`
- `src/domain/nudgeContextBuilder.ts`
- `src/domain/nudgeEvaluator.ts`
- `src/domain/cooldownTracker.ts`
- `src/domain/sustainability/*` (4 archivos)
- `src/domain/index.ts` (barrel)

**Application (6 archivos):**

- `src/application/use-cases/calculateTarget.ts`
- `src/application/use-cases/evaluateNudges.ts`
- `src/application/use-cases/exportData.ts`
- `src/application/ports/*` (5 puertos)
- `src/application/dtos/` (vacío)

**Infrastructure (10 archivos):**

- `src/infrastructure/compositionRoot.ts`
- `src/infrastructure/stores/planStore.ts`
- `src/infrastructure/stores/trackerStore.ts`
- `src/infrastructure/ml/MockScannerAdapter.ts`
- `src/infrastructure/adapters/*` (5 adaptadores)
- `src/infrastructure/env.ts`

**Features (7 features × 3-5 archivos cada una):**

- `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx`
- `src/features/nudge-engine/NudgeEngineContainer.tsx`
- `src/features/recipe-engine/RecipeEngineContainer.tsx`
- `src/features/activity-tracker/index.ts`
- `src/features/nudge-engine/index.ts`

**Shared:**

- `src/shared/stores/index.ts`
- `src/shared/utils/index.ts`
- `src/shared/utils/sanitize.ts`
- `src/shared/hooks/useExportData.ts`
- `src/shared/errors.ts`

**Root:**

- `src/main.tsx`

---

## 3. Violations Matrix

| #   | Principio                       | Violación                                                                                                                          | Severidad | Archivo                                                                | Pilar afectado             |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- | -------------------------- |
| 1   | P1b (Application → Ports)       | `exportData` usa interfaz inline `StoreSnapshot { getState(): any }` en vez de los 5 puertos definidos                             | HIGH      | `application/use-cases/exportData.ts:3-6`                              | SRP + Modularity           |
| 2   | P1b (Application → Ports)       | `calculateTarget` importa de `@shared/` (presentación): `i18n/types`, `errors`, `utils`                                            | HIGH      | `application/use-cases/calculateTarget.ts:3-5`                         | Domain Isolation           |
| 3   | P1c (Infra → Ports)             | `planStore` importa `generateWeeklyPlan` desde `features/recipe-engine/services/`                                                  | HIGH      | `infrastructure/stores/planStore.ts:7`                                 | SRP + Modularity           |
| 4   | P1c (Infra → Ports)             | `MockScannerAdapter` importa `SUGAR_ALIASES` desde `features/nutritional-traffic-light/data/`                                      | HIGH      | `infrastructure/ml/MockScannerAdapter.ts:2`                            | SRP + Modularity           |
| 5   | P7a (Inversión de Dependencias) | Composition root es código muerto: `void container` en `main.tsx`                                                                  | HIGH      | `main.tsx:11`                                                          | SRP + Modularity           |
| 6   | P7a (Inversión de Dependencias) | `trackerStore.calculateTarget()` crea adapter inline en vez de consumir `container.biomarkerRepo`                                  | HIGH      | `infrastructure/stores/trackerStore.ts:91-99`                          | SRP + Modularity           |
| 7   | P7a (Inversión de Dependencias) | `useExportData` importa 6 stores de Zustand directamente, bypassando el container                                                  | HIGH      | `shared/hooks/useExportData.ts:2-7`                                    | SRP + Modularity           |
| 8   | P3a (Casos de Uso)              | `calculateTarget` hace parsing inline con `parseNumeric` (líneas 54-93) en vez de delegar a un domain service                      | MEDIUM    | `application/use-cases/calculateTarget.ts:54-93`                       | Domain Isolation           |
| 9   | P5b (Gestión de Errores)        | `shared/stores/index.ts` barrel cruza de infra → shared: `export * from '../../infrastructure/stores/index'`                       | MEDIUM    | `shared/stores/index.ts`                                               | Organizational Scalability |
| 10  | P5b (Gestión de Errores)        | `shared/utils/index.ts` barrel cruza de domain → shared: re-exporta `domain/imc` y `domain/enum`                                   | MEDIUM    | `shared/utils/index.ts`                                                | Organizational Scalability |
| 11  | Convenciones (Nombres)          | Feature barrels exportan más que el Container: `nudge-engine/index.ts` y `activity-tracker/index.ts` exportan stores, hooks, types | MEDIUM    | `features/nudge-engine/index.ts`, `features/activity-tracker/index.ts` | Organizational Scalability |
| 12  | P5a (Gestión de Errores)        | `application/dtos/` está vacío. DTOs co-locados con consumers en vez de centralizados                                              | LOW       | `application/dtos/`                                                    | SRP + Modularity           |

---

## 4. Refactoring Phases

### Fase 1 — Romper dependencias Infra → Features (violaciones 3, 4)

**Objetivo:** Eliminar imports desde `infrastructure/` hacia `features/`. La regla de dependencias es unidireccional: `presentation → application → domain ← infrastructure`.

**Archivos a modificar:**

- `src/infrastructure/stores/planStore.ts:7` — mover `generateWeeklyPlan` a `domain/` o `application/`
- `src/infrastructure/ml/MockScannerAdapter.ts:2` — mover `SUGAR_ALIASES` a `shared/data/` o `domain/`

**Riesgo:** MEDIO. `generateWeeklyPlan` usa tipos de dominio (`WeeklyPlan`, `FoodCategory`) y servicios de sostenibilidad. Moverlo a `domain/` es natural, pero requiere verificar que no importe de `@shared/`.

**Tests que deben pasar:**

- `pnpm test:run` (803 tests)
- `pnpm build` (tsc -b + vite build)
- `planStore.test.ts` — verificar que `generatePlan()` sigue funcionando
- `MockScannerAdapter.test.ts` — verificar que `scan()` sigue detectando azúcares

---

### Fase 2 — Activar Composition Root (violaciones 5, 6, 7)

**Objetivo:** Que el container sea el **único punto** donde se wirean adapters → use cases. Los feature containers deben consumir el container, no crear adapters inline.

**Archivos a modificar:**

- `src/main.tsx:11` — eliminar `void container`, inyectar container via React Context
- `src/infrastructure/stores/trackerStore.ts:91-99` — reemplazar adapter inline con `container.biomarkerRepo`
- `src/shared/hooks/useExportData.ts:2-7` — reemplazar imports directos de stores con `container`
- `src/infrastructure/compositionRoot.ts` — verificar que expone todos los use cases y adapters necesarios

**Riesgo:** ALTO. Cambiar cómo se inyectan dependencias en stores y hooks puede romper el flujo de datos. Requiere:

1. Crear un `ContainerContext` en React
2. Wrappea `<App />` con `<ContainerProvider value={container}>`
3. Crear un hook `useContainer()` que consuma el contexto
4. Refactorizar `trackerStore.calculateTarget()` para usar `useContainer().biomarkerRepo`
5. Refactorizar `useExportData` para usar `useContainer().exportData()`

**Alternativa pragmática:** Si el container es un singleton (ya lo es: `export const container = createContainer()`), los stores/hooks pueden importarlo directamente sin React Context. Esto es más simple pero menos testeable.

**Tests que deben pasar:**

- `compositionRoot.test.ts` — verificar que el container wirea correctamente
- `trackerStore.test.ts` — verificar que `calculateTarget()` sigue funcionando
- `useExportData.test.ts` — verificar que la exportación sigue funcionando
- `MetabolicTrackerContainer.test.tsx` — verificar que el flujo completo funciona

---

### Fase 3 — Limpiar Application → Shared (violaciones 1, 2, 8)

**Objetivo:** Que `application/` no dependa de `@shared/` (presentación). Los use cases deben recibir puertos y tipos de dominio, no imports de presentación.

**Archivos a modificar:**

- `src/application/use-cases/calculateTarget.ts:3-5` — eliminar imports de `@shared/i18n/types`, `@shared/errors`, `@shared/utils`
- `src/application/use-cases/exportData.ts:3-6` — reemplazar `StoreSnapshot` con los 5 puertos reales
- `src/shared/utils/sanitize.ts` — mover `parseNumeric` a `domain/` o crear un port de input parsing
- `src/shared/errors.ts` — mover `ValidationError` a `domain/errors.ts`

**Riesgo:** MEDIO. `ValidationError` es usado en 20+ archivos. Moverlo requiere actualizar todos los imports. Alternativa: crear `domain/errors.ts` con `ValidationError` y re-exportar desde `shared/errors.ts` para backward compatibility.

**Tests que deben pasar:**

- `calculateTarget.test.ts` — verificar que el use case sigue funcionando
- `exportData.test.ts` — verificar que la exportación sigue funcionando
- `sanitize.test.ts` — verificar que `parseNumeric` sigue funcionando
- `pnpm typecheck` — verificar que no hay imports rotos

---

### Fase 4 — Limpiar barrels cross-layer (violaciones 9, 10, 11, 12)

**Objetivo:** Los barrels deben limitarse a subcarpetas del mismo nivel. No exportar a través de capas.

**Archivos a modificar:**

- `src/shared/stores/index.ts` — eliminar o re-exportar solo tipos (no stores de infra)
- `src/shared/utils/index.ts` — eliminar re-exports de `domain/imc` y `domain/enum`
- `src/features/nudge-engine/index.ts` — exportar solo `NudgeEngineContainer`
- `src/features/activity-tracker/index.ts` — exportar solo `ActivityTrackerContainer`
- `src/application/dtos/` — mover DTOs aquí desde `calculateTarget.ts` y `caloricTargetService.ts`

**Riesgo:** BAJO. Los barrels son solo re-exports. Cambiarlos requiere actualizar los imports en los archivos que los consumen, pero no cambia la lógica.

**Tests que deben pasar:**

- `pnpm typecheck` — verificar que no hay imports rotos
- `pnpm test:run` — verificar que todos los tests siguen pasando
- `pnpm build` — verificar que el build funciona

---

## 5. Per-Phase Detail

### Fase 1 — Detalle

**Violación 3:** `planStore.ts:7` importa `generateWeeklyPlan` desde `features/recipe-engine/services/planGenerator`.

**Solución:** Mover `planGenerator.ts` de `features/recipe-engine/services/` → `domain/planGenerator.ts` o `application/services/planGenerator.ts`.

**Verificación:**

- `planGenerator.ts` solo importa de `domain/` (tipos `WeeklyPlan`, `FoodCategory`, servicios de sostenibilidad). ✅ Puede vivir en `domain/`.
- No importa de `@shared/`, `@infrastructure/`, ni React. ✅

**Pasos:**

1. `mv src/features/recipe-engine/services/planGenerator.ts src/domain/planGenerator.ts`
2. Actualizar import en `planStore.ts:7`: `import { generateWeeklyPlan } from '@domain/planGenerator'`
3. Actualizar import en `planGenerator.test.ts` (si existe)
4. `pnpm typecheck && pnpm test:run`

---

**Violación 4:** `MockScannerAdapter.ts:2` importa `SUGAR_ALIASES` desde `features/nutritional-traffic-light/data/sugarAliases`.

**Solución:** Mover `sugarAliases.ts` de `features/nutritional-traffic-light/data/` → `shared/data/sugarAliases.ts` o `domain/sugarAliases.ts`.

**Verificación:**

- `SUGAR_ALIASES` es un array de strings (datos de dominio). ✅ Puede vivir en `domain/` o `shared/data/`.
- Es usado por `MockScannerAdapter` (infra) y `occultSugarDetector` (feature). Si 2+ features lo usan, va a `shared/`. Si solo 1 feature + infra lo usan, va a `domain/`.

**Pasos:**

1. `mv src/features/nutritional-traffic-light/data/sugarAliases.ts src/shared/data/sugarAliases.ts`
2. Actualizar import en `MockScannerAdapter.ts:2`: `import { SUGAR_ALIASES } from '@shared/data/sugarAliases'`
3. Actualizar import en `occultSugarDetector.ts` (si existe)
4. `pnpm typecheck && pnpm test:run`

---

### Fase 2 — Detalle

**Violación 5:** `main.tsx:11` tiene `void container` — el container se importa y se descarta.

**Solución:** Inyectar el container via React Context.

**Pasos:**

1. Crear `src/shared/context/ContainerContext.tsx`:
   ```tsx
   import { createContext, useContext } from 'react';
   import { container } from '@infrastructure/compositionRoot';

   const ContainerContext = createContext(container);

   export const ContainerProvider = ContainerContext.Provider;
   export const useContainer = () => useContext(ContainerContext);
   ```
2. En `main.tsx`, wrappea `<App />` con `<ContainerProvider value={container}>`
3. Eliminar `void container` de `main.tsx:11`

---

**Violación 6:** `trackerStore.ts:91-99` crea un `BiomarkerRepository` inline.

**Solución:** Consumir `container.biomarkerRepo` en vez de crear adapter inline.

**Pasos:**

1. Importar `useContainer` en `trackerStore.ts`
2. Reemplazar líneas 91-99 con: `const biomarkerRepo = useContainer().biomarkerRepo`
3. **Problema:** `trackerStore` es un Zustand store, no un componente React. No puede usar hooks.
4. **Alternativa:** Importar `container` directamente (es un singleton): `import { container } from '@infrastructure/compositionRoot'`
5. Usar `container.biomarkerRepo` en `calculateTarget()`

---

**Violación 7:** `useExportData.ts:2-7` importa 6 stores de Zustand directamente.

**Solución:** Consumir `container.exportData()` en vez de importar stores.

**Pasos:**

1. Importar `useContainer` en `useExportData.ts`
2. Reemplazar líneas 2-7 y 25-32 con: `const json = useContainer().exportData()`
3. Verificar que `container.exportData()` usa los adapters correctos (ya lo hace en `compositionRoot.ts:51-59`)

---

### Fase 3 — Detalle

**Violación 2:** `calculateTarget.ts:3-5` importa de `@shared/`.

**Solución:**

- Mover `parseNumeric` a `domain/inputParsing.ts` o crear un port `InputParser`
- Mover `ValidationError` a `domain/errors.ts`
- Reemplazar `Translations` con un puerto `Translator` o pasar las traducciones como parámetro

**Pasos:**

1. Crear `src/domain/errors.ts` con `ValidationError`, `DomainError`, `NotFoundError`
2. Actualizar `src/shared/errors.ts` para re-exportar desde `domain/errors.ts` (backward compat)
3. Mover `parseNumeric` a `src/domain/inputParsing.ts`
4. Actualizar imports en `calculateTarget.ts`
5. `pnpm typecheck && pnpm test:run`

---

**Violación 1:** `exportData.ts:3-6` usa interfaz inline `StoreSnapshot`.

**Solución:** Reemplazar con los 5 puertos reales.

**Pasos:**

1. Crear puertos en `application/ports/`:
   - `TrackerRepository.ts`
   - `LogRepository.ts` (ya existe)
   - `NudgeRepository.ts`
   - `ActivityRepository.ts` (ya existe)
   - `PlanRepository.ts` (ya existe)
   - `BiomarkerRepository.ts` (ya existe)
2. Actualizar `exportData.ts` para aceptar los 5 puertos
3. Actualizar `compositionRoot.ts` para pasar los adapters correctos
4. `pnpm typecheck && pnpm test:run`

---

**Violación 8:** `calculateTarget` hace parsing inline.

**Solución:** Extraer parsing a un domain service `parseAndValidateProfile()`.

**Pasos:**

1. Crear `src/domain/profileParser.ts` con `parseAndValidateProfile(input: ProfileInput): ProfileValidationResult`
2. Mover lógica de parsing de `calculateTarget.ts:54-93` a `profileParser.ts`
3. `calculateTarget` delega a `parseAndValidateProfile` y luego a `computeCaloricTarget`
4. `pnpm typecheck && pnpm test:run`

---

### Fase 4 — Detalle

**Violación 9:** `shared/stores/index.ts` cruza de infra → shared.

**Solución:** Eliminar el barrel o re-exportar solo tipos.

**Pasos:**

1. Actualizar `src/shared/stores/index.ts` para no re-exportar stores de infra
2. Actualizar imports en archivos que consumen `@shared/stores` (ej: `MetabolicTrackerContainer.tsx:1`)
3. `pnpm typecheck`

---

**Violación 10:** `shared/utils/index.ts` cruza de domain → shared.

**Solución:** Eliminar re-exports de dominio.

**Pasos:**

1. Actualizar `src/shared/utils/index.ts` para no re-exportar `domain/imc` ni `domain/enum`
2. Actualizar imports en archivos que consumen `@shared/utils` (ej: `calculateTarget.ts:5`)
3. `pnpm typecheck`

---

**Violación 11:** Feature barrels exportan más que el Container.

**Solución:** Limitar barrels a solo el Container.

**Pasos:**

1. Actualizar `src/features/nudge-engine/index.ts` para exportar solo `NudgeEngineContainer`
2. Actualizar `src/features/activity-tracker/index.ts` para exportar solo `ActivityTrackerContainer`
3. Actualizar imports en archivos que consumen estos barrels
4. `pnpm typecheck`

---

**Violación 12:** `application/dtos/` está vacío.

**Solución:** Mover DTOs aquí.

**Pasos:**

1. Mover `ProfileInput` de `calculateTarget.ts` → `application/dtos/ProfileInput.ts`
2. Mover `CaloricTargetInput/Output` de `caloricTargetService.ts` → `application/dtos/CaloricTarget.ts`
3. Actualizar imports
4. `pnpm typecheck`

---

## 6. Verification Checklist

### Después de cada fase, verificar:

- [ ] `pnpm format:check` pasa
- [ ] `pnpm lint` pasa (oxlint)
- [ ] `pnpm typecheck` pasa (tsc -b --noEmit)
- [ ] `pnpm test:run` pasa (803 tests)
- [ ] `pnpm build` pasa (tsc -b && vite build)
- [ ] `pnpm quality` pasa (format + lint + typecheck + tests)
- [ ] `pnpm verify` pasa (quality + build)

### Cobertura de tests:

- [ ] statements ≥ 80%
- [ ] branches ≥ 80%
- [ ] functions = 100%
- [ ] lines ≥ 80%

### Verificación manual:

- [ ] No hay imports de `infrastructure/` hacia `features/`
- [ ] No hay imports de `application/` hacia `@shared/` (excepto tipos puros)
- [ ] Composition root es consumido por al menos 1 feature container
- [ ] Feature barrels exportan solo el Container
- [ ] `application/dtos/` tiene al menos 2 archivos (ProfileInput, CaloricTarget)

---

## 7. Conclusión

El proyecto NutreFitDia tiene una **arquitectura sólida en el dominio** (rico, puro, bien testeado), pero presenta **violaciones críticas en las capas de aplicación e infraestructura** que comprometen la mantenibilidad a largo plazo.

Las **7 violaciones HIGH** deben resolverse antes de agregar nuevas features. Las **4 violaciones MEDIUM** pueden resolverse en paralelo. La **violación LOW** (DTOs vacíos) es organizacional y puede postergarse.

**Tiempo estimado:** 2-3 días de trabajo dedicado (8-12 horas).  
**Riesgo:** MEDIO-ALTO en Fase 2 (composition root), BAJO en las demás fases.

**Recomendación:** Resolver en orden (Fase 1 → 2 → 3 → 4), verificando tests en cada paso. No saltar fases.

---

**Fin del informe.**
