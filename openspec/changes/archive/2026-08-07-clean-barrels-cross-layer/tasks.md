# Tasks: clean-barrels-cross-layer

**Fecha:** 2026-08-07
**Design:** `.opencode/plans/phase4-design.md`
**Spec:** `.opencode/plans/phase4-spec.md`

---

## Task 1: Migrar imports de @shared/stores → @infrastructure/stores

**Scope:** 5 features
**Riesgo:** BAJO
**TDD:** No aplica (cambios mecánicos de imports, tests existentes verifican)

### Archivos a modificar

1. `src/features/nudge-engine/NudgeEngineContainer.tsx:5`
   - ANTES: `import { useNudgeStore } from '@shared/stores';`
   - DESPUÉS: `import { useNudgeStore } from '@infrastructure/stores';`

2. `src/features/recipe-engine/RecipeEngineContainer.tsx:4`
   - ANTES: `import { useTrackerStore } from '@shared/stores';`
   - DESPUÉS: `import { useTrackerStore } from '@infrastructure/stores';`

3. `src/features/med-diet-validator/MedDietValidatorContainer.tsx:2`
   - ANTES: `import { useLogStore, useTrackerStore } from '@shared/stores';`
   - DESPUÉS: `import { useLogStore, useTrackerStore } from '@infrastructure/stores';`

4. `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx:1`
   - ANTES: `import { useTrackerStore } from '@shared/stores';`
   - DESPUÉS: `import { useTrackerStore } from '@infrastructure/stores';`

5. `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx:6`
   - ANTES: `import { useLogStore } from '@shared/stores';`
   - DESPUÉS: `import { useLogStore } from '@infrastructure/stores';`

### Verificación

- `pnpm typecheck` — sin errores
- `pnpm test:run` — 808 tests pasando

---

## Task 2: Eliminar barrel shared/stores/index.ts

**Scope:** 1 archivo
**Riesgo:** BAJO
**Dependencia:** Task 1 (todos los consumers migrados)

### Acción

- Eliminar `src/shared/stores/index.ts`

### Verificación

- `pnpm typecheck` — sin errores (confirma que no quedan consumers)
- `grep -r "from '@shared/stores'" src/` — 0 resultados

---

## Task 3: Eliminar barrel shared/utils/index.ts

**Scope:** 1 archivo
**Riesgo:** BAJO
**Dependencia:** Ninguna (0 consumers confirmados)

### Acción

- Eliminar `src/shared/utils/index.ts`

### Verificación

- `pnpm typecheck` — sin errores
- `grep -r "from '@shared/utils'" src/` — 0 resultados

---

## Task 4: Limitar feature barrel nudge-engine a solo Container

**Scope:** 1 archivo
**Riesgo:** BAJO
**Dependencia:** Ninguna

### Archivos a modificar

1. `src/features/nudge-engine/index.ts`
   - ANTES:
     ```typescript
     export { NudgeEngineContainer } from './NudgeEngineContainer';
     export { useNudgeStore } from '@infrastructure/stores';
     export { CooldownTracker, NUDGE_RULES, buildNudgeContext, evaluateRules } from '@shared/nudge';
     export type { NudgeRule, SafetyRule, NudgeContext, NudgeEvaluation } from '@shared/nudge';
     ```
   - DESPUÉS:
     ```typescript
     export { NudgeEngineContainer } from './NudgeEngineContainer';
     ```

### Verificación

- `pnpm typecheck` — sin errores
- `App.tsx` sigue funcionando (solo importa Container)

---

## Task 5: Limitar feature barrel activity-tracker a solo Container

**Scope:** 1 archivo
**Riesgo:** BAJO
**Dependencia:** Ninguna

### Archivos a modificar

1. `src/features/activity-tracker/index.ts`
   - ANTES:
     ```typescript
     export { useActivityStore, DEFAULT_WEEKLY_GOAL } from '@infrastructure/stores/activityStore';
     export { useActivityTracker } from './hooks/useActivityTracker';
     export { ActivityTrackerContainer } from './ActivityTrackerContainer';
     export type { ActivityEntry, WeeklyGoal } from '../../domain/activity';
     ```
   - DESPUÉS:
     ```typescript
     export { ActivityTrackerContainer } from './ActivityTrackerContainer';
     ```

### Verificación

- `pnpm typecheck` — sin errores
- `App.tsx` sigue funcionando (solo importa Container)

---

## Task 6: Crear application/dtos/ProfileInput.ts

