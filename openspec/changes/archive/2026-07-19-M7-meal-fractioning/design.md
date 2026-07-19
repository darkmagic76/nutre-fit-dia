# Design: M7 — Meal Fractioning (3–6 tomas diarias)

## Technical Approach

Extend `planGenerator.ts` with a `MealType` enum and meal-aware distribution algorithm. `generateWeeklyPlan()` assigns every `MealEntry` to BREAKFAST/LUNCH/DINNER/SNACK, enforces AOVE ≥1 per main meal post-processing, and outputs structured meal data. `PlanView.tsx` groups entries by `mealType`, computes per-meal kcal from `trackerStore.caloricTarget`, and renders meal headers with kcal + % target. All 353+ existing tests remain green — `mealType` is optional with default `BREAKFAST`.

## Architecture Decisions

### Decision 1: MealType placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| A: In `planGenerator.ts` | Local to recipe-engine, follows Scope Rule | **Chosen** |
| B: In `shared/domain/` | Accessible to other features, but no other feature needs it | Rejected — Scope Rule violation |

**Rationale**: `MealType` is consumed by `planGenerator` and `PlanView` only, both inside recipe-engine. No other feature (nudge-engine, tracker-store, scanner) references it. The Scope Rule is absolute — 1 feature = local.

### Decision 2: `mealType` field on `MealEntry`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| A: `mealType: MealType` (required) | Breaks every existing `{ food, rations }` constructor | Rejected |
| B: `mealType?: MealType` (optional, default `BREAKFAST`) | Backward-compatible, spec REQ-1 compliant | **Chosen** |

### Decision 3: Distribution algorithm

Replace flat `TemplateSlot.rations` with `TemplateSlot.mealSlots: MealSlot[]`. Each `MealSlot` pairs `MealType` with rations for that meal. `buildDailyTemplate()` now accepts `mealCount` (3–6). The loop in `generateWeeklyPlan` expands `mealSlots` into `MealEntry[]` with explicit `mealType`.

### Decision 4: AOVE enforcement

Post-processing step after all entries are generated: scan each day's B/L/D entries, check `OLIVE_OIL` count > 0, and use `pickSustainableFood(OLIVE_OIL, day)` to add missing ones. More robust than baking into template — survives `mealCount` changes.

### Decision 5: Weekly items meal assignment

Assign weekly items (LEGUMES, EGGS, FISH, DAIRY, WHITE_MEAT) to `LUNCH` or `DINNER`. Counter per day: first item → LUNCH, second → DINNER, third → LUNCH (alternating). Never BREAKFAST or SNACK.

### Decision 6: Kcal computation in PlanView

Per-meal kcal computed in `PlanView` render (not `planGenerator`). `planGenerator` is a pure domain service — it shouldn't know about UI concerns like `caloricTarget`. PlanView already reads external state via `useTrackerStore`.

### Decision 7: Meal grouping in PlanView

`MEAL_ORDER` constant + `groupBy` pattern. Empty meal groups filtered out (REQ-6). Order: BREAKFAST → LUNCH → DINNER → SNACK. Existing features (CulturalBadges, ZeroWasteBadges, LegalDisclaimer) preserved unchanged.

## Data Flow

```
planStore.generatePlan()
  │
  ▼
generateWeeklyPlan(restrictionActive, mealCount=4)
  │
  ├── buildDailyTemplate(restrictionActive, mealCount)
  │     └── TemplateSlot[].mealSlots ← categorized per-meal rations
  │
  ├── getWeeklySlots()
  │     └── extends return with mealType assignment
  │
  ├── Expand mealSlots → MealEntry[].mealType assigned
  ├── Post-process: enforce AOVE ≥1 per B/L/D
  │
  └── return WeeklyPlan { days: DailyMeal[] }
        │
        ▼
PlanView render
  │
  ├── day.entries grouped by mealType
  ├── computeMealKcal(entries) = ∑(kcalPer100g × gramsPerRation / 100 × rations)
  ├── % = mealKcal / caloricTarget.target × 100
  └── Display: meal header → entries → kcal + %
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `services/planGenerator.ts` | Modify | Add MealType enum, MealSlot, extend TemplateSlot, add assignMealTypes + enforceAOVE + buildDailyTemplate mealCount param |
| `services/planGenerator.test.ts` | Modify | Add tests for meal distribution, AOVE rule, weekly item alternation, mealCount variations |
| `services/planGenerator.fallback.test.ts` | Modify | Add `mealType` to test entry constructors |
| `PlanView.tsx` | Modify | Add MEAL_ORDER/MEAL_LABELS, group by mealType, computeMealKcal, render per-meal kcal + % |
| `PlanView.test.tsx` | Modify | Update test data with mealType, add tests for meal grouping, kcal display, empty group, null/zero target |
| `store/planStore.ts` | Modify | Type import propagates (no logic change) |

## Interfaces / Contracts

```typescript
// In planGenerator.ts

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

interface MealSlot {
  meal: MealType
  rations: number
}

// Extended TemplateSlot
interface TemplateSlot {
  category: FoodCategory
  mealSlots: MealSlot[]
}

// Extended MealEntry
export interface MealEntry {
  food: Food
  rations: number
  mealType?: MealType  // defaults to BREAKFAST
}

// Extended getWeeklySlots return
function getWeeklySlots(): { day: number; category: FoodCategory; rations: number; mealType: MealType }[]
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Meal distribution correctness per category × mealCount | Given/When/Then, verify each mealSlot |
| Unit | AOVE enforcement post-processing | Check OLIVE_OIL count ≥1 per B/L/D across 7 days |
| Unit | Weekly item alternation (L→D→L) | Verify day with 2+ weekly items |
| Unit | Edge cases: empty OLIVE_OIL catalog, mealCount=3, mealCount=6 | Graceful handling, no crashes |
| Integration | PlanView meal grouping + kcal display | Render WeeklyPlan, assert meal headers + kcal text |
| Integration | Null/zero caloricTarget displays "—" | No division by zero, no crash |

## Migration / Rollout

No migration required. `mealType` is optional with default — existing plan data (none persisted, all in-memory) just becomes `BREAKFAST`. Feature gated at `mealCount` param (default 4, backward-compatible).

## Open Questions

- None — all decisions resolved above.
