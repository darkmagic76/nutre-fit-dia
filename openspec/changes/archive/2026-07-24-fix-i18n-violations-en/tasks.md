# Tasks: Fix English Violation Messages Showing in Spanish

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 120–150 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Phase 1: Foundation — i18n Keys

- [ ] 1.1 Add 6 new keys to `Translations` interface in `src/shared/i18n/types.ts`
- [ ] 1.2 Add English template values to `src/shared/i18n/en.ts`
- [ ] 1.3 Add Spanish template values to `src/shared/i18n/es.ts` (migrate strings from old `message` construction)

## Phase 2: formatViolation Utility (TDD)

- [ ] 2.1 RED: Write failing tests in `src/shared/ui/formatters/formatViolation.test.ts` — all direction×unit combos in en/es
- [ ] 2.2 RED: Write failing tests for `formatSafetyAlert()` — each `alert.code` (`portionTooSmall`, `portionTooLarge`, `highGlycemicFruit`) in both locales
- [ ] 2.3 GREEN: Create `src/shared/ui/formatters/formatViolation.ts` with minimum `formatViolation()` + `formatSafetyAlert()` implementations
- [ ] 2.4 REFACTOR: Extract shared string interpolation helper; verify all tests stay green → `pnpm test:run`

## Phase 3: Strip Service Layer

- [ ] 3.1 Remove `import { es }` and message string construction from `src/shared/services/rationValidator.ts`; add `messageKey?: keyof Translations` for cross-category violation (whiteMeatFish)
- [ ] 3.2 Update `rationValidator` tests — assert on structured fields (`category`, `current`, `limit`, `direction`, `unit`), never `message`
- [ ] 3.3 Mark `CATEGORY_DISPLAY_NAMES` as `@deprecated` in `src/shared/domain/foodCategory.ts` with JSDoc pointing to i18n `category.*` keys

## Phase 4: Wire UI Layer

- [ ] 4.1 Update `src/shared/ui/ViolationList.tsx` — change default labels to English, make `errorLabel`/`warningLabel` required props
- [ ] 4.2 Update `src/features/med-diet-validator/components/DailyViolations.tsx` — pass `t['ui.violations']`/`t['ui.suggestions']` as labels, map violations through `formatViolation(t, v)`
- [ ] 4.3 Update `src/features/recipe-engine/PlanView.tsx` — wire `formatViolation(t, v)` for daily violation details list

## Phase 5: Safety Alert

- [ ] 5.1 Add `foodName`, `actualGrams`, `standardMin`, `standardMax` optional fields to `SafetyAlert` interface in `src/features/nutritional-traffic-light/services/safetyCheck.ts`
- [ ] 5.2 Update `src/features/nutritional-traffic-light/components/SafetyAlertDisplay.tsx` — format messages per `alert.code` using new structured fields + `formatSafetyAlert()`

## Phase 6: Verification

- [ ] 6.1 Run `pnpm verify` — all 53 test files pass, typecheck clean, coverage ≥ 80%
- [ ] 6.2 Manual smoke test: toggle en ↔ es locale, verify `DailyViolations`, `PlanView`, `SafetyAlertDisplay` render correct language in both locales
