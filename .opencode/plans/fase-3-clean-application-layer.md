# Plan: Fase 3 — Clean Application Layer (REFACTOR_ARCH.md)

## Goal

Eliminar violaciones 1, 2 y 8 del REFACTOR_ARCH.md: `application/` no debe importar de `@shared/` (presentación).

---

## Contexto

### Violaciones a resolver

| #   | Violación                               | Archivo                    | Problema                                               |
| --- | --------------------------------------- | -------------------------- | ------------------------------------------------------ |
| 1   | `exportData` usa `StoreSnapshot` inline | `exportData.ts:3-6`        | Interfaz genérica en vez de puertos reales             |
| 2   | `calculateTarget` importa de `@shared/` | `calculateTarget.ts:3-5`   | `Translations`, `ValidationError`, `parseNumeric`      |
| 8   | `calculateTarget` hace parsing inline   | `calculateTarget.ts:54-93` | Lógica de parsing en use case en vez de domain service |

### Impacto actual

- **15 archivos** usan `ValidationError` desde `@shared/errors`
- **1 archivo** usa `parseNumeric` desde `@shared/utils`
- **803 tests** deben seguir pasando

---

## Decisiones de diseño

### 1. Error handling: `ValidationError` con códigos + contexto

**Problema**: `calculateTarget` recibe `Translations` para generar mensajes traducidos. Esto viola la regla de dependencias (application → shared).

**Solución**: `ValidationError` sigue siendo una clase (preserva `toBeInstanceOf(Error)`), pero recibe códigos de error + contexto en vez de mensajes traducidos.

```typescript
// domain/errors.ts
export type DomainErrorCode =
  | 'GLUCOSE_REQUIRED'
  | 'GLUCOSE_MUST_BE_POSITIVE'
  | 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE'
  | 'IMC_THRESHOLD_CROSSED'
  | 'INVALID_NUMERIC_INPUT';

export class ValidationError extends DomainError {
  constructor(code: DomainErrorCode, context?: Record<string, unknown>) {
    super(code, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

// calculateTarget devuelve:
return {
  caloricTarget: null,
  caloricRestrictionActive: false,
  profileError: new ValidationError('DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE', {
    diagnosisAge: da,
    currentAge: a,
  }),
};
```

**Ventajas**:

- ✅ Use case puro (no sabe de i18n)
- ✅ Preserva contexto (el componente puede armar mensajes dinámicos)
- ✅ Fácil de testear (assert sobre `error.code` y `error.context`)
- ✅ No rompe `toBeInstanceOf(Error)` en tests existentes

### 2. Traducción en el componente `ProfileError`

**Problema**: Si el use case devuelve códigos, ¿quién traduce?

**Solución**: El componente `ProfileError` traduce usando `useT()`.

```tsx
// ProfileError.tsx
import { useT } from '@shared/i18n/useT';
import type { ValidationError } from '@domain/errors';

export function ProfileError({ error }: { error: ValidationError | null }) {
  const t = useT();
  if (!error) return null;

  const message = translateErrorCode(error.code, error.context, t);
  return <p role="alert">{message}</p>;
}

function translateErrorCode(
  code: string,
  context: Record<string, unknown> | undefined,
  t: Translations,
): string {
  switch (code) {
    case 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE':
      return t['errors.diagnosisAgeExceedsCurrentAge']
        .replace('{diagnosisAge}', String(context?.diagnosisAge))
        .replace('{currentAge}', String(context?.currentAge));
    // ... otros casos
  }
}
```

### 3. Imports: actualizar todos (no re-exportar)

**Problema**: ¿Re-exportamos desde `shared/errors.ts` para backward compat o actualizamos los 15 imports?

**Solución**: Actualizar todos los imports. Código explícito, no hay deuda técnica oculta.

**Archivos a actualizar**:

- `src/features/med-diet-validator/components/DailyViolations.tsx`
- `src/features/metabolic-tracker/MetabolicTrackerView.tsx`
- `src/features/metabolic-tracker/MetabolicTrackerContainer.test.tsx`
- `src/features/metabolic-tracker/MetabolicTrackerView.test.tsx`
- `src/features/metabolic-tracker/components/ProfileError.tsx`
- `src/features/metabolic-tracker/components/ProfileError.test.tsx`
- `src/domain/rationValidator.ts`
- `src/infrastructure/stores/trackerStore.test.ts`
- `src/infrastructure/stores/trackerStore.ts`
- `src/application/use-cases/calculateTarget.test.ts`
- `src/application/use-cases/calculateTarget.ts`
- `src/shared/utils/sanitize.test.ts`

### 4. `parseNumeric` → `domain/inputParsing.ts`

**Problema**: `parseNumeric` está en `shared/utils/sanitize.ts` pero es validación de dominio (lanza `ValidationError`).

**Solución**: Mover a `domain/inputParsing.ts`. Es lógica de dominio, no utility genérica.

### 5. Puertos reales para `exportData`

**Problema**: `exportData` usa `StoreSnapshot` inline en vez de puertos reales.

**Solución**: Crear puertos `TrackerRepository`, `NudgeRepository`, `PlanRepository` en `application/ports/`.

---

## Fases de implementación

### Fase 1: Mover errores a domain (RED → GREEN → REFACTOR)

**Archivos a crear**:

