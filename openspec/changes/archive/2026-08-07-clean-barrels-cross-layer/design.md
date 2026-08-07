# Design: clean-barrels-cross-layer

**Fecha:** 2026-08-07  
**Fase:** 4 de REFACTOR_ARCH.md  
**Spec:** `.opencode/plans/phase4-spec.md`

---

## 1. Objetivo Técnico

Eliminar violaciones de Clean Architecture donde barrels cross-layer exponen implementaciones internas, violando la regla de dependencias y el principio de ocultación de información.

---

## 2. Arquitectura Actual vs. Target

### 2.1 Violación 9 — `shared/stores/index.ts`

**Actual:**

```
src/shared/stores/index.ts
  └─ export * from '../../infrastructure/stores/index'

Consumers (5 features):
  NudgeEngineContainer.tsx → useNudgeStore
  RecipeEngineContainer.tsx → useTrackerStore
  MedDietValidatorContainer.tsx → useLogStore, useTrackerStore
  MetabolicTrackerContainer.tsx → useTrackerStore
  NutritionalTrafficLightContainer.tsx → useLogStore
```

**Target:**

```
src/infrastructure/stores/index.ts (sin cambios)
  └─ export { useTrackerStore, useLogStore, useActivityStore, useNudgeStore, useBiomarkerStore, usePlanStore, DEFAULT_WEEKLY_GOAL }

Consumers importan directo:
  import { useNudgeStore } from '@infrastructure/stores'
```

**Acción final:** Eliminar `src/shared/stores/index.ts`

---

### 2.2 Violación 10 — `shared/utils/index.ts`

**Actual:**

```
src/shared/utils/index.ts
  └─ export { computeIMC, isRestrictionCandidate, ... } from '../../domain/imc'
  └─ export { defineEnum } from '../../domain/enum'
  └─ export type { ValuesOf } from '../../domain/enum'

Consumers: 0 (ya migrados en Fase 3)
```

**Target:**

```
Archivo eliminado
```

**Acción final:** Eliminar `src/shared/utils/index.ts`

---

### 2.3 Violación 11 — Feature barrels

**Actual:**

```
src/features/nudge-engine/index.ts
  └─ export { NudgeEngineContainer }
  └─ export { useNudgeStore } (de @infrastructure/stores)
  └─ export { CooldownTracker, NUDGE_RULES, ... } (de @shared/nudge)
  └─ export type { NudgeRule, SafetyRule, ... }

src/features/activity-tracker/index.ts
  └─ export { useActivityStore, DEFAULT_WEEKLY_GOAL } (de @infrastructure/stores)
  └─ export { useActivityTracker }
  └─ export { ActivityTrackerContainer }
  └─ export type { ActivityEntry, WeeklyGoal }

Consumers: Solo App.tsx importa Containers
```

**Target:**

```
src/features/nudge-engine/index.ts
  └─ export { NudgeEngineContainer }

src/features/activity-tracker/index.ts
  └─ export { ActivityTrackerContainer }
```

**Justificación:** Feature barrels exponen API pública (Container), no detalles internos.

---

### 2.4 Violación 12 — `application/dtos/` vacío

**Actual:**

```
src/application/use-cases/calculateTarget.ts:27-36
  └─ export interface ProfileInput { ... }

Consumers:
  compositionRoot.ts → import type { ProfileInput }
  profileService.test.ts → import type { ProfileInput } (tipo homónimo diferente)
```

**Target:**

```
src/application/dtos/ProfileInput.ts
  └─ export interface ProfileInput { ... }

src/application/use-cases/calculateTarget.ts
  └─ import type { ProfileInput } from '@application/dtos/ProfileInput'
  └─ (eliminar definición inline)

src/infrastructure/compositionRoot.ts
  └─ import type { ProfileInput } from '@application/dtos/ProfileInput'
```

**NOTA:** `CaloricTargetInput/Output` se quedan en `domain/caloricTargetService.ts` (son tipos de dominio, no DTOs de aplicación).

---

## 3. Mapa de Migración de Imports

### 3.1 Migrar `@shared/stores` → `@infrastructure/stores`

