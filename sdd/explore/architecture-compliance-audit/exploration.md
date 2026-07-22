# Architecture & SKILLS.md Compliance Audit

## Audit Date: 2026-07-21

## Project: nutre-fit-dia

---

## 1. Scope Rule

**Status: FAIL** — 3 violations, 2 critical

### Violations

| #   | File                                                                          | Issue                                                                                                     | Severity | Suggested Fix                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/shared/stores/activityStore.ts`                                          | Imports from `@features/activity-tracker/types` — **reverse dependency** (shared → feature)               | CRITICAL | Move `ActivityEntry` type and `DEFAULT_WEEKLY_GOAL` constant to `@shared/domain` or create `@shared/types/activity.ts`. The store must not depend on a feature.                                                                 |
| 2   | `src/shared/stores/planStore.ts`                                              | Imports from `@features/recipe-engine/services/planGenerator` — **reverse dependency** (shared → feature) | CRITICAL | Invert the dependency: define `WeeklyPlan` type and `generateWeeklyPlan` in shared domain/services, or make planStore local to recipe-engine.                                                                                   |
| 3   | `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx` | Imports `evaluateAndEnqueue` from `@features/nudge-engine` — **cross-feature import**                     | WARN     | If `evaluateAndEnqueue` is an integration boundary used by 1 feature, keep it local and consider a shared event bus. Currently 1 caller (nutritional-traffic-light), but the nudge-engine already reads shared stores directly. |

### Missing Shared (potentially local)

