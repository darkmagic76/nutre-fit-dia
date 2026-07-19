# Proposal: M7 — Fraccionamiento 3-6 tomas diarias

## Intent

Distribute daily food rations into structured meals (breakfast, lunch, dinner, snacks) to prevent postprandial glycemic spikes. Display kcal per meal in PlanView for dietitian validation.

## Scope

### In Scope
- MealType enum + `mealType` field on `MealEntry`
- Distribution algorithm: assign each ration to BREAKFAST/LUNCH/DINNER/SNACK
- AOVE rule: ≥1 OLIVE_OIL ration in every main meal (B/L/D)
- WATER distribution: 4 vasos across meals (1 per meal type)
- PlanView: group entries by mealType, render meal headers, show kcal per meal + % of daily target
- New + updated tests for algorithm, AOVE rule, kcal calc, UI rendering

### Out of Scope
- Personalized distribution (fixed heuristics for V1)
- SNACK sub-typing (merienda vs media mañana)
- kcal target editing in PlanView (read-only display)

## Capabilities

### New Capabilities
- `meal-fractioning`: distribution algorithm, MealType enum, AOVE mandatory tagging, per-meal kcal computation

### Modified Capabilities
- None — plan-store spec contract (days/dailyResults/weeklyResult/valid) unchanged; MealType is additive to MealEntry shape

## Approach

1. Add `MealType` enum + `mealType: MealType` to `MealEntry` (optional with default to avoid breaking existing constructors)
2. Extend `buildDailyTemplate()` output to include mealType assignment per TemplateSlot
3. Extend `getWeeklySlots()` output to include mealType for weekly-distributed items
4. Algorithm: map categories to meals per verified heuristics (CEREALS→B/L/D, VEG→L/D, FRUITS→B/SNACK, OIL→B/L/D, WATER→B/L/D/SNACK)
5. PlanView: group `day.entries` by mealType, render `<details>` per meal, compute kcal via `(kcalPer100g × gramsPerRation / 100) × rations`, display kcal + % of `caloricTarget.target`
6. Backward compatibility: existing entries without mealType default to BREAKFAST; all existing tests stay green

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `planGenerator.ts` | Modified | Add MealType, extend buildDailyTemplate + getWeeklySlots |
| `planGenerator.test.ts` | Modified | Add meal distribution tests |
| `planGenerator.fallback.test.ts` | Modified | Update meal entry constructors |
| `PlanView.tsx` | Modified | Group by mealType, compute kcal |
| `PlanView.test.tsx` | Modified | Update test data, test kcal display |
| `planStore.ts` | Trivial | Type import propagates |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ~10-15 MealEntry constructors in tests break | High | TypeScript catches all — mechanical fix |
| Distribution heuristics may not match clinical expectations | Low | V1 fixed; ADR-documented for future personalization |

## Rollback Plan

Revert `planGenerator.ts`, `PlanView.tsx`, and test files to previous commit. No DB or schema migration involved — purely in-memory algorithm change.

## Dependencies

- `trackerStore.caloricTarget.target` (already exposed)

## Success Criteria

- [ ] All 353+ existing tests pass with zero modification to test assertions (only constructors)
- [ ] Every daily plan has ≥1 OLIVE_OIL in each of B/L/D across all 7 days
- [ ] PlanView shows 4 meal groups per day with headers and kcal/% display
- [ ] New tests cover: meal assignment correctness, AOVE rule, kcal computation
