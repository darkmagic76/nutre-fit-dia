# Spec: clean-barrels-cross-layer

**Fecha:** 2026-08-07  
**Fase:** 4 de REFACTOR_ARCH.md  
**Estado:** Pending Implementation  
**Ciclo SDD:** explore → propose → spec → design → tasks → apply → verify → archive

---

## 1. Objetivo

Eliminar violaciones de Clean Architecture donde barrels cross-layer exponen implementaciones internas, violando la regla de dependencias y el principio de ocultación de información.

**Skills aplicados:**

- `clean-architecture-audit.md` línea 68: "Evita barrels que exporten a través de capas; limítalos a subcarpetas del mismo nivel"
- `architecture-decisions.md` SRP + Modularity: "One reason to change"
- `architecture-decisions.md` Domain Isolation: "The core does NOT depend on frameworks"

---

## 2. Scope

### In Scope

- Migrar imports de `@shared/stores` → `@infrastructure/stores` (5 features)
- Eliminar `shared/stores/index.ts` (barrel cross-layer)
- Eliminar `shared/utils/index.ts` (barrel cross-layer, 0 consumers)
- Limitar feature barrels a solo Container (2 features)
- Mover `ProfileInput` a `application/dtos/ProfileInput.ts` (DTO de aplicación)
- **NO mover** `CaloricTargetInput/Output` (son tipos de dominio, no DTOs)
- Actualizar todos los imports afectados
- Tests unitarios y de integración

### Out of Scope

- Cambiar lógica de negocio
- Modificar estructura de stores de Zustand
- Refactorizar Composition Root (ya completado en Fase 2)
- Cambiar API pública de features

---

## 3. Especificaciones Delta

### 3.1 shared-stores-barrel

**Violación 9:** `shared/stores/index.ts` re-exporta stores de infraestructura.

**Estado actual:**

```typescript
// src/shared/stores/index.ts
export * from '../../infrastructure/stores/index';
```

**Consumers (5 features):**

- `NudgeEngineContainer.tsx:5` → `useNudgeStore`
- `RecipeEngineContainer.tsx:4` → `useTrackerStore`
- `MedDietValidatorContainer.tsx:2` → `useLogStore, useTrackerStore`
- `MetabolicTrackerContainer.tsx:1` → `useTrackerStore`
- `NutritionalTrafficLightContainer.tsx:6` → `useLogStore`

**Cambio:**

```typescript
// ANTES
import { useNudgeStore } from '@shared/stores';

// DESPUÉS
import { useNudgeStore } from '@infrastructure/stores';
```

**Acción final:** Eliminar `src/shared/stores/index.ts`

**Tests:**

- `pnpm typecheck` verifica que no hay imports rotos
- `pnpm test:run` verifica que todos los tests pasan

---

### 3.2 shared-utils-barrel

**Violación 10:** `shared/utils/index.ts` re-exporta funciones de dominio.

**Estado actual:**

```typescript
// src/shared/utils/index.ts
export {
  computeIMC,
  isRestrictionCandidate,
  IMC_UNDERWEIGHT,
  IMC_NORMAL_MAX,
  IMC_OVERWEIGHT,
} from '../../domain/imc';
export { defineEnum } from '../../domain/enum';
export type { ValuesOf } from '../../domain/enum';
```

**Consumers:** 0 en código fuente (ya migrados en Fase 3)

**Cambio:** Eliminar archivo `src/shared/utils/index.ts`

**Justificación:**

- Barrel cruza capas (shared → domain)
- 0 consumers reales
- `computeIMC`, `isRestrictionCandidate` son funciones de dominio, viven en `domain/imc.ts`
- `defineEnum`, `ValuesOf` son utilidades de dominio, viven en `domain/enum.ts`

**Tests:**

- `pnpm typecheck` verifica que no hay imports rotos

---

### 3.3 feature-barrels

**Violación 11:** Feature barrels exportan más que el Container.

**Estado actual:**

`src/features/nudge-engine/index.ts`:

```typescript
export { NudgeEngineContainer } from './NudgeEngineContainer';
export { useNudgeStore } from '@infrastructure/stores';
export { CooldownTracker, NUDGE_RULES, buildNudgeContext, evaluateRules } from '@shared/nudge';
export type { NudgeRule, SafetyRule, NudgeContext, NudgeEvaluation } from '@shared/nudge';
```

`src/features/activity-tracker/index.ts`:

```typescript
export { useActivityStore, DEFAULT_WEEKLY_GOAL } from '@infrastructure/stores/activityStore';
export { useActivityTracker } from './hooks/useActivityTracker';
export { ActivityTrackerContainer } from './ActivityTrackerContainer';
export type { ActivityEntry, WeeklyGoal } from '../../domain/activity';
```

**Consumers:** Solo `App.tsx` importa los Containers.

**Cambio:**

`src/features/nudge-engine/index.ts`:

```typescript
export { NudgeEngineContainer } from './NudgeEngineContainer';
```

`src/features/activity-tracker/index.ts`:

```typescript
export { ActivityTrackerContainer } from './ActivityTrackerContainer';
```

**Justificación:**

- Feature barrels deben exponer solo la API pública (el Container)
- Stores, hooks, tipos son detalles de implementación internos
- Consumers que necesitan stores/hooks los importan directo de `@infrastructure/stores` o `@shared/nudge`

**Tests:**

- `pnpm typecheck` verifica que no hay imports rotos
- `App.tsx` sigue funcionando (solo importa Containers)