| File                             | Issue                                                                  | Suggested Fix                                           |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/shared/stores/planStore.ts` | `usePlanStore` is imported ONLY by `RecipeEngineContainer` (1 feature) | Move to `src/features/recipe-engine/store/planStore.ts` |

---

## 2. Screaming Architecture

**Status: PASS** ✓

All 7 feature directories use business-functionality names:

| Directory                    | What it screams                             | Container Match                          |
| ---------------------------- | ------------------------------------------- | ---------------------------------------- |
| `activity-tracker/`          | Physical activity tracking                  | `ActivityTrackerContainer.tsx` ✓         |
| `med-diet-validator/`        | Mediterranean diet compliance validation    | `MedDietValidatorContainer.tsx` ✓        |
| `metabolic-tracker/`         | Metabolic profile & caloric target tracking | `MetabolicTrackerContainer.tsx` ✓        |
| `nudge-engine/`              | Behavioral nudge & notification engine      | `NudgeEngineContainer.tsx` ✓             |
| `nutritional-traffic-light/` | Nutrition traffic light classification      | `NutritionalTrafficLightContainer.tsx` ✓ |
| `recipe-engine/`             | Meal plan & recipe generation               | `RecipeEngineContainer.tsx` ✓            |
| `sustainability/`            | Environmental sustainability scoring        | `SustainabilityContainer.tsx` ✓          |

No issues. The structure immediately communicates "metabolic health platform."

---

## 3. Container/Presentational Pattern

**Status: PASS** ✓

All 7 features follow the pattern:

- Container handles state, business logic, data fetching
- View/Presentational receives props

### Container naming verification

All containers match their feature directory name exactly (confirmed via rename in commit `234fe61`).

### Pattern per feature

| Feature                   | Container                          | View/Presentational    | Pattern OK? |
| ------------------------- | ---------------------------------- | ---------------------- | ----------- |
| activity-tracker          | `ActivityTrackerContainer`         | `ActivityTrackerView`  | ✓           |
| med-diet-validator        | `MedDietValidatorContainer`        | `DailyLogView`         | ✓           |
| metabolic-tracker         | `MetabolicTrackerContainer`        | `MetabolicTrackerView` | ✓           |
| nudge-engine              | `NudgeEngineContainer`             | `NudgePanelView`       | ✓           |
| nutritional-traffic-light | `NutritionalTrafficLightContainer` | `ScannerView`          | ✓           |
| recipe-engine             | `RecipeEngineContainer`            | `PlanView`             | ✓           |
| sustainability            | `SustainabilityContainer`          | `SustainabilityView`   | ✓           |

---

## 4. DDD & Ubiquitous Language

**Status: PASS** ✓

### Domain Language Assessment

- `classifyFood()`, `checkSafetyAlerts()`, `evaluateRules()` — domain actions ✓
- `Food`, `FoodCategory`, `TrafficLightColor` — domain entities ✓
- `computeIMC()`, `computeCaloricTarget()` — domain calculations ✓
- `ActivityEntry`, `WeeklyGoal` — domain values ✓
- `NudgeRule`, `NudgeContext` — domain concepts ✓
- `isRestrictionCandidate()`, `detectIMCThresholdCrossing()` — clinical domain language ✓
- **No** `.insertRow()`, `.save()`, `.update()` patterns found ✓

### Polysemic Terms

| Term         | Context A                        | Context B                              | Issue?                                  |
| ------------ | -------------------------------- | -------------------------------------- | --------------------------------------- |
| "validation" | `ValidationError` (input errors) | `ValidationResult` (ration compliance) | Acceptable — different bounded contexts |
| "activity"   | `ActivityTracker` (physical)     | Zustand activityStore (same)           | Consistent ✓                            |
| "target"     | Caloric target                   | Restriction target                     | Consistent ✓                            |
| "score"      | Sustainability score             | N/A                                    | Single context ✓                        |

No dangerous polysemia found.

### Bounded Contexts

Clear separation:

- **Nutritional Scanner** (traffic-light) → food classification
- **Diet Log** (med-diet-validator) → daily compliance tracking
- **Metabolic Profile** (metabolic-tracker) → user biometrics & caloric targets
- **Nudge Engine** (nudge-engine) → notifications & behavioral interventions
- **Recipe Engine** (recipe-engine) → meal plan generation
- **Activity Tracker** (activity-tracker) → physical activity monitoring
- **Sustainability** (sustainability) → environmental scoring

---

## 5. Security by Design / Security by Default

**Status: PASS** ✓

### Implemented

| Pattern                        | Location                            | Details                                                                 |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| Input validation               | `src/shared/utils/sanitize.ts`      | Regex-based numeric parsing with range validation (min/max)             |
| Schema validation              | `src/shared/domain/food.ts`         | Zod schemas with `.positive()`, `.min(0)`, range constraints            |
| Gender validation              | `src/shared/stores/trackerStore.ts` | Zod enum parse with error handling                                      |
| Safe defaults                  | `trackerStore.ts`                   | DEFAULT_WEIGHT=80, DEFAULT_HEIGHT=170, sensible defaults                |
| Error classification           | `src/shared/errors.ts`              | Tiered error types: `DomainError` → `ValidationError` / `NotFoundError` |
| Sanitized ingredient detection | `occultSugarDetector.ts`            | `.toLowerCase().trim()` normalization before pattern matching           |
| Accessibility                  | All UI components                   | ARIA labels, roles, keyboard navigation, `min-h-[44px]` touch targets   |
| Security footer                | `App.tsx`                           | Security.txt link (`.well-known/security.txt`)                          |

### OWASP/NIST Alignment

- Input validation at every boundary ✓
- Type-safe domain models (Zod) preventing injection ✓
- No eval(), no dangerouslySetInnerHTML ✓
- No sensitive data exposure in error messages (context is typed, not raw) ✓
- SPA-only architecture limits attack surface (no backend API) ✓

---

## 6. SRP & Modularity (OCP)

**Status: WARN** — 2 modules violate SRP

### Violations

| File                                                   | Lines | Issues                                                                                                                                                                                                                                     |
| ------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/stores/trackerStore.ts`                    | 161   | **Large class**: 11+ state fields, 9+ setters, `calculateTarget()` mixes validation, glucose recording, weight recording, IMC threshold detection, and caloric computation. Multiple reasons to change.                                    |
| `src/features/recipe-engine/services/planGenerator.ts` | 265   | **Long method / multiple concerns**: Template building (`buildDailyTemplate`), food selection (`pickSustainableFood`), AOVE enforcement (`enforceAOVE`), weekly distribution (`getWeeklySlots`). The module has too many responsibilities. |