- `src/domain/errors.ts` — `DomainError`, `DomainErrorCode`, `ValidationError`, `NotFoundError`
- `src/domain/errors.test.ts` — tests (mover desde `shared/errors.test.ts`)

**Archivos a eliminar**:

- `src/shared/errors.ts`
- `src/shared/errors.test.ts`

**Archivos a actualizar** (imports):

- 12 archivos que usan `ValidationError`

**TDD**:

1. RED: Crear `domain/errors.test.ts` con tests existentes
2. GREEN: Crear `domain/errors.ts` con las clases
3. REFACTOR: Actualizar imports en los 12 archivos
4. Eliminar `shared/errors.ts` y `shared/errors.test.ts`

**Verificación**: `pnpm test:run` (803 tests deben pasar)

---

### Fase 2: Mover `parseNumeric` a domain (RED → GREEN → REFACTOR)

**Archivos a crear**:

- `src/domain/inputParsing.ts` — `parseNumeric`
- `src/domain/inputParsing.test.ts` — tests (mover desde `shared/utils/sanitize.test.ts`)

**Archivos a eliminar**:

- `src/shared/utils/sanitize.ts`
- `src/shared/utils/sanitize.test.ts`

**Archivos a actualizar**:

- `src/application/use-cases/calculateTarget.ts` — importar desde `@domain/inputParsing`

**TDD**:

1. RED: Crear `domain/inputParsing.test.ts` con tests existentes
2. GREEN: Crear `domain/inputParsing.ts` con `parseNumeric`
3. REFACTOR: Actualizar import en `calculateTarget.ts`
4. Eliminar `shared/utils/sanitize.ts` y `shared/utils/sanitize.test.ts`

**Verificación**: `pnpm test:run`

---

### Fase 3: Refactor `calculateTarget` — remover `Translations` (RED → GREEN → REFACTOR)

**Archivos a modificar**:

- `src/application/use-cases/calculateTarget.ts` — remover param `t: Translations`, devolver error codes
- `src/application/use-cases/calculateTarget.test.ts` — actualizar tests para verificar error codes
- `src/infrastructure/compositionRoot.ts` — actualizar wiring (no pasar `t`)
- `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` — no pasar `t` al use case
- `src/features/metabolic-tracker/components/ProfileError.tsx` — traducir error codes via `useT()`
- `src/features/metabolic-tracker/components/ProfileError.test.tsx` — actualizar tests

**TDD**:

1. RED: Actualizar `calculateTarget.test.ts` para esperar error codes (tests fallan)
2. GREEN: Refactor `calculateTarget.ts` para devolver error codes (tests pasan)
3. REFACTOR: Actualizar `ProfileError.tsx` para traducir error codes
4. REFACTOR: Actualizar `compositionRoot.ts` y `MetabolicTrackerContainer.tsx`

**Verificación**: `pnpm test:run`

---

### Fase 4: Puertos reales para `exportData` (RED → GREEN → REFACTOR)

**Archivos a crear**:

- `src/application/ports/trackerRepository.ts`
- `src/application/ports/nudgeRepository.ts`
- `src/application/ports/planRepository.ts`

**Archivos a modificar**:

- `src/application/use-cases/exportData.ts` — reemplazar `StoreSnapshot` con puertos
- `src/application/use-cases/exportData.test.ts` — actualizar tests para usar puertos
- `src/infrastructure/compositionRoot.ts` — pasar adapters reales
- `src/infrastructure/adapters/` — crear adapters si no existen

**TDD**:

1. RED: Actualizar `exportData.test.ts` para usar puertos (tests fallan)
2. GREEN: Crear puertos y actualizar `exportData.ts` (tests pasan)
3. REFACTOR: Actualizar `compositionRoot.ts` para pasar adapters

**Verificación**: `pnpm test:run`

---

## Orden de ejecución

1. **Fase 1** — Mover errores a domain (riesgo bajo, establece base)
2. **Fase 2** — Mover `parseNumeric` a domain (riesgo bajo)
3. **Fase 3** — Refactor `calculateTarget` (riesgo medio, requiere más cambios)
4. **Fase 4** — Puertos reales para `exportData` (riesgo bajo)

---

## Verificación final

```bash
pnpm quality          # format + lint + typecheck + tests
pnpm build            # tsc -b && vite build
```

**Checklist**:

- [ ] No hay imports de `@application/` hacia `@shared/` (excepto tipos puros)
- [ ] `ValidationError` vive en `domain/errors.ts`
- [ ] `parseNumeric` vive en `domain/inputParsing.ts`
- [ ] `calculateTarget` no recibe `Translations` (devuelve error codes)
- [ ] `exportData` usa los 5 puertos reales (no `StoreSnapshot`)
- [ ] 803 tests pasan
- [ ] Coverage ≥ 80% statements/branches, 100% functions

---

## Specs afectadas (delta updates)

| Spec                    | Impacto                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `application-use-cases` | `calculateTarget` signature changes, `exportData` uses real ports   |
| `application-ports`     | New ports: `TrackerRepository`, `NudgeRepository`, `PlanRepository` |
| `shared-utils`          | `parseNumeric` moves to domain; `shared/utils/sanitize.ts` removed  |
| `domain-purity`         | New domain files must comply with R1                                |
| `composition-root`      | Wiring changes for new ports and error translation                  |
| `data-export`           | Already references ports — needs `StoreSnapshot` → real ports       |
