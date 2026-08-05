# Delta for Nudge Engine

## ADDED Requirements

### REQ-LEGUME-CARB-SOURCE: Legume as carbohydrate source informational nudge

**MUST** fire when `counts.LEGUMES > 0 && counts.CEREALS < CEREAL_MIN_RATIONS` (3). Type `behavioral_nudge`, severity `info`, cooldown 6h. Added 2026-08-05 per AESAN 2022 (L1368): "Algunas de estas raciones de cereales pueden ser sustituidas por el consumo de legumbres, para completar la ingesta de hidratos de carbono."

This rule is **complementary** to `REQ-CEREALS-DEFICIT`. When cereals are below minimum AND legumes are present, both rules co-fire — each serves a distinct purpose: deficit alert vs. carb-source education.

#### Scenario: Fires when legumes present, cereals below minimum
- GIVEN `counts.LEGUMES > 0` and `counts.CEREALS < 3`
- WHEN condition evaluated
- THEN returns true

#### Scenario: Does NOT fire when no legumes consumed
- GIVEN `counts.LEGUMES = 0` and `counts.CEREALS < 3`
- WHEN condition evaluated
- THEN returns false

#### Scenario: Does NOT fire at exact cereal minimum boundary
- GIVEN `counts.LEGUMES > 0` and `counts.CEREALS = 3`
- WHEN condition evaluated
- THEN returns false

#### Scenario: Co-fires with CEREALS_DEFICIT — complementary, not conflicting
- GIVEN `counts.LEGUMES > 0` and `counts.CEREALS < 3`
- WHEN `evaluateRules(ctx, rules, cooldown)` runs
- THEN both `LEGUME_CARB_SOURCE` and `CEREALS_DEFICIT` appear in evaluations

#### Scenario: Cooldown respected
- GIVEN rule fired once within 6 hours
- WHEN nudge engine evaluates rules again within that window
- THEN `LEGUME_CARB_SOURCE` is NOT re-evaluated (cooldown active)

#### Scenario: i18n keys resolve in both locales
- GIVEN `LEGUME_CARB_SOURCE` evaluation is rendered
- WHEN locale is `es-ES` or `en`
- THEN `title` resolves from `nudge.title.legumeCarbSource`
- AND `body` resolves from `nudge.body.legumeCarbSource`
