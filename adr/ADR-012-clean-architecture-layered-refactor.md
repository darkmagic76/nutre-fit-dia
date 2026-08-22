# ADR-012: Clean Architecture — Refactorización por Capas con Puertos y Adaptadores

**Status:** Accepted — Implemented 2026-08-10
**Date:** 2026-08-06
**Deciders:** darkmagic76, gentle-orchestrator

## Context

El proyecto NutreFitDia tiene una arquitectura actual basada en Screaming Architecture + Container/Presentational + Scope Rule. Esto ha funcionado bien para el tamaño actual (7 features, 735 tests), pero una auditoría de arquitectura contra los 7 principios de Clean Architecture reveló que la estructura actual **mezcla capas de dominio, aplicación e infraestructura** bajo el paraguas de `shared/`, y las Zustand stores actúan como "God objects" que unen persistencia, validación y lógica de negocio en un solo módulo.

| Principio                                       | Estado actual  | Problema raíz                                                                    |
| ----------------------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| P1a. Dominio importa solo tipos propios         | ❌ Violación   | `notification.ts`, `trafficLight.ts`, `foodCategory.ts` importan `@shared/utils` |
| P1b. Aplicación importa puertos, no adaptadores | ❌ Violación   | `engine.ts` importa 5 Zustand stores; `useExportData.ts` importa 6 stores        |
| P1c. Infra implementa puertos                   | ❌ Inexistente | No hay puertos definidos; los stores SON los adaptadores                         |
| P2. Modelo de dominio explícito                 | ⚠️ Parcial     | `CATEGORY_DISPLAY_NAMES` mezcla UI con dominio                                   |
| P3. Casos de uso orquestan, no calculan         | ❌ Violación   | `trackerStore.calculateTarget()` es un God method de 90 líneas                   |
| P4. Puertos y Adaptadores                       | ❌ Inexistente | No hay capa `application/ports/` ni `application/use-cases/`                     |
| P5. DTOs entran/salen                           | ⚠️ Parcial     | `SystemNotification` cruza fronteras sin transformación                          |
| P6. Testing alineado con capas                  | ✅ Bueno       | 735 tests, cobertura >80%, pero sin dobles de repositorios                       |
| P7. Composition Root                            | ❌ Inexistente | Stores son singletons auto-compuestos, sin DI explícita                          |

### Punto positivo clave

El refactor del nudge engine (sesión 2026-08-05, feature `legume-carb-source`) ya demostró el patrón correcto:

- `buildNudgeContext()`: función pura, recibe `ContextInput`, cero dependencias de framework
- `evaluateRules()`: función pura, recibe reglas + contexto + cooldown inyectado
- `evaluateAndEnqueue()`: único punto de integración que lee stores

Este patrón debe extenderse a todo el proyecto.

### Objetivo

Transformar la arquitectura actual en una **Clean Architecture por capas** con tres niveles bien definidos:

```
presentation/     ← features/ (containers + views, React + Zustand hooks)
application/      ← use cases + ports (interfaces puras, sin frameworks)
domain/           ← entities, value objects, domain services (puro TypeScript)
infrastructure/   ← adaptadores (Zustand stores, localStorage, Web Crypto, Vite env)
```

La regla de dependencias es unidireccional: `presentation → application → domain`. `infrastructure` implementa puertos definidos en `application` y es inyectada por un composition root.

## Decision

### Fase 1: Sanitización del dominio (sin romper nada)

**Objetivo**: que `domain/` no importe nada de fuera excepto `zod`.

#### 1.1 Mover `defineEnum` al dominio

- Mover `src/shared/utils/enum.ts` → `src/domain/enum.ts`
- Actualizar imports en `notification.ts`, `trafficLight.ts`, `foodCategory.ts`
- Actualizar barrel `src/shared/utils/index.ts` para re-exportar desde dominio
- Archivos afectados: ~6 (3 domain + 2 utils + 1 barrel)

#### 1.2 Mover `CATEGORY_DISPLAY_NAMES` fuera del dominio

- Eliminar `CATEGORY_DISPLAY_NAMES` de `domain/foodCategory.ts`
- Mover los strings a `shared/i18n/es.ts` bajo keys `category.*` (ya existen parcialmente)
- Buscar y actualizar todos los consumidores (~3-4 archivos)
- Archivos afectados: ~6

### Fase 2: Reorganización de carpetas (cambio estructural)