### Positive

- Most files in `shared/utils/`, `shared/domain/`, `shared/services/`, `shared/ui/` follow SRP ✓
- Domain models are pure types/Schemas ✓
- Utility functions have single purpose ✓

---

## 7. Business Logic Isolation

**Status: WARN** — stores mix concerns but logic is pure

### Assessment

- Domain logic in `shared/domain/` is pure (no framework dependencies) ✓
- `shared/services/` are pure functions with no React/Zustand dependency ✓
- `shared/utils/` are pure utilities ✓
- **Stores** (`shared/stores/`) **mix concerns**: They use Zustand for state management AND call pure services — this is expected for the "integration boundary" layer. But tracking store imports from services and features, creating coupling.

### Concern

The `shared/stores/activityStore.ts` and `shared/stores/planStore.ts` import from features (see Scope Rule violations), breaking the principle that the core should not depend on features.

---

## 8. TDD Compliance

**Status: PASS** ✓

### Test Coverage

- **41 test files** found across the project
- **No direct test gaps**: Every source file either has a dedicated test file or is covered via integration tests

### Test Quality

- AAA pattern used consistently ✓
- Descriptive test names ✓
- `getByRole` preferred over `getByTestId` ✓
- No `getByTestId` found in any test file ✓

### Git History

The git history shows TDD-compatible patterns:

- `b7e9b85 feat: implement Nudge Engine core + 3 SafetyAlert rules (H2 PR1)`
- `c30f545 feat: implement Activity Goal Tracker V1 with compliance + streak (H1)`
- Multiple test-first commits visible (e.g., `cd438e7 test(nudge-engine): add body lambda coverage`)

### Pattern Compliance

- Refactors are done after features (e.g., `234fe61 refactor: rename containers`, `68c6770 refactor: Scope Rule + dead code cleanup`) ✓

### Files needing dedicated unit tests

| File                           | Currently tested via   |
| ------------------------------ | ---------------------- |
| `DailyLogView.tsx`             | Integration tests only |
| `CaloricSummary.tsx`           | Integration tests only |
| `DailyViolations.tsx`          | Integration tests only |
| `FoodList.tsx`                 | Integration tests only |
| `MetabolicTrackerView.tsx`     | Integration tests only |
| `ProfileForm.tsx`              | Integration tests only |
| `ProfileResults.tsx`           | Integration tests only |
| `ProfileError.tsx`             | Integration tests only |
| `ScannerView.tsx`              | Integration tests only |
| `SafetyAlertDisplay.tsx`       | Integration tests only |
| `ActivityTrackerContainer.tsx` | No tests               |
| `ActivityTrackerView.tsx`      | No tests               |
| `useTabNavigation.ts`          | No tests               |
| `activityStore.ts`             | No tests               |

---

## 9. Code Smells Detection

**Status: WARN** — 6 smells identified

| Type                | File                                               | Line        | Description                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Magic Number        | `planGenerator.ts`                                 | 116         | `4` as cereal max when restricted — should reference the constant from `CEREAL_DAILY_RESTRICTED` (already exists as `const` at line 112, but line 116 uses inline `4` in `Math.max(cerealMax - 3, 0)` — `3` is a magic number) |
| Magic Number        | `planGenerator.ts`                                 | 151         | `3` for `B+L+D = 3 base meals` — while documented in comment, `3` is hardcoded                                                                                                                                                 |
| Magic Number        | `engine.ts`                                        | 34          | `180` as glucose threshold — should reference a named constant                                                                                                                                                                 |
| Duplicate Code      | `App.test.tsx` + `App.integration.test.tsx`        | 6-24        | `createLocalStorage()` and `createMatchMedia()` are identical in both files — should extract to test utils                                                                                                                     |
| Duplicate Code      | `occultSugarDetector.ts` + `MockScannerAdapter.ts` | sugar lists | Both files define overlapping sugar alias lists (azúcar, sacarosa, jarabe, etc.) — should share from a constant                                                                                                                |
| Long Parameter List | `ProfileForm.tsx`                                  | 11          | Single destructured prop with 13 fields — the `UserMetricsFormState` interface has 16 properties all passed as one prop, but the line length is excessive                                                                      |