---

### 3.4 application-dtos

**Violación 12:** `application/dtos/` está vacío.

**Estado actual:**

`src/application/use-cases/calculateTarget.ts:27-36`:

```typescript
export interface ProfileInput {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: 'male' | 'female';
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}
```

**Consumers de `ProfileInput`:**

- `compositionRoot.ts:26` → `import type { ProfileInput } from '@application/use-cases/calculateTarget'`
- `profileService.test.ts:3` → `import type { ProfileInput } from './profileService'` (tipo homónimo diferente)

**Cambio:**

Crear `src/application/dtos/ProfileInput.ts`:

```typescript
/** Input shape for the calculateTarget use case — raw form fields. */
export interface ProfileInput {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: 'male' | 'female';
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}
```

Actualizar `src/application/use-cases/calculateTarget.ts`:

```typescript
import type { ProfileInput } from '@application/dtos/ProfileInput';

// Eliminar definición inline de ProfileInput (líneas 27-36)
```

Actualizar `src/infrastructure/compositionRoot.ts`:

```typescript
import type { ProfileInput } from '@application/dtos/ProfileInput';
```

**NOTA sobre `CaloricTargetInput/Output`:**

Estos tipos **NO se mueven** a `application/dtos/` porque:

- Son tipos de **dominio** (definidos en `domain/caloricTargetService.ts`)
- `CaloricTargetInput` = type alias de `UserMetrics` (dominio puro)
- `CaloricTargetOutput` = output de domain service `computeCaloricTarget`
- Moverlos a application violaría la regla de dependencias
- Se quedan en `domain/caloricTargetService.ts` (patrón DDD: tipos co-locados con services)

**Justificación con skills:**

- clean-architecture-audit.md línea 49: "DTOs propios por caso de uso" → `ProfileInput` es DTO de aplicación
- architecture-decisions.md Domain Isolation: tipos de dominio viven en dominio
- Principio 1b: application importa puertos, no adaptadores → `ProfileInput` es input del use case

**Tests:**

- `pnpm typecheck` verifica que no hay imports rotos
- `calculateTarget.test.ts` verifica que el use case sigue funcionando
- `compositionRoot.test.ts` verifica que el container sigue wireando correctamente

---

## 4. Criterios de Aceptación

### Funcionales

- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm test:run` pasa (todos los tests)
- [ ] `pnpm build` pasa (tsc -b + vite build)
- [ ] `pnpm quality` pasa completo (format + lint + typecheck + tests)

### Arquitectónicos

- [ ] No hay imports de `@shared/stores` en código fuente
- [ ] No hay imports de `@shared/utils` en código fuente
- [ ] `src/shared/stores/index.ts` no existe
- [ ] `src/shared/utils/index.ts` no existe
- [ ] `src/features/nudge-engine/index.ts` solo exporta `NudgeEngineContainer`
- [ ] `src/features/activity-tracker/index.ts` solo exporta `ActivityTrackerContainer`
- [ ] `src/application/dtos/ProfileInput.ts` existe
- [ ] `src/application/use-cases/calculateTarget.ts` no define `ProfileInput` inline
- [ ] `CaloricTargetInput/Output` siguen en `domain/caloricTargetService.ts`

### Documentación

- [ ] `REFACTOR_ARCH.md` actualizado: Fase 4 marcada como completada
- [ ] `REFACTOR_ARCH.md` actualizado: aclarar que violación 12 se resuelve parcialmente (solo ProfileInput)
- [ ] Specs delta archivadas en `openspec/changes/archive/`

---

## 5. Riesgos y Mitigaciones

| Riesgo                                                 | Probabilidad | Impacto | Mitigación                                |
| ------------------------------------------------------ | ------------ | ------- | ----------------------------------------- |
| Import roto después de migrar barrel                   | Baja         | Bajo    | `pnpm typecheck` detecta inmediatamente   |
| Test falla por cambio de import                        | Baja         | Medio   | `pnpm test:run` verifica comportamiento   |
| Consumer externo usa `@shared/utils`                   | Muy baja     | Bajo    | Grep muestra 0 consumers en código fuente |
| `ProfileInput` se usa en más archivos de los esperados | Baja         | Medio   | Grep exhaustivo antes de migrar           |

---

## 6. Orden de Ejecución

1. **shared-stores-barrel**: Migrar 5 features → `@infrastructure/stores`, eliminar barrel
2. **shared-utils-barrel**: Eliminar `shared/utils/index.ts`
3. **feature-barrels**: Limitar 2 features a solo Container
4. **application-dtos**: Mover `ProfileInput` a `application/dtos/`
5. **Verify**: `pnpm quality` + `pnpm build`
6. **Archive**: Actualizar REFACTOR_ARCH.md, archivar cambio

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

**¿Por qué NO mover `CaloricTargetInput/Output` a application/dtos/?**

- Son tipos de **dominio** (definidos en `domain/caloricTargetService.ts`)
- Moverlos a application violaría la regla de dependencias
- Domain service `computeCaloricTarget` los define y los usa
- Si están en application, domain dependería de application (inversión incorrecta)
- Se quedan en dominio (patrón DDD: tipos co-locados con services)

---

## 8. Estimación

- **Tiempo:** 2-3 horas
- **Complejidad:** BAJA (cambios mecánicos de imports)
- **Archivos modificados:** ~15
- **Riesgo:** BAJO (tests detectan cualquier error)

---

**Fin del spec.**