**Objetivo**: tres carpetas raíz que reflejen las capas.

```
src/
├── domain/                    ← ex shared/domain + shared/constants/clinical + shared/services/*
│   ├── index.ts               ← barrel de dominio
│   ├── enum.ts                ← movido de shared/utils
│   ├── food.ts
│   ├── foodCategory.ts
│   ├── metrics.ts
│   ├── activity.ts
│   ├── notification.ts
│   ├── trafficLight.ts
│   ├── glucoseInput.ts
│   ├── glycemicFruits.ts
│   ├── clinical.ts            ← ex shared/constants/clinical.ts
│   ├── caloricTargetService.ts  ← ex shared/services
│   ├── profileService.ts        ← ex shared/services
│   ├── rationValidator.ts       ← ex shared/services
│   ├── biomarkerTypes.ts        ← ex shared/services
│   └── imc.ts                   ← ex shared/utils/imc.ts
│
├── application/               ← NUEVA capa
│   ├── ports/                 ← interfaces puras (sin imports de frameworks)
│   │   ├── notificationRepository.ts
│   │   ├── activityRepository.ts
│   │   ├── logRepository.ts
│   │   └── biomarkerRepository.ts
│   ├── use-cases/
│   │   ├── calculateTarget.ts           ← extraído de trackerStore
│   │   ├── evaluateNudges.ts            ← wrapper de nudge engine
│   │   └── exportData.ts                ← extraído de useExportData
│   └── dtos/
│       ├── ContextInput.ts              ← ex shared/nudge/types.ts (parte)
│       ├── CaloricTargetInput.ts
│       └── ProfileInput.ts
│
├── infrastructure/            ← ya existe, se amplía
│   ├── env.ts
│   ├── storage.ts
│   ├── stores/                ← ex shared/stores (Zustand es infraestructura)
│   │   ├── activityStore.ts
│   │   ├── biomarkerStore.ts
│   │   ├── logStore.ts
│   │   ├── nudgeStore.ts
│   │   └── trackerStore.ts
│   └── adapters/              ← NUEVO: implementan puertos con Zustand
│       ├── zustandNotificationRepository.ts
│       ├── zustandActivityRepository.ts
│       ├── zustandLogRepository.ts
│       └── zustandBiomarkerRepository.ts
│
├── features/                  ← sin cambios (containers + views)
│   └── <feature>/
│       ├── <Feature>Container.tsx
│       ├── <Feature>View.tsx
│       └── components/
│
├── shared/                    ← reducido a UI + i18n + hooks (presentación)
│   ├── ui/
│   ├── i18n/
│   └── hooks/
│
├── App.tsx
└── main.tsx                   ← composition root
```

#### Plan de migración por archivos

| Movimiento        | Origen                                                                   | Destino                                   | Riesgo                       |
| ----------------- | ------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------- |
| Dominio           | `shared/domain/*`                                                        | `domain/*`                                | Bajo — solo imports          |
| Clínico           | `shared/constants/clinical.ts`                                           | `domain/clinical.ts`                      | Bajo — constantes puras      |
| Servicios dominio | `shared/services/{caloricTarget,profile,rationValidator,biomarkerTypes}` | `domain/`                                 | Bajo — funciones puras       |
| IMC               | `shared/utils/imc.ts`                                                    | `domain/imc.ts`                           | Bajo — función pura          |
| Enum              | `shared/utils/enum.ts`                                                   | `domain/enum.ts`                          | Bajo — utilidad TS           |
| Stores            | `shared/stores/*`                                                        | `infrastructure/stores/*`                 | Medio — muchos consumidores  |
| Nudge engine      | `shared/nudge/engine.ts`                                                 | `application/use-cases/evaluateNudges.ts` | Medio — función orquestadora |
| Nudge types       | `shared/nudge/types.ts` → DTOs                                           | `application/dtos/`                       | Bajo — tipos puros           |
| Nudge rules       | `shared/nudge/rules.ts`                                                  | `infrastructure/nudge/rules.ts` (datos)   | Bajo — array de objetos      |
| Cooldown          | `shared/nudge/cooldownTracker.ts`                                        | `domain/cooldownTracker.ts`               | Bajo — clase pura            |
| Export            | `shared/hooks/useExportData.ts` → use case                               | `application/use-cases/exportData.ts`     | Medio — desacoplar de stores |
| UI + i18n         | Se quedan en `shared/`                                                   | Sin cambios                               | Nulo                         |

