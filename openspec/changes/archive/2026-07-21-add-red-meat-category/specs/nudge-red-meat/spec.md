# Delta for nudge-engine

## MODIFIED Requirements

### Requirement: EGGS_RED_MEAT_ALT Nudge Rule

The `EGGS_RED_MEAT_ALT` rule (id `'EGGS_RED_MEAT_ALT'`, type `SYSTEM_ACTION`) MUST fire when `counts[FoodCategory.RED_MEAT] > 0 && !ctx.hasEggs`. The condition MUST NOT check `WHITE_MEAT`.

(Previously: condition checked `counts[FoodCategory.WHITE_MEAT] > 0 && !ctx.hasEggs`)

Body text MUST say "carnes rojas". Title "Huevos como alternativa".

#### Scenario: Fires when red meat consumed without eggs

- GIVEN `counts[RED_MEAT] = 1, hasEggs = false`
- WHEN `condition(ctx)` is evaluated
- THEN returns true

#### Scenario: Does NOT fire on white meat alone

- GIVEN `counts[WHITE_MEAT] = 1, counts[RED_MEAT] = 0, hasEggs = false`
- WHEN `condition(ctx)` is evaluated
- THEN returns false

#### Scenario: Does NOT fire when eggs present

- GIVEN `counts[RED_MEAT] = 1, hasEggs = true`
- WHEN `condition(ctx)` is evaluated
- THEN returns false

#### Scenario: WHITE_MEAT_RESTRICT unchanged

- GIVEN `counts[FISH] = 8, counts[WHITE_MEAT] = 1`
- WHEN `condition(ctx)` is evaluated
- THEN returns true (WHITE_MEAT_RESTRICT still guards WHITE_MEAT only)
