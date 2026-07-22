# Design: Extract Magic Numbers to Named Constants

## Technical Approach

Per-file extraction. Each magic number becomes a `const` declaration at the top of its module, just below imports. No structural changes, no new files, no export additions.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Module-level consts | Minimizes diff, zero import changes | ✅ |
| Extract to shared constants module | Cleaner but adds deps & cross-file coupling | ❌ |
| Reference RATION_LIMITS directly | Changes expression structure, higher risk | ❌ |

## Constants Map

### planGenerator.ts

| Constant | Value | Meaning |
|----------|-------|---------|
| `DAYS_IN_WEEK` | `7` | Iteration bound for week generation |
| `CEREAL_NON_DINNER_RATIONS` | `3` | breakfast(1) + lunch(2) cereal allocation |
| `BASE_MEAL_COUNT` | `3` | breakfast + lunch + dinner |

### rules.ts

| Constant | Value | Meaning |
|----------|-------|---------|
| `CEREAL_RESTRICTED_MAX` | `4` | Cereal max under caloric restriction |
| `VEGETABLE_NUDGE_HOUR_THRESHOLD` | `20` | 8PM evening gate for veggie nudge |
| `VEGETABLE_MIN_RATIONS` | `3` | Threshold matching RATION_LIMITS min |
| `ANIMAL_PROTEIN_NUDGE_THRESHOLD` | `2` | Elevated animal protein threshold |
| `WATER_MIN_RATIONS` | `4` | Threshold matching RATION_LIMITS min |
| `HYPERGLYCEMIA_THRESHOLD_MG_DL` | `180` | Glucose threshold for hyperglycemia nudge |
| `LEGUMES_CHECK_DAY_THRESHOLD` | `4` | Day-of-week (Thu+) for legumes check |
| `LEGUMES_MIN_WEEKLY_CHECK` | `1` | Legumes count threshold |
| `FISH_EXCESS_THRESHOLD` | `7` | Fish max matching RATION_LIMITS max |
| `WEEKLY_ACTIVITY_MINUTES_TARGET` | `150` | WHO min weekly activity |
| `MAX_ALTERNATIVES_TO_SHOW` | `3` | Substitution alternatives to display |
| `LOW_ENVIRONMENTAL_SCORE_THRESHOLD` | `30` | Sustainability score floor |

### rationValidator.ts

| Constant | Value | Meaning |
|----------|-------|---------|
| `CEREAL_RESTRICTED_MAX` | `4` | Cereal max when `restrictOnCaloricDeficit` is active |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/recipe-engine/services/planGenerator.ts` | Modify | Add 3 consts; replace 3 literals |
| `src/features/nudge-engine/rules.ts` | Modify | Add 12 consts; replace 12 literals |
| `src/shared/services/rationValidator.ts` | Modify | Add 1 const; replace 1 literal |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | All 510 existing tests | Same assertions — values unchanged |

## Migration

No migration required. Pure code refactor with zero runtime impact.