| Archivo                                                                       | Línea | Import actual                                        | Import nuevo                                                 |
| ----------------------------------------------------------------------------- | ----- | ---------------------------------------------------- | ------------------------------------------------------------ |
| `src/features/nudge-engine/NudgeEngineContainer.tsx`                          | 5     | `useNudgeStore` from `@shared/stores`                | `useNudgeStore` from `@infrastructure/stores`                |
| `src/features/recipe-engine/RecipeEngineContainer.tsx`                        | 4     | `useTrackerStore` from `@shared/stores`              | `useTrackerStore` from `@infrastructure/stores`              |
| `src/features/med-diet-validator/MedDietValidatorContainer.tsx`               | 2     | `useLogStore, useTrackerStore` from `@shared/stores` | `useLogStore, useTrackerStore` from `@infrastructure/stores` |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx`                | 1     | `useTrackerStore` from `@shared/stores`              | `useTrackerStore` from `@infrastructure/stores`              |
| `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx` | 6     | `useLogStore` from `@shared/stores`                  | `useLogStore` from `@infrastructure/stores`                  |

### 3.2 Eliminar barrels

| Archivo                      | Acción   |
| ---------------------------- | -------- |
| `src/shared/stores/index.ts` | Eliminar |
| `src/shared/utils/index.ts`  | Eliminar |

### 3.3 Limitar feature barrels

| Archivo                                  | Acción                                              |
| ---------------------------------------- | --------------------------------------------------- |
| `src/features/nudge-engine/index.ts`     | Eliminar exports excepto `NudgeEngineContainer`     |
| `src/features/activity-tracker/index.ts` | Eliminar exports excepto `ActivityTrackerContainer` |

### 3.4 Mover DTO a `application/dtos/`

| Archivo                                        | Acción                                     |
| ---------------------------------------------- | ------------------------------------------ |
| `src/application/dtos/ProfileInput.ts`         | Crear                                      |
| `src/application/use-cases/calculateTarget.ts` | Eliminar definición inline, agregar import |
| `src/infrastructure/compositionRoot.ts`        | Actualizar import                          |

---

## 4. Orden de Ejecución

1. **shared-stores-barrel**: Migrar 5 features → `@infrastructure/stores`, eliminar barrel
2. **shared-utils-barrel**: Eliminar `shared/utils/index.ts`
3. **feature-barrels**: Limitar 2 features a solo Container
4. **application-dtos**: Mover `ProfileInput` a `application/dtos/`
5. **Verify**: `pnpm verify` (quality + build)

---

## 5. Tests de Verificación

### 5.1 Tests existentes que deben seguir pasando

- `pnpm test:run` — 808 tests
- `pnpm typecheck` — sin errores
- `pnpm build` — éxito

### 5.2 Tests específicos afectados

- `NudgeEngineContainer.test.tsx` — verifica que el container sigue funcionando
- `RecipeEngineContainer.test.tsx` — verifica que el container sigue funcionando
- `MedDietValidatorContainer.test.tsx` — verifica que el container sigue funcionando
- `MetabolicTrackerContainer.test.tsx` — verifica que el container sigue funcionando
- `NutritionalTrafficLightContainer.test.tsx` — verifica que el container sigue funcionando
- `calculateTarget.test.ts` — verifica que el use case sigue funcionando
- `compositionRoot.test.ts` — verifica que el container sigue wireando

### 5.3 Verificación arquitectónica

```bash
# No debe haber imports de @shared/stores
grep -r "from '@shared/stores'" src/

# No debe haber imports de @shared/utils (excepto si quedan utils legítimos)
grep -r "from '@shared/utils'" src/

# Feature barrels solo exportan Container
cat src/features/nudge-engine/index.ts
cat src/features/activity-tracker/index.ts

# application/dtos/ tiene ProfileInput
ls src/application/dtos/
```

---

## 6. Riesgos y Mitigaciones

| Riesgo                                                 | Probabilidad | Impacto | Mitigación                                |
| ------------------------------------------------------ | ------------ | ------- | ----------------------------------------- |
| Import roto después de migrar barrel                   | Baja         | Bajo    | `pnpm typecheck` detecta inmediatamente   |
| Test falla por cambio de import                        | Baja         | Medio   | `pnpm test:run` verifica comportamiento   |
| Consumer externo usa `@shared/utils`                   | Muy baja     | Bajo    | Grep muestra 0 consumers en código fuente |
| `ProfileInput` se usa en más archivos de los esperados | Baja         | Medio   | Grep exhaustivo antes de migrar           |

---

## 7. Justificación Arquitectónica

**¿Por qué esta solución aplica los skills sin fallos?**

1. **clean-architecture-audit.md línea 68**: "Evita barrels que exporten a través de capas"
   - ✅ Eliminamos barrels cross-layer (`shared/stores`, `shared/utils`)
   - ✅ Limitamos feature barrels a solo Container (API pública)

2. **architecture-decisions.md SRP**: "One reason to change"
   - ✅ Cada barrel tiene una sola responsabilidad (exponer API pública)
   - ✅ DTOs de aplicación co-locados con use cases

3. **architecture-decisions.md Domain Isolation**: "The core does NOT depend on frameworks"
   - ✅ Tipos de dominio (`CaloricTargetInput/Output`) viven en dominio
   - ✅ DTOs de aplicación (`ProfileInput`) viven en application

4. **Principio 1b**: "¿La aplicación importa puertos, no adaptadores?"
   - ✅ `ProfileInput` es un DTO plano (no adaptador)
   - ✅ Use case `calculateTarget` recibe `ProfileInput` + `BiomarkerRepository` (puerto)

5. **Principio 4a/4b**: "Puertos en aplicación, adaptadores en infraestructura"
   - ✅ `ProfileInput` es input DTO del use case (application)
   - ✅ Stores de Zustand son adaptadores (infrastructure)

---

## 8. Estimación

- **Tiempo:** 2-3 horas
- **Complejidad:** BAJA (cambios mecánicos de imports)
- **Archivos modificados:** ~15
- **Riesgo:** BAJO (tests detectan cualquier error)

---

**Fin del design.**