**Scope:** 1 archivo nuevo
**Riesgo:** BAJO
**Dependencia:** Ninguna

### Acción

1. Crear directorio `src/application/dtos/` (si no existe)
2. Crear `src/application/dtos/ProfileInput.ts`:
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

### Verificación

- `ls src/application/dtos/` — muestra `ProfileInput.ts`

---

## Task 7: Mover ProfileInput de calculateTarget.ts a application/dtos/

**Scope:** 2 archivos
**Riesgo:** BAJO
**Dependencia:** Task 6

### Archivos a modificar

1. `src/application/use-cases/calculateTarget.ts`
   - Agregar import: `import type { ProfileInput } from '@application/dtos/ProfileInput';`
   - Eliminar definición inline de `ProfileInput` (líneas 27-36)

2. `src/infrastructure/compositionRoot.ts`
   - Actualizar import: `import type { ProfileInput } from '@application/dtos/ProfileInput';`
   - (ANTES: `import type { ProfileInput } from '@application/use-cases/calculateTarget';`)

### Verificación

- `pnpm typecheck` — sin errores
- `pnpm test:run` — `calculateTarget.test.ts` pasa
- `grep -n "interface ProfileInput" src/application/use-cases/calculateTarget.ts` — 0 resultados

---

## Task 8: Verificación final — pnpm verify

**Scope:** Todo el proyecto
**Riesgo:** BAJO
**Dependencia:** Tasks 1-7 completadas

### Verificación

```bash
pnpm verify  # quality + build
```

### Criterios de aceptación

- [ ] `pnpm format:check` pasa
- [ ] `pnpm lint` pasa (oxlint) — cero warnings
- [ ] `pnpm typecheck` pasa (tsc -b --noEmit)
- [ ] `pnpm test:run` pasa (808 tests)
- [ ] `pnpm build` pasa (tsc -b && vite build)

### Verificación arquitectónica

```bash
# No hay imports de @shared/stores
grep -r "from '@shared/stores'" src/  # 0 resultados

# No hay imports de @shared/utils
grep -r "from '@shared/utils'" src/  # 0 resultados

# Feature barrels solo exportan Container
cat src/features/nudge-engine/index.ts  # solo NudgeEngineContainer
cat src/features/activity-tracker/index.ts  # solo ActivityTrackerContainer

# application/dtos/ tiene ProfileInput
ls src/application/dtos/  # ProfileInput.ts

# calculateTarget.ts no define ProfileInput inline
grep -n "interface ProfileInput" src/application/use-cases/calculateTarget.ts  # 0 resultados
```

---

## Task 9: Actualizar documentación

**Scope:** 2 archivos
**Riesgo:** BAJO
**Dependencia:** Task 8

### Archivos a modificar

1. `REFACTOR_ARCH.md`
   - Marcar Fase 4 como completada
   - Actualizar estado: "Fases 1-4 completadas"
   - Actualizar matriz de violaciones: marcar 9, 10, 11, 12 como resueltas
   - Aclarar que violación 12 se resuelve parcialmente (solo ProfileInput, no CaloricTarget*)

2. `openspec/changes/clean-barrels-cross-layer/`
   - Mover a `openspec/changes/archive/2026-08-07-clean-barrels-cross-layer/`

### Verificación

- `REFACTOR_ARCH.md` refleja el estado actual
- Cambio archivado correctamente

---

## Resumen de Tasks

| Task | Descripción                                            | Archivos | Riesgo | Dependencia |
| ---- | ------------------------------------------------------ | -------- | ------ | ----------- |
| 1    | Migrar imports @shared/stores → @infrastructure/stores | 5        | BAJO   | —           |
| 2    | Eliminar shared/stores/index.ts                        | 1        | BAJO   | Task 1      |
| 3    | Eliminar shared/utils/index.ts                         | 1        | BAJO   | —           |
| 4    | Limitar nudge-engine barrel a Container                | 1        | BAJO   | —           |
| 5    | Limitar activity-tracker barrel a Container            | 1        | BAJO   | —           |
| 6    | Crear application/dtos/ProfileInput.ts                 | 1        | BAJO   | —           |
| 7    | Mover ProfileInput a application/dtos/                 | 2        | BAJO   | Task 6      |
| 8    | Verificación final — pnpm verify                       | —        | BAJO   | Tasks 1-7   |
| 9    | Actualizar documentación                               | 2        | BAJO   | Task 8      |

**Total:** 9 tasks, ~15 archivos modificados, riesgo BAJO, tiempo estimado 2-3 horas.

---

**Fin de tasks.**
