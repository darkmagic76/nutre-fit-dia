# Design: Clean Application Layer (Fase 3)

## Overview

Esta fase elimina las violaciones 1, 2 y 8 del REFACTOR_ARCH.md, asegurando que `application/` no dependa de `@shared/` (presentación).

## Architecture Decisions

### AD-1: Error Objects con Códigos + Contexto

**Decisión**: `ValidationError` sigue siendo una clase (preserva `toBeInstanceOf(Error)`), pero recibe códigos de error + contexto en vez de mensajes traducidos.

**Rationale**:
- ✅ Use case puro (no sabe de i18n)
- ✅ Preserva contexto (el componente puede armar mensajes dinámicos)
- ✅ Fácil de testear (assert sobre `error.code` y `error.context`)
- ✅ No rompe `toBeInstanceOf(Error)` en tests existentes
- ✅ Escalable (agregar nuevos errores no cambia la firma)

**Alternativa considerada**: Error codes simples (strings). Descartada porque pierde contexto.

### AD-2: Traducción en el Componente

**Decisión**: El componente `ProfileError` traduce error codes a mensajes usando `useT()`.

**Rationale**:
- ✅ Separación de responsabilidades (use case = lógica, componente = presentación)
- ✅ i18n donde corresponde (UI layer)
- ✅ Fácil de testear (mock `useT()` en tests de componente)

### AD-3: Imports Explícitos (No Re-exports)

**Decisión**: Actualizar todos los 15 imports de `@shared/errors` → `@domain/errors`. No re-exportar.

**Rationale**:
- ✅ Código explícito (cada import apunta a la fuente de verdad)
- ✅ No hay "deuda técnica oculta"
- ✅ Respeta la regla de dependencias (application → domain, no application → shared)
- ✅ Más trabajo inicial, pero el código queda limpio

### AD-4: parseNumeric como Lógica de Dominio

**Decisión**: Mover `parseNumeric` de `shared/utils/sanitize.ts` → `domain/inputParsing.ts`.

**Rationale**:
- ✅ Valida reglas de negocio (rango aceptable para peso, altura, edad)
- ✅ Lanza `ValidationError` (error de dominio)
- ✅ No es una utility function genérica (como `capitalize` o `formatDate`)
- ✅ Domain purity: application → domain, no application → shared

### AD-5: Puertos Tipados para exportData

**Decisión**: Crear `TrackerRepository`, `NudgeRepository`, `PlanRepository` en `application/ports/`. `exportData` recibe estos puertos en vez de `StoreSnapshot`.

**Rationale**:
- ✅ Type safety (no `any`)
- ✅ Consistencia con otros puertos (`BiomarkerRepository`, `LogRepository`, etc.)
- ✅ Fácil de testear (fakes in-memory)
- ✅ Documenta el contrato entre use case e infrastructure

## File Structure

### New Files

```
src/domain/
├── errors.ts                    # DomainError, ValidationError, NotFoundError
├── errors.test.ts               # Tests for domain errors
├── inputParsing.ts              # parseNumeric
└── inputParsing.test.ts         # Tests for parseNumeric

src/application/ports/
├── trackerRepository.ts         # TrackerRepository interface
├── nudgeRepository.ts           # NudgeRepository interface
└── planRepository.ts            # PlanRepository interface
```

### Modified Files

```
src/application/use-cases/
├── calculateTarget.ts           # Remove Translations param, return error codes
├── calculateTarget.test.ts      # Update tests for error codes
├── exportData.ts                # Replace StoreSnapshot with typed ports
└── exportData.test.ts           # Update tests for typed ports

src/infrastructure/
├── compositionRoot.ts           # Update wiring (no Translations, typed ports)
└── adapters/
    ├── zustandTrackerRepository.ts    # New adapter (if needed)
    ├── zustandNudgeRepository.ts      # New adapter (if needed)
    └── zustandPlanRepository.ts       # New adapter (if needed)

src/features/metabolic-tracker/
├── MetabolicTrackerContainer.tsx      # Don't pass Translations to use case
└── components/
    ├── ProfileError.tsx               # Translate error codes via useT()
    └── ProfileError.test.tsx          # Update tests

src/features/med-diet-validator/components/
└── DailyViolations.tsx          # Update import: @shared/errors → @domain/errors

src/features/metabolic-tracker/
├── MetabolicTrackerView.tsx     # Update import
├── MetabolicTrackerContainer.test.tsx  # Update import
└── MetabolicTrackerView.test.tsx       # Update import

src/domain/
└── rationValidator.ts           # Update import

src/infrastructure/stores/
├── trackerStore.ts              # Update import
└── trackerStore.test.ts         # Update import
```

### Deleted Files

```
src/shared/
├── errors.ts                    # Replaced by domain/errors.ts
├── errors.test.ts               # Replaced by domain/errors.test.ts
└── utils/
    ├── sanitize.ts              # Replaced by domain/inputParsing.ts
    └── sanitize.test.ts         # Replaced by domain/inputParsing.test.ts
```

