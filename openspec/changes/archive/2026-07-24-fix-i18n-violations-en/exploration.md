## Exploration: Fix English Violation Messages Showing in Spanish

### Current State

The violation detection pipeline works in three layers:

1. **Validator layer** (`shared/services/rationValidator.ts`): `checkCategoryLimits()`, `validateWeeklyRations()`, and `validateFoodPortions()` construct human-readable message strings with **hardcoded Spanish words** ("raciones", "máx", "mín") and a **direct import of Spanish translations** (`import { es } from '@shared/i18n/es'`).

2. **Display layer** (`shared/ui/ViolationList.tsx`, `DailyViolations.tsx`, `PlanView.tsx`): Renders `v.message` directly. `ViolationList` defaults its labels to Spanish. `DailyViolations` never passes `errorLabel`/`warningLabel` props.

3. **Category names** (`shared/domain/foodCategory.ts`): `CATEGORY_DISPLAY_NAMES` is Spanish-only, used by the validator. The i18n system already has `category.xxx` keys in both languages but the validator bypasses them.

### Root Cause — Four Hardcoded Spanish Sites

| # | File | Line(s) | Problem |
|---|------|---------|---------|
| 1 | `src/shared/services/rationValidator.ts` | 3 | `import { es } from '@shared/i18n/es'` — always Spanish |
| 2 | `src/shared/services/rationValidator.ts` | 138, 149, 160 | `es['validation.unitDay']`, hardcoded `raciones`/`máx`/`mín` |
| 3 | `src/shared/services/rationValidator.ts` | 220, 272, 282 | Hardcoded Spanish cross-rule and portion messages |
| 4 | `src/shared/domain/foodCategory.ts` | 40-52 | `CATEGORY_DISPLAY_NAMES` is Spanish-only |
| 5 | `src/shared/ui/ViolationList.tsx` | 11-12 | Default labels are Spanish, `DailyViolations` doesn't override them |

### Data Flow

```
logStore.ts
  → validateRations(counts, restrictionActive)   [builds messages in Spanish]
  → returns ValidationResult { violations: RationViolation[] }

DailyLogView.tsx
  → reads todayValidation from store
  → passes to DailyViolations

DailyViolations.tsx
  → passes violations to ViolationList            [no errorLabel prop]

ViolationList.tsx
  → renders v.message directly                    [always Spanish]
```

The `i18n` system (`en.ts`, `es.ts`, `types.ts`) already has `category.xxx` keys, `validation.unitDay`, `validation.unitWeek` in both languages — the **infrastructure exists but is not used**.

### Affected Areas

- `src/shared/services/rationValidator.ts` — Root cause: 3 functions build Spanish messages, imports `es` directly
- `src/shared/i18n/types.ts` — Needs new keys for violation message templates
- `src/shared/i18n/en.ts` — Needs English translations for new keys
- `src/shared/i18n/es.ts` — Needs Spanish translations for new keys (migrating current hardcoded values)
- `src/shared/domain/foodCategory.ts` — `CATEGORY_DISPLAY_NAMES` should be deprecated in favor of i18n `category.xxx` keys
- `src/shared/ui/ViolationList.tsx` — Default labels are hardcoded Spanish, `DailyViolations` doesn't override them
- `src/features/med-diet-validator/components/DailyViolations.tsx` — Formats violations but doesn't translate individual messages
- `src/features/recipe-engine/PlanView.tsx` — Renders `v.message` directly (lines 139, 158)
- `src/features/nutritional-traffic-light/services/safetyCheck.ts` — Hardcoded Spanish message (line 16)
- `src/features/nutritional-traffic-light/components/SafetyAlertDisplay.tsx` — Renders `alert.message` directly
- `src/shared/ui/ViolationList.test.tsx` — May need update for default label changes
- `src/features/med-diet-validator/components/DailyViolations.test.tsx` — May need update for formatting changes
- `src/features/recipe-engine/PlanView.test.tsx` — May need update for formatting changes

### Approaches

#### 1. Full Architectural Fix (Recommended)
**Strategy**: Strip all display strings from the validator layer. Return only structured data. Format messages in the UI layer using `useT()` and new i18n keys.