---

## 10. Code Rules Compliance

**Status: FAIL** — 3 violations

| Rule                               | Status      | Details                                                                                                                                                                                          |
| ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript strict mode             | ❌ **FAIL** | `strict: true` is NOT set in `tsconfig.app.json`. Missing `strictNullChecks`, `strictFunctionTypes`, etc.                                                                                        |
| Tailwind CSS for styles            | ✓ PASS      | All styling uses Tailwind classes. `index.css` imports Tailwind.                                                                                                                                 |
| Testing Library accessible queries | ✓ PASS      | `getByRole`, `getByText`, `getByLabelText` used throughout. No `getByTestId` found.                                                                                                              |
| Functional components with hooks   | ✓ PASS      | All components are functional. Hooks used in containers.                                                                                                                                         |
| Descriptive names in English       | ✓ PASS      | All identifiers, function names, type names are in English. Spanish only in UI string literals (i18n) and comments.                                                                              |
| No `allowExportNames` workaround   | ✓ PASS      | Not configured. The split approach (containers/views) avoids the react-refresh export issue.                                                                                                     |
| Import aliases configured          | ⚠️ **WARN** | Aliases for `@`, `@features`, `@shared`, `@infrastructure` are configured in both `vite.config.ts` and `tsconfig.app.json`. However, **`@` and `@infrastructure` are never used** in any import. |

### Additional Violations

| Rule                     | Status      | Details                                                                                                                               |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/context/` directory | ❌ **FAIL** | SKILLS.md requires `src/context/` for global context. I18nContext is in `src/shared/i18n/`. No `src/context/` directory exists.       |
| `src/shared/types/`      | ❌ **FAIL** | Listed in SKILLS.md structure but does not exist (domain types live in `shared/domain/` which is acceptable but structural mismatch). |
| `src/shared/constants/`  | ❌ **FAIL** | Listed in SKILLS.md structure but does not exist                                                                                      |
| `src/shared/strategies/` | ❌ **FAIL** | Listed in SKILLS.md structure but does not exist                                                                                      |

---

## Summary

| Category                      | Status  |
| ----------------------------- | ------- |
| **Scope Rule**                | ❌ FAIL |
| **Screaming Architecture**    | ✓ PASS  |
| **Container/Presentational**  | ✓ PASS  |
| **DDD & Ubiquitous Language** | ✓ PASS  |
| **Security by Design**        | ✓ PASS  |
| **SRP & Modularity**          | ⚠️ WARN |
| **Business Logic Isolation**  | ⚠️ WARN |
| **TDD Compliance**            | ✓ PASS  |
| **Code Smells**               | ⚠️ WARN |
| **Code Rules**                | ❌ FAIL |

### Top 5 Action Items

1. **CRITICAL**: Fix reverse dependencies in `shared/stores/activityStore.ts` and `shared/stores/planStore.ts` — move types to `shared/domain/` and invert the dependency direction
2. **CRITICAL**: Enable `strict: true` in `tsconfig.app.json` and fix all resulting type errors
3. **HIGH**: Move `planStore.ts` from shared to `features/recipe-engine/store/` (only 1 consumer)
4. **HIGH**: Add unit tests for uncovered presentational components (especially ScannerView, PlanView, ActivityTrackerView)
5. **MEDIUM**: Create `src/context/` directory for global context providers or document that `shared/i18n/` replaces this requirement
