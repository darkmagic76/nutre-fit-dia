# Proposal: Fix English Violation Messages Showing in Spanish

## Intent

In English locale, violation messages in the "Today" tab render in Spanish. Root cause: `rationValidator.ts` imports `es` directly and hardcodes Spanish words (`"raciones"`, `"máx"`, `"mín"`). `CATEGORY_DISPLAY_NAMES` is Spanish-only. The i18n system already has `category.*` and `validation.unit*` keys in both languages — the infrastructure exists but is unused. This change connects the dots.

## Scope

### In Scope
- Strip display string construction from `rationValidator.ts` (3 functions) and `safetyCheck.ts`
- Add i18n message template keys to `en.ts` and `es.ts`
- Create `shared/ui/formatViolation.ts` — pure function for UI-layer message formatting
- Update `ViolationList`, `DailyViolations`, `PlanView`, `SafetyAlertDisplay` to use formatted messages
- Deprecate `CATEGORY_DISPLAY_NAMES` in favor of `t['category.xxx']`
- Fix `ViolationList` default Spanish labels

### Out of Scope
- Validation business logic (counts, limits, thresholds)
- `RationViolation` type structure (already has `category`, `current`, `limit`, `direction`, `unit`)
- Translation quality or coverage of other i18n keys
- New UI layout or component restructuring

## Capabilities

### New Capabilities
- `violation-i18n`: structured violation data consumed by UI layer with i18n-based display formatting

### Modified Capabilities
- `food-category-display`: deprecate Spanish-only `CATEGORY_DISPLAY_NAMES` in favor of existing `category.xxx` i18n keys

## Approach

**Full Architectural Fix** — move display concerns from service layer to UI layer using existing i18n infrastructure.

1. Remove `import { es }` and `message` construction from validator functions
2. Add violation message template keys to `i18n/types.ts`, `en.ts`, `es.ts`
3. Create `shared/ui/formatViolation.ts`: `(t: Translations, v: RationViolation) => string`
4. Thread formatted messages through components via props and `useT()`
5. Replace `CATEGORY_DISPLAY_NAMES` lookups with `t[\`category.${v.category}\`]`
6. Fix `ViolationList` default labels to accept translated props from callers

**~10 files, ~120-150 changed lines. Zero business logic changes.**

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/services/rationValidator.ts` | Modified | Remove `es` import, strip message construction |
| `src/shared/i18n/types.ts` | Modified | Add violation message template type keys |
| `src/shared/i18n/en.ts` | Modified | Add English violation templates |
| `src/shared/i18n/es.ts` | Modified | Add Spanish violation templates (migrated from validator) |
| `src/shared/domain/foodCategory.ts` | Modified | Deprecate `CATEGORY_DISPLAY_NAMES` |
| `src/shared/ui/formatters/formatViolation.ts` | **New** | `formatViolation(t, violation)` pure function |
| `src/shared/ui/ViolationList.tsx` | Modified | Accept translated labels via props, remove Spanish defaults |
| `src/features/med-diet-validator/components/DailyViolations.tsx` | Modified | Use `formatViolation`, pass translated labels |
| `src/features/recipe-engine/PlanView.tsx` | Modified | Use `formatViolation` instead of raw `v.message` |
| `src/features/nutritional-traffic-light/services/safetyCheck.ts` | Modified | Return structured data, strip hardcoded message |
| `src/features/nutritional-traffic-light/components/SafetyAlertDisplay.tsx` | Modified | Format messages with `useT()` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Horizontal reach across shared + feature layers | Medium | Run full test suite; each layer has unit tests |
| Existing tests assert on old message strings | Low | Exploration confirmed no validator tests assert on `message` text |
| Regression in `PlanView` or `SafetyAlertDisplay` | Low | Component tests cover rendering paths |

## Rollback Plan

Git revert to commit before change. All changes are additive (new i18n keys) or format-only (no logic changes). A git revert is clean and complete. No database migration or state shape changes.

## Dependencies

- Existing i18n keys (`category.*`, `validation.unitDay`, `validation.unitWeek`) already exist in both `en.ts` and `es.ts`
- No external dependencies

## Success Criteria

- [ ] English locale: violation messages render in English in `DailyViolations`, `PlanView`, and `SafetyAlertDisplay`
- [ ] Spanish locale: violation messages render in Spanish (unchanged behavior)
- [ ] `import { es }` removed from `rationValidator.ts`
- [ ] `CATEGORY_DISPLAY_NAMES` deprecated (exported but marked `@deprecated`)
- [ ] Zero business logic changes — all validator limits and calculations unchanged
- [ ] Full test suite passes (`pnpm verify`)