- Remove `message` construction from `checkCategoryLimits()`, `validateWeeklyRations()`, `validateFoodPortions()` and `safetyCheck.ts`
- Remove `import { es }` from `rationValidator.ts`
- Add i18n keys: `validation.violationOver`, `validation.violationUnder`, `validation.portionTooSmall`, `validation.portionTooLarge`, `validation.whiteMeatFishExcess`, `validation.highGlycemicFruit`
- Create a `formatViolation(t, violation)` utility in shared
- Update `ViolationList`, `DailyViolations`, `PlanView`, `SafetyAlertDisplay` to format using this utility
- Deprecate `CATEGORY_DISPLAY_NAMES` — use `t['category.xxx']` instead
- Fix `ViolationList` Spanish default labels — pass via props from callers instead of defaults

| Pros | Cons | Effort |
|------|------|--------|
| Architecturally correct (SRP: services return data, UI formats) | Larger change spread across ~10 files | **Medium** |
| Zero Spanish hardcoding survives | Tests need updates for new string format |
| Uses existing i18n infrastructure (`category.*`, `validation.unitDay/Week`) | Utility function needs creation |

Estimated: **120-150 lines** changed across ~10 files

---

#### 2. Minimally Invasive — Translation Injection
**Strategy**: Keep message construction in the validator but accept an optional `Translations` object. Fall back to `es` for backward compatibility.

- Add optional `t?: Translations` param to `checkCategoryLimits()`, `validateRations()`, `validateWeeklyRations()`, `validateFoodPortions()`
- If `t` provided, use dynamic keys; if not, fall back to imported `es`
- Add i18n keys for violation message templates
- Thread `t` from `useT()` → `DailyViolations` → validator call path
- But the store (`logStore.ts`) calls the validator, not the UI directly... injection is awkward here

| Pros | Cons | Effort |
|------|------|--------|
| Smaller codebase change | Architectural compromise — service builds display strings | **Low-Medium** |
| Backward-compatible (optional param) | Awkward injection through the store layer | |
| Fewer test changes | Doesn't solve the root cause | |

Estimated: **60-80 lines** changed across ~6 files, BUT still leaky

---

#### 3. Band-Aid — Post-Process Messages
**Strategy**: Keep the validator as-is but add a post-processing step in `DailyViolations.tsx` that replaces Spanish patterns with English ones based on locale.

- Add a `translateViolationMessage(t, message)` helper that regex-replaces known Spanish patterns
- Too brittle, misses the point

| Pros | Cons | Effort |
|------|------|--------|
| Minimal code changes | Extremely brittle (regex on display strings) | **Very Low** |
| No architectural changes | Doesn't scale, doesn't fix `PlanView` or `SafetyAlert` | |

Estimated: **20-30 lines**, but produces terrible code

### Recommendation

**Approach 1 — Full Architectural Fix.** Here's why:

1. **The `es` import in `rationValidator.ts` is already a code smell.** It means a shared service has a hard dependency on a specific locale. Fixing it properly removes this smell entirely.

2. **The i18n infrastructure is already there.** `category.cereals`, `validation.unitDay`, etc., exist in both languages. The fix just connects the dots.

3. **The `RationViolation` type already has all structured fields** needed for UI formatting (`category`, `current`, `limit`, `direction`, `unit`). The `message` field is a redundant byproduct of premature display concerns in the service layer.

4. **Zero structural risk.** The change is local to display logic. The validator's business logic (count, validate limits) remains untouched.

### Risks

- **Medium risk**: Touches shared services, shared UI, and feature-level components. The change has horizontal reach across layers. Requires thorough testing of all display paths.
- **Low risk**: The validator's business logic (counting, limit checking) is completely unchanged — only display string construction is removed.
- **Low risk**: Existing tests for the validator do NOT assert on `message` text, so they should pass without changes. UI component tests may need updates.
- **Scope Rule safe**: The fix is entirely within `shared/ui` + `shared/i18n` + `shared/services`. The feature layer (`DailyViolations`, `PlanView`) only consumes the formatting — no shared→feature imports are created.

### Ready for Proposal

**Yes.** The root cause is fully identified across all four layers. The architectural fix is well-defined with clear before/after at every file. Recommend proceeding to `sdd-propose` with Approach 1 as the recommended strategy.

**What the orchestrator should tell the user**: The bug has 4 layers of Spanish hardcoding. The recommended fix is to strip display strings from the validator entirely and format messages in the UI layer using the existing i18n system. Approximately 10 files will be touched (~120-150 lines). Business logic is completely unchanged — only display construction moves from the service layer to the UI layer.
