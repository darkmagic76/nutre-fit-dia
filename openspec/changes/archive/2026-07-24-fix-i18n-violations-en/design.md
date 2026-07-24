# Design: Fix English Violation Messages

## Technical Approach

Strip display string construction from service layer (`rationValidator.ts`, `safetyCheck.ts`). Return structured data only. Format messages in the UI layer via `formatViolation(t, violation)` using existing `category.*` and new template i18n keys. Deprecate `CATEGORY_DISPLAY_NAMES`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Message formatting location | New `shared/ui/formatters/formatViolation.ts` | Pure function, shared by 2+ features (Scope Rule), testable without React |
| Cross-category violations | `RationViolation.messageKey?: keyof Translations` | Zero width: when set, bypasses template interpolation; falls into `t[messageKey]` directly |
| SafetyAlert structured data | Add `foodName`, `actualGrams`, `standardMin`, `standardMax` optional fields | `code` already discriminates; UI formats per-code via `useT()` |

## Data Flow

```
rationValidator.ts           formatViolation.ts            UI Components
(service layer)              (shared/ui/formatters)         (feature layer)

checkCategoryLimits()        (t, violation) => string       DailyViolations
  → {category,current,        → t['category.xxx']            → ViolationList({violations})
    limit,direction,unit,     → t['validation.unitDay']
    messageKey?}              → t['validation.message.over']
                              → return interpolated string

safetyCheck.ts               SafetyAlertDisplay
  → SafetyAlert{code,          → useT()
    foodName?,actualGrams?}    → formatSafetyAlert() inline
```

## Interfaces / Contracts

```ts
// RationViolation — REMOVE message, ADD messageKey
export interface RationViolation {
  category: FoodCategoryType;
  current: number;
  limit: number;
  direction: 'under' | 'over';
  unit: 'day' | 'week';
  messageKey?: keyof Translations;  // NEW: cross-category i18n key
  // REMOVED: message: string
}

// SafetyAlert — ADD structured fields, KEEP message for transition
export interface SafetyAlert {
  severity: SafetyAlertSeverity;
  code: string;
  message: string;  // KEPT: sdd-apply deprecates; format at UI layer
  category: FoodCategoryType;
  acknowledgeRequired: boolean;
  foodName?: string;           // NEW
  actualGrams?: number;        // NEW
  standardMin?: number;        // NEW
  standardMax?: number;        // NEW
}
```

## New i18n Keys

| Key | en | es |
|-----|-----|-----|
| `validation.message.over` | `"{category}: {current} rations (max {limit}/{unit})"` | `"{category}: {current} raciones (máx {limit}/{unit})"` |
| `validation.message.under` | `"{category}: {current} rations (min {limit}/{unit})"` | `"{category}: {current} raciones (mín {limit}/{unit})"` |
| `validation.crossRule.whiteMeatFish` | `"White Meat: restrict if fish rations exceeded"` | `"Carnes blancas: restringir si se han superado raciones de pescado"` |
| `validation.safety.portionTooSmall` | `"{name}: {grams}g (min {min}g/ration AESAN 2022)"` | `"{name}: {grams}g (mín {min}g/ración AESAN 2022)"` |
| `validation.safety.portionTooLarge` | `"{name}: {grams}g (max {max}g/ration AESAN 2022)"` | `"{name}: {grams}g (máx {max}g/ración AESAN 2022)"` |
| `validation.safety.highGlycemicFruit` | `"{name}: high glycemic fruit — consume in moderation"` | `"{name}: fruta de alta carga glucémica — consumir con moderación"` |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/ui/formatters/formatViolation.ts` | **Create** | `formatViolation(t, v)` + `formatSafetyAlert(t, a)` pure functions |
| `src/shared/services/rationValidator.ts` | Modify | Remove `import { es }`, `CATEGORY_DISPLAY_NAMES` usage, `message` construction; add `messageKey` to cross-category violation |
| `src/shared/i18n/types.ts` | Modify | Add 6 new keys to `Translations` interface |
| `src/shared/i18n/en.ts` | Modify | Add English template values |
| `src/shared/i18n/es.ts` | Modify | Add Spanish template values (migrated from old `message` strings) |
| `src/shared/domain/foodCategory.ts` | Modify | Mark `CATEGORY_DISPLAY_NAMES` as `@deprecated` |
| `src/shared/ui/ViolationList.tsx` | Modify | Replace default Spanish labels with English; accept required `errorLabel`/`warningLabel` props |
| `src/features/med-diet-validator/components/DailyViolations.tsx` | Modify | Pass `t['ui.violations']`/`t['ui.suggestions']` as labels; map violations through `formatViolation(t, v)` |
| `src/features/recipe-engine/PlanView.tsx` | Modify | Map daily violations through `formatViolation(t, v)` in details list |
| `src/features/nutritional-traffic-light/services/safetyCheck.ts` | Modify | Add structured fields; keep `message` for backward compat |
| `src/features/nutritional-traffic-light/components/SafetyAlertDisplay.tsx` | Modify | Use `formatSafetyAlert(t, alert)` or inline format per `alert.code` |

## Migration Order

1. Add i18n keys to `types.ts`, `en.ts`, `es.ts` — no behavior change
2. Create `formatViolation.ts` with tests (TDD: RED→GREEN→REFACTOR)
3. Strip `rationValidator.ts` — remove `es` import, remove message construction, add `messageKey` for cross-category
4. Deprecate `CATEGORY_DISPLAY_NAMES` in `foodCategory.ts`
5. Update `ViolationList` defaults to English, make labels required
6. Update `DailyViolations` — wire `formatViolation` + translated labels
7. Update `PlanView` — wire `formatViolation` in daily details
8. Add structured fields to `safetyCheck.ts` + update `SafetyAlertDisplay`
9. Run `pnpm verify` — full suite

Each step is independently testable and committable. Rollback: `git revert`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `formatViolation()` | Pure function: test en/es output for each `direction`×`unit` combo |
| Unit | `rationValidator` existing tests | All pass unchanged — tests assert on structured fields, never `message` |
| Unit | `formatSafetyAlert()` | Test each `code` in both locales |
| Component | `ViolationList` labels | Verify `errorLabel`/`warningLabel` props render correctly |
| Component | `DailyViolations` | Integration test: en locale produces English messages |
| E2E | Full app | `pnpm verify` — 53 test files, coverage threshold 80% |

## Open Questions

- [ ] Spec says `FoodCategory.VEGETABLES` → "Verduras" in Spanish, but `es.ts` currently has "Hortalizas". Which one is correct? (Affects `validation.crossRule.whiteMeatFish` Spanish translation consistency — "Carnes blancas" vs "Carne blanca")
