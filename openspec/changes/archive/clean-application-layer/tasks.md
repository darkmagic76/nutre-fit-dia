# Tasks: Clean Application Layer (Fase 3)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-400 (file moves + refactors + tests) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No (single PR acceptable) |
| Suggested split | Single PR with 4 logical commits |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Domain errors + inputParsing | PR 1 | Foundation: file moves, no logic changes |
| 2 | Refactor calculateTarget | PR 1 | Core change: remove Translations param |
| 3 | Typed ports for exportData | PR 1 | Core change: replace StoreSnapshot |
| 4 | Update all consumers + cleanup | PR 1 | Import updates, delete old files |

**Note**: Single PR is acceptable because changes are tightly coupled and tests verify each phase incrementally.

---

## Phase 1: Domain Errors (Foundation)

### TDD Cycle: RED → GREEN → REFACTOR

- [ ] **1.1 RED**: Create `src/domain/errors.test.ts` with all test cases from `src/shared/errors.test.ts`
  - Test: `DomainError` has code and message
  - Test: `DomainError` does not leak context into message
  - Test: `ValidationError` has VALIDATION_ERROR code
  - Test: `ValidationError` is instance of DomainError
  - Test: `NotFoundError` has NOT_FOUND code
  - Test: `NotFoundError` is instance of DomainError
  - **Verify**: `pnpm test:run src/domain/errors.test.ts` — FAILS (file doesn't exist yet)

- [ ] **1.2 GREEN**: Create `src/domain/errors.ts` with minimum implementation
  - Define `DomainErrorCode` union type: `'GLUCOSE_REQUIRED' | 'GLUCOSE_MUST_BE_POSITIVE' | 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE' | 'IMC_THRESHOLD_CROSSED' | 'INVALID_NUMERIC_INPUT'`
  - Define `DomainError` class with `code`, `message`, `context`
  - Define `ValidationError` class extending `DomainError`
  - Define `NotFoundError` class extending `DomainError`
  - **Verify**: `pnpm test:run src/domain/errors.test.ts` — PASSES

- [ ] **1.3 REFACTOR**: Update all 12 consumer files to import from `@domain/errors`
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
  - **Verify**: `pnpm typecheck` — PASSES (no import errors)

- [ ] **1.4 CLEANUP**: Delete `src/shared/errors.ts` and `src/shared/errors.test.ts`
  - **Verify**: `pnpm test:run` — all 803 tests PASS

---

## Phase 2: Domain Input Parsing (Foundation)

### TDD Cycle: RED → GREEN → REFACTOR

- [ ] **2.1 RED**: Create `src/domain/inputParsing.test.ts` with all test cases from `src/shared/utils/sanitize.test.ts`
  - Test: parses valid decimal value
  - Test: parses valid integer
  - Test: throws ValidationError for non-numeric input
  - Test: throws ValidationError for multiple decimal points
  - Test: throws ValidationError for empty string
  - Test: throws ValidationError for value below min
  - Test: throws ValidationError for value above max
  - Test: includes context in ValidationError
  - **Verify**: `pnpm test:run src/domain/inputParsing.test.ts` — FAILS (file doesn't exist yet)

- [ ] **2.2 GREEN**: Create `src/domain/inputParsing.ts` with minimum implementation
  - Import `ValidationError` from `@domain/errors`
  - Implement `parseNumeric(value: string, max: number, min: number): number`
  - Throw `ValidationError` with `code: 'INVALID_NUMERIC_INPUT'` and context `{ value, max, min }`
  - **Verify**: `pnpm test:run src/domain/inputParsing.test.ts` — PASSES

- [ ] **2.3 REFACTOR**: Update `src/application/use-cases/calculateTarget.ts` to import from `@domain/inputParsing`
  - Change: `import { parseNumeric } from '@shared/utils'` → `import { parseNumeric } from '@domain/inputParsing'`
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **2.4 CLEANUP**: Delete `src/shared/utils/sanitize.ts` and `src/shared/utils/sanitize.test.ts`
  - **Verify**: `pnpm test:run` — all 803 tests PASS

---

## Phase 3: Refactor calculateTarget (Core Change)

### TDD Cycle: RED → GREEN → REFACTOR

- [ ] **3.1 RED**: Update `src/application/use-cases/calculateTarget.test.ts` to expect error codes
  - Remove `Translations` parameter from all test calls
  - Update assertions to check `error.code` instead of `error.message`
  - Add test: returns `ValidationError` with `code: 'INVALID_NUMERIC_INPUT'` for non-numeric weight
  - Add test: returns `ValidationError` with `code: 'GLUCOSE_REQUIRED'` for empty glucose
  - Add test: returns `ValidationError` with `code: 'GLUCOSE_MUST_BE_POSITIVE'` for non-positive glucose
  - Add test: returns `ValidationError` with `code: 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE'` with context
  - Add test: returns `ValidationError` with `code: 'IMC_THRESHOLD_CROSSED'` with context
  - **Verify**: `pnpm test:run src/application/use-cases/calculateTarget.test.ts` — FAILS (signature mismatch)

- [ ] **3.2 GREEN**: Refactor `src/application/use-cases/calculateTarget.ts` to return error codes
  - Remove `t: Translations` parameter
  - Remove imports: `Translations`, `ValidationError` from `@shared/errors`, `parseNumeric` from `@shared/utils`
  - Import `ValidationError` from `@domain/errors`
  - Import `parseNumeric` from `@domain/inputParsing`
  - Replace all `new ValidationError(t['errors.xxx'])` with `new ValidationError('ERROR_CODE', { context })`
  - **Verify**: `pnpm test:run src/application/use-cases/calculateTarget.test.ts` — PASSES

- [ ] **3.3 REFACTOR**: Update `src/infrastructure/compositionRoot.ts`
  - Remove `t: Translations` parameter from `calculateTarget` wrapper
  - Change: `calculateTargetUseCase(input, biomarkerRepo, t)` → `calculateTargetUseCase(input, biomarkerRepo)`
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **3.4 REFACTOR**: Update `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx`
  - Remove `t` parameter from `container.calculateTarget(input, t)` call
  - Change: `container.calculateTarget(input, t)` → `container.calculateTarget(input)`
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **3.5 REFACTOR**: Update `src/features/metabolic-tracker/components/ProfileError.tsx` to translate error codes
  - Import `useT` from `@shared/i18n/useT`
  - Create `translateErrorCode(code, context, t)` helper function
  - Map error codes to i18n keys:
    - `'GLUCOSE_REQUIRED'` → `t['errors.glucoseRequiredForMetabolicProfile']`
    - `'GLUCOSE_MUST_BE_POSITIVE'` → `t['errors.glucoseMustBePositive']`
    - `'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE'` → `t['errors.diagnosisAgeExceedsCurrentAge']` (replace placeholders)
    - `'IMC_THRESHOLD_CROSSED'` → `t['errors.imcThresholdCrossedUp']` or `t['errors.imcThresholdCrossedDown']`
    - `'INVALID_NUMERIC_INPUT'` → `t['errors.processingError']` (replace `{message}` placeholder)
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **3.6 REFACTOR**: Update `src/features/metabolic-tracker/components/ProfileError.test.tsx`
  - Mock `useT()` to return test translations
  - Update assertions to verify translated messages
  - **Verify**: `pnpm test:run src/features/metabolic-tracker/components/ProfileError.test.tsx` — PASSES

- [ ] **3.7 VERIFY**: Run full test suite
  - **Verify**: `pnpm test:run` — all 803 tests PASS

---

## Phase 4: Typed Ports for exportData (Core Change)

### TDD Cycle: RED → GREEN → REFACTOR

- [ ] **4.1 RED**: Create port interfaces
  - Create `src/application/ports/trackerRepository.ts` with `TrackerRepository` interface
  - Create `src/application/ports/nudgeRepository.ts` with `NudgeRepository` interface
  - Create `src/application/ports/planRepository.ts` with `PlanRepository` interface
  - Each interface defines `getState(): StateType`
  - **Verify**: `pnpm typecheck` — PASSES (interfaces exist)

- [ ] **4.2 RED**: Update `src/application/use-cases/exportData.test.ts` to use typed ports
  - Replace `StoreSnapshot` interface with typed port imports
  - Update fake stores to implement typed port interfaces
  - **Verify**: `pnpm test:run src/application/use-cases/exportData.test.ts` — FAILS (signature mismatch)

- [ ] **4.3 GREEN**: Refactor `src/application/use-cases/exportData.ts` to use typed ports
  - Remove `interface StoreSnapshot` declaration
  - Import typed ports from `@application/ports/`
  - Update function signature to accept typed ports
  - **Verify**: `pnpm test:run src/application/use-cases/exportData.test.ts` — PASSES

- [ ] **4.4 REFACTOR**: Create adapters (if needed)
  - Check if `src/infrastructure/adapters/` needs new adapters for tracker, nudge, plan
  - If yes, create `zustandTrackerRepository.ts`, `zustandNudgeRepository.ts`, `zustandPlanRepository.ts`
  - Each adapter wraps Zustand store and implements port interface
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **4.5 REFACTOR**: Update `src/infrastructure/compositionRoot.ts`
  - Import typed port adapters
  - Pass typed ports to `exportDataUseCase` instead of raw Zustand stores
  - **Verify**: `pnpm typecheck` — PASSES

- [ ] **4.6 VERIFY**: Run full test suite
  - **Verify**: `pnpm test:run` — all 803 tests PASS

---

## Phase 5: Final Verification

- [ ] **5.1**: Run `pnpm quality` (format + lint + typecheck + tests)
  - **Verify**: All checks PASS

- [ ] **5.2**: Run `pnpm build` (tsc -b && vite build)
  - **Verify**: Build succeeds

- [ ] **5.3**: Verify no `@shared/` imports in `application/`
  - Run: `grep -r "from '@shared/" src/application/ --include="*.ts" --include="*.tsx"`
  - **Verify**: Zero matches (except type-only imports if any)

- [ ] **5.4**: Verify `calculateTarget` signature
  - Run: `grep -A 3 "export function calculateTarget" src/application/use-cases/calculateTarget.ts`
  - **Verify**: No `Translations` parameter

- [ ] **5.5**: Verify `exportData` signature
  - Run: `grep -A 10 "export function exportData" src/application/use-cases/exportData.ts`
  - **Verify**: No `StoreSnapshot` interface, all 6 parameters are typed ports

- [ ] **5.6**: Verify coverage
  - Run: `pnpm test:run --coverage`
  - **Verify**: statements ≥ 80%, branches ≥ 80%, functions = 100%, lines ≥ 80%

---

## Commit Strategy

**Single PR with 4 logical commits**:

1. `refactor: move error classes to domain layer`
   - Phase 1: Domain errors
   - Phase 2: Domain inputParsing
   - Update all imports

2. `refactor: remove Translations from calculateTarget`
   - Phase 3: Refactor calculateTarget
   - Update ProfileError to translate error codes

3. `refactor: replace StoreSnapshot with typed ports in exportData`
   - Phase 4: Typed ports for exportData
   - Create adapters if needed

4. `docs: update project documentation post Fase 3`
   - Update TASKS.md, README.md, FR-MATRIX
   - Mark Fase 3 as complete

---

## Success Criteria

- [ ] Zero imports from `@application/` to `@shared/` (except types)
- [ ] `calculateTarget` does not receive `Translations` parameter
- [ ] `exportData` uses typed repository ports (no `StoreSnapshot`)
- [ ] All 803 tests pass
- [ ] Coverage ≥ 80% statements/branches, 100% functions
- [ ] `pnpm quality` passes
- [ ] `pnpm build` passes