### Fase 3: Extracción de casos de uso

**Objetivo**: separar orquestación de cálculo.

#### 3.1 Extraer `calculateTarget` de `trackerStore`

- Crear `application/use-cases/calculateTarget.ts`
- Extraer la lógica de parsing + validación + cálculo como función pura
- El store llama al use case en vez de contener la lógica
- El use case recibe dependencias por parámetro (recordGlucose, recordWeight, detectThreshold)
- Archivos afectados: ~4 (use case nuevo + trackerStore + tests)

#### 3.2 Extraer `exportData` de `useExportData`

- Crear `application/use-cases/exportData.ts`
- Recibir repositorios como dependencias inyectadas (no leer stores directamente)
- Arreglar violación de Scope Rule: `@features/recipe-engine/store/planStore` importado desde shared
- Mover `planStore` a `infrastructure/stores/` o implementar `planRepository` port
- Archivos afectados: ~4

### Fase 4: Definir puertos y crear adaptadores

**Objetivo**: que la aplicación dependa de interfaces, no de Zustand.

#### 4.1 Puertos (interfaces puras en `application/ports/`)

```ts
// application/ports/notificationRepository.ts
export interface NotificationRepository {
  getPending(): SystemNotification[];
  getHistory(): SystemNotification[];
  enqueue(notification: SystemNotification): void;
  acknowledge(id: string): void;
  dismiss(id: string): void;
  getCooldowns(): Record<string, number>;
  registerCooldown(id: string, timestamp: number): void;
  resetCooldown(id?: string): void;
}

// application/ports/activityRepository.ts
export interface ActivityRepository {
  getWeeklyMinutes(): number;
  getStrengthSessions(): number;
  getEntries(): ActivityEntry[];
  addEntry(entry: ActivityEntry): void;
  getStreak(): number;
}

// application/ports/biomarkerRepository.ts
export interface BiomarkerRepository {
  getGlucoseHistory(): GlucoseReading[];
  getWeightHistory(): WeightReading[];
  getTrend(): BiomarkerTrend;
  recordGlucose(reading: GlucoseReading): void;
  recordWeight(kg: number, cm: number): WeightReading;
  detectThresholdCrossing(): 'crossed_above' | 'crossed_below' | null;
}
```

#### 4.2 Adaptadores (en `infrastructure/adapters/`)

Cada adaptador wrappea un Zustand store, implementando el puerto correspondiente:

```ts
// infrastructure/adapters/zustandNotificationRepository.ts
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import type { NotificationRepository } from '@application/ports/notificationRepository';

export function createZustandNotificationRepository(): NotificationRepository {
  // Retorna un objeto que envuelve useNudgeStore.getState()
}
```

### Fase 5: Composition Root

**Objetivo**: un solo punto de creación y wiring de dependencias.

```ts
// infrastructure/compositionRoot.ts
export function createContainer() {
  // 1. Crear adaptadores (implementan puertos con Zustand)
  const notificationRepo = createZustandNotificationRepository();
  const activityRepo = createZustandActivityRepository();
  const biomarkerRepo = createZustandBiomarkerRepository();
  // ...

  // 2. Crear casos de uso (reciben puertos, no stores)
  const evaluateNudges = createEvaluateNudgesUseCase({
    notificationRepo,
    activityRepo,
    biomarkerRepo,
    // ...
  });

  const calculateTarget = createCalculateTargetUseCase({
    biomarkerRepo,
    // ...
  });

  // 3. Retornar contenedor tipado
  return {
    evaluateNudges,
    calculateTarget,
    // ...
  };
}
```

El container se instancia en `main.tsx` y se pasa por React Context o se importa como singleton (el composition root es el ÚNICO singleton permitido).

### Fase 6: Actualización de tests

**Objetivo**: que los tests reflejen la nueva estructura sin perder cobertura.

| Tipo de test              | Cambio                                          |
| ------------------------- | ----------------------------------------------- |
| Tests de dominio          | Sin cambio (ya son puros)                       |
| Tests de casos de uso     | NUEVOS: usan fakes in-memory de los puertos     |
| Tests de adaptadores      | NUEVOS: tests de contrato contra los puertos    |
| Tests de stores           | Se mantienen (Zustand stores siguen existiendo) |
| Tests de containers/views | Sin cambio                                      |

