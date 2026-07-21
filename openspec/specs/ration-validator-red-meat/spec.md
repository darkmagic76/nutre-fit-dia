# ration-validator Specification (RED_MEAT additions)

## Purpose

Integrate RED_MEAT into the ration validation pipeline: limits, AESAN gram standards, and weekly validation per Mediterranean diet clinical guidelines.

**ADR**: ADR-005 amendment

## Requirements

### Requirement: RED_MEAT Ration Limits

The system MUST add `[FoodCategory.RED_MEAT]` to `RATION_LIMITS` with `max: 3, unit: 'week'`. No minimum — RED_MEAT is never required.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Within limit | `counts[RED_MEAT] = 3` | `validateWeeklyRations` | no violation |
| Exceeds limit | `counts[RED_MEAT] = 4` | `validateWeeklyRations` | over violation, max 3/semana |
| Not a daily category | RATION_LIMITS[RED_MEAT] | reading `unit` | is `'week'` |

### Requirement: RED_MEAT AESAN Gram Standards

The system MUST add `[FoodCategory.RED_MEAT]` to `AESAN_GRAM_STANDARDS` with `min: 100, max: 150` (per AESAN 2022, same as WHITE_MEAT).

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Valid portion | ternera 125g | `validateFoodPortions([ternera])` | no alert |
| Too small | cerdo 80g | `validateFoodPortions([cerdo])` | `PORTION_TOO_SMALL` warning |
| Too large | cordero 200g | `validateFoodPortions([cordero])` | `PORTION_TOO_LARGE` critical |

### Requirement: Weekly Validation Includes RED_MEAT

`validateWeeklyRations()` MUST include `FoodCategory.RED_MEAT` in the `weeklyCategories` array.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Weekly count applies | `counts[RED_MEAT] = 5` | `validateWeeklyRations` | violation for RED_MEAT |
| Not in daily validation | `counts[RED_MEAT] = 10` | `validateRations` (daily) | no violation (weekly only) |
