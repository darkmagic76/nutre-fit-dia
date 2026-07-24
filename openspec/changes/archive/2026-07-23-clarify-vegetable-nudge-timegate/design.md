# Design: Clarify Vegetable Deficit Nudge Time Gate

## Technical Approach

Augment `DailyViolations` with a conditional info line. When a vegetable deficit violation exists AND `currentHour < VEGETABLE_NUDGE_HOUR_THRESHOLD` (14 = 2PM), render an i18n message explaining the nudge is gated. The constant is exported from `@shared/nudge` as the single source of truth — no hardcoded `14` in JSX.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Placement | Info line in `DailyViolations.tsx` | Dedicated `VegetableNudgeStatus` component (over-engineered for +3 lines of JSX) | Follows Approach A from exploration — places explanation at the violation, where the user is looking |
| Time injection | Optional `currentHour` prop, default `new Date().getHours()` | Computed internally with `vi.setSystemTime` in tests | Dependency injection lets tests inject time without mocking globals; no parent changes needed |
| Deficit detection | `violations.some(v => v.category === 'vegetables' && v.direction === 'under')` | Counting rations from store (duplicates validator work) | Violations array is already computed — reuse it. Category is a string value `'vegetables'` per `FoodCategory.VEGETABLES` |

## Data Flow

```
    RationValidator                DailyViolations
    (store update)                     │
         │                      props: validation, hasFoods
         ▼                      optional: currentHour
   violations[] ──────────────→  │
   [RationViolation]             ├─ valid? → ViolationList
         │                       ├─ vegetable deficit + hour<14?
         │                       │    └→ <p role="status"> i18n info
         │                       └─ animalProteinCount>2?
         │                            └→ ViolationList warning
         ▼
VEGETABLE_NUDGE_HOUR_THRESHOLD
   (exported from @shared/nudge)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/nudge/rules.ts:21` | Modify | `const` → `export const VEGETABLE_NUDGE_HOUR_THRESHOLD` |
| `src/shared/nudge/index.ts` | Modify | Add `VEGETABLE_NUDGE_HOUR_THRESHOLD` to barrel export |
| `src/features/med-diet-validator/components/DailyViolations.tsx` | Modify | Add `currentHour` prop + conditional info paragraph |
| `src/features/med-diet-validator/components/DailyViolations.test.tsx` | Modify | 3 new test cases (before 2PM with deficit, after 2PM hidden, no deficit hidden) |
| `src/shared/i18n/types.ts` | Modify | Add `'log.vegetableNudgeAfternoon': string` |
| `src/shared/i18n/es.ts` | Modify | Add Spanish translation key |
| `src/shared/i18n/en.ts` | Modify | Add English translation key |

## Interfaces / Contracts

New optional prop on `DailyViolationsProps`:

```typescript
interface DailyViolationsProps {
  validation: ValidationResult;
  hasFoods: boolean;
  currentHour?: number; // NEW — defaults to new Date().getHours()
}
```

Vegetable deficit detection:
```typescript
const vegetableDeficit = validation.violations.some(
  v => v.category === 'vegetables' && v.direction === 'under'
);
```

i18n keys:
```
'log.vegetableNudgeAfternoon': string
```

## Accessibility

Info message receives `role="status"` (polite live region). It is mutually exclusive with the existing `role="status"` "all clear" message — the nudge-info line only renders when `!validation.valid`, while "all clear" renders when `validation.valid && hasFoods`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Info line renders before 2PM with vegetable deficit | `currentHour={10}`, violation with `category: 'vegetables', direction: 'under'` → assert text visible |
| Unit | Info line hidden after 2PM | `currentHour={14}`, same violation → assert text NOT visible |
| Unit | Info line hidden without vegetable deficit | `currentHour={10}`, no vegetable violation → assert NOT visible |

Use existing fixtures: `makeViolation({ category, direction })`, `makeValidationResult({ valid: false, violations })`, `renderWithI18n`.

## Migration / Rollout

No migration required. Rollback: `git revert`. Pure UI addition — no data, no store, no API.

## Open Questions

None. All decisions are resolved.