### Orden de ejecución (por fase, secuencial)

```
Fase 1 (sanitización) → Fase 2 (reorganización) → Fase 3 (extracción) → Fase 4 (puertos) → Fase 5 (composition root) → Fase 6 (tests)
```

Cada fase es un PR independiente (o una serie de commits atómicos dentro de un PR) que deja los 735 tests en verde antes de continuar. La Fase 1 es la de menor riesgo y mayor retorno inmediato.

### Skills impactados

| Skill                      | Cambio necesario                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `scope-rule`               | Actualizar paths: `shared/domain` → `domain/`, `shared/stores` → `infrastructure/stores/` |
| `container-presentational` | Sin cambio                                                                                |
| `tdd-strict`               | Añadir: tests de casos de uso con fakes in-memory                                         |
| `architecture-decisions`   | Añadir: Clean Architecture layered pattern como decisión de arquitectura                  |
| `ddd-analysis`             | Sin cambio                                                                                |
| `code-smells`              | Sin cambio                                                                                |
| `work-methodology`         | Añadir: verificación de regla de dependencias en PR review                                |
| `AGENTS.md`                | Actualizar tabla de skills y paths                                                        |
| `skills/README.md`         | Actualizar paths                                                                          |

## Pillars Compliance

- **Security by Design**: ✅ La separación de capas aísla la lógica de seguridad (AES-GCM en `infrastructure/storage.ts`) del dominio. El dominio nunca toca crypto, localStorage ni Web APIs.
- **SRP + Modularidad**: ✅ Cada capa tiene una responsabilidad única. Los casos de uso orquestan, el dominio calcula, la infraestructura persiste. Cambiar la persistencia no toca el dominio.
- **Domain Isolation**: ✅ El dominio será 100% TypeScript puro + Zod. Cero imports de React, Zustand, Vite, o Web APIs. Testable sin jsdom.
- **Ubiquitous Language**: ✅ Los nombres de puertos y casos de uso reflejan el lenguaje del dominio (`NotificationRepository`, `evaluateNudges`, `calculateTarget`), no de infraestructura (`useNudgeStore`, `getState`).

## Consequences

- ✅ Dominio 100% puro: testable sin jsdom, portable a cualquier runtime
- ✅ Casos de uso testables con fakes in-memory (sin mockear Zustand)
- ✅ Cambiar persistencia (localStorage → IndexedDB → Supabase) no toca dominio ni aplicación
- ✅ Nuevas features siguen un patrón predecible: puerto → adaptador → caso de uso → container → view
- ✅ La regla de dependencias es enforceable por tooling (eslint rule `import/no-restricted-paths`)
- ✅ Composition root explícito: todas las dependencias se crean en un solo lugar
- ❌ Migración grande: ~40-50 archivos movidos/renombrados/creados
- ❌ Curva de aprendizaje: el equipo debe entender el patrón de puertos/adaptadores
- ❌ Más archivos: la estructura es más verbose que el `shared/` monolítico actual
- ❌ Los `path aliases` de TypeScript (`@shared/*`, `@features/*`, `@infrastructure/*`) deben redefinirse para `@domain/*` y `@application/*`
- ❌ `useExportData` actualmente viola la Scope Rule (importa `@features/recipe-engine/store/planStore` desde shared). La Fase 3.2 lo resuelve moviendo `planStore` a infraestructura o definiendo un `planRepository` port.

## Rollback Strategy

La Fase 1 (sanitización del dominio) es atómica y reversible: si algo falla, `git revert`. Las fases 2-6 se ejecutan en PRs incrementales. Si una fase intermedia introduce regresiones, se revierte ese PR sin afectar el resto. Las fases están ordenadas de menor a mayor riesgo.

## Traceability

| Requisito                        | Cubierto por                                                  |
| -------------------------------- | ------------------------------------------------------------- |
| ADR-001 (Screaming Architecture) | Se mantiene: features/ sigue gritando dominio de negocio      |
| ADR-002 (Domain Model Zod TS6)   | Se fortalece: dominio aislado, sin dependencias de framework  |
| ADR-008 (Nudge Taxonomy)         | Se refuerza: nudge engine ya sigue el patrón correcto         |
| ADR-011 (Production Readiness)   | V2 Supabase usa los mismos puertos definidos aquí             |
| Scope Rule (skill)               | Se actualiza: shared reducido a UI/i18n/hooks de presentación |