## Implementation Order

### Phase 1: Domain Errors (Foundation)

**Goal**: Move error classes to domain layer.

**Steps**:
1. Create `src/domain/errors.ts` with `DomainError`, `DomainErrorCode`, `ValidationError`, `NotFoundError`
2. Create `src/domain/errors.test.ts` (move tests from `shared/errors.test.ts`)
3. Update 12 consumer files to import from `@domain/errors`
4. Delete `src/shared/errors.ts` and `src/shared/errors.test.ts`
5. Run `pnpm test:run` — all 803 tests must pass

**Risk**: LOW. Pure file move + import updates.

### Phase 2: Domain Input Parsing (Foundation)

**Goal**: Move `parseNumeric` to domain layer.

**Steps**:
1. Create `src/domain/inputParsing.ts` with `parseNumeric`
2. Create `src/domain/inputParsing.test.ts` (move tests from `shared/utils/sanitize.test.ts`)
3. Update `src/application/use-cases/calculateTarget.ts` to import from `@domain/inputParsing`
4. Delete `src/shared/utils/sanitize.ts` and `src/shared/utils/sanitize.test.ts`
5. Run `pnpm test:run` — all 803 tests must pass

**Risk**: LOW. Pure file move + import update.

### Phase 3: Refactor calculateTarget (Core Change)

**Goal**: Remove `Translations` parameter from `calculateTarget`.

**Steps**:
1. Update `src/application/use-cases/calculateTarget.test.ts` to expect error codes (RED)
2. Refactor `src/application/use-cases/calculateTarget.ts` to return error codes (GREEN)
3. Update `src/infrastructure/compositionRoot.ts` to not pass `Translations`
4. Update `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` to not pass `Translations`
5. Refactor `src/features/metabolic-tracker/components/ProfileError.tsx` to translate error codes
6. Update `src/features/metabolic-tracker/components/ProfileError.test.tsx`
7. Run `pnpm test:run` — all 803 tests must pass

**Risk**: MEDIUM. Changes use case signature + UI translation logic.

### Phase 4: Typed Ports for exportData (Core Change)

**Goal**: Replace `StoreSnapshot` with typed repository ports.

**Steps**:
1. Create `src/application/ports/trackerRepository.ts`
2. Create `src/application/ports/nudgeRepository.ts`
3. Create `src/application/ports/planRepository.ts`
4. Update `src/application/use-cases/exportData.test.ts` to use typed ports (RED)
5. Refactor `src/application/use-cases/exportData.ts` to use typed ports (GREEN)
6. Create adapters in `src/infrastructure/adapters/` (if needed)
7. Update `src/infrastructure/compositionRoot.ts` to pass typed ports
8. Run `pnpm test:run` — all 803 tests must pass

**Risk**: LOW. Pure interface change + adapter creation.

## Testing Strategy

### TDD Approach

Each phase follows strict TDD:

1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping tests green

### Test Coverage

- **Domain errors**: 100% coverage (all error codes, context preservation)
- **Domain inputParsing**: 100% coverage (all validation paths)
- **calculateTarget**: 100% coverage (all error codes, happy path)
- **exportData**: 100% coverage (all 6 ports, JSON structure)
- **ProfileError**: 100% coverage (all error code translations)

### Test Types

- **Unit tests**: Domain logic (errors, inputParsing, use cases)
- **Component tests**: ProfileError translation
- **Integration tests**: Composition root wiring

## Verification Checklist

After each phase:

- [ ] `pnpm test:run` passes (803 tests)
- [ ] `pnpm typecheck` passes (no type errors)
- [ ] `pnpm lint` passes (no lint errors)
- [ ] `pnpm format:check` passes (Prettier)
- [ ] Coverage ≥ 80% statements/branches, 100% functions

Final verification:

- [ ] Zero imports from `@application/` to `@shared/` (except types)
- [ ] `calculateTarget` does not receive `Translations` parameter
- [ ] `exportData` uses typed repository ports (no `StoreSnapshot`)
- [ ] `ValidationError` lives in `domain/errors.ts`
- [ ] `parseNumeric` lives in `domain/inputParsing.ts`
- [ ] `pnpm quality` passes (format + lint + typecheck + tests)
- [ ] `pnpm build` passes (tsc -b && vite build)

## Rollback Strategy

Each phase is a separate commit. If a phase fails:

1. Revert the commit: `git revert <commit-hash>`
2. Fix the issue
3. Re-commit

Since we're moving files (not deleting), rollback is straightforward.

## Success Criteria

- [ ] Zero imports from `@application/` to `@shared/` (except types)
- [ ] `calculateTarget` does not receive `Translations` parameter
- [ ] `exportData` uses typed repository ports (no `StoreSnapshot`)
- [ ] All 803 tests pass
- [ ] Coverage ≥ 80% statements/branches, 100% functions
- [ ] `pnpm quality` passes
- [ ] `pnpm build` passes
