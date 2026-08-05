# Nudge Engine Core Specification

**ADR-008**: Nudge taxonomy — SafetyAlert type maps to `safety_alert`, severity to `hard_block`/`soft_warn`.

## Purpose

SafetyAlert evaluation pipeline: build context, match rules, respect cooldowns, return notifications. Pure engine — no side effects. Caller enqueues into `useNudgeStore`.

## Requirements

### REQ-NUDGE-CONTEXT: buildNudgeContext()

`buildNudgeContext(food?)` **MUST** read `restrictionActive` (trackerStore), `todayLog` (logStore), compute `CountByCategory` via `countRations()`, detect glycemic fruits via `HIGH_GLYCEMIC.has(f.name)` where `f.category === FRUITS`, derive `currentHour` from `Date.now().getHours()`, and when `food` is provided **MUST** compute `environmentalScore` via `computeEnvironmentalScore(food)` and `alternatives` via `suggestAlternative(food)`. When `food` is omitted, `environmentalScore` **MUST** be `null` and `alternatives` **MUST** be `null`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy path | restrictionActive=true, log: 3 cereals + 1 apple | buildNudgeContext() | counts.CEREALS=3, containsHighGlycemicFruit=false |
| Glycemic fruit | log has "uva" in FRUITS | buildNudgeContext() | containsHighGlycemicFruit=true |
| Empty log | todayLog=[] | buildNudgeContext() | all counts=0, containsHighGlycemicFruit=false |
| Category gate | "uva" in non-FRUITS category | buildNudgeContext() | containsHighGlycemicFruit=false |
| Food provided | food=chorizo (CF=8.0) | buildNudgeContext(food) | environmentalScore=22, alternatives=[lentejas, garbanzos, caballa] |
| Food omitted | no food arg | buildNudgeContext() | environmentalScore=null, alternatives=null |
| Food with no alternatives | food=someFood, suggestAlternative returns [] | buildNudgeContext(food) | environmentalScore=22, alternatives=null |

### REQ-NUDGE-EVALUATE: evaluateRules()

`evaluateRules(ctx, rules, cooldown)` **MUST** be pure. Iterates rules, evaluates `condition(ctx)`, skips cooldown. Returns `NudgeEvaluation[]`. **MUST NOT** mutate params.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Multiple match | 2 rules match, cooldown empty | evaluateRules() | returns 2 evaluations |
| All on cooldown | 2 rules match, both on cooldown | evaluateRules() | returns [] |
| None match | no condition true | evaluateRules() | returns [] |
| Empty rules | rules=[] | evaluateRules() | returns [] |

### Requirement: Nudge Store Persist Middleware

The nudgeStore MUST use `zustand/persist` middleware. `pending` and `history` notification arrays SHALL persist across refresh. Notification IDs and metadata are non-sensitive — plaintext storage.

#### Scenario: Notification history survives refresh

- GIVEN 3 notifications have been acknowledged and moved to `history`
- WHEN the page is refreshed
- THEN `history` SHALL contain all 3 notifications
- AND `pending` SHALL be empty

#### Scenario: Pending notifications survive refresh

- GIVEN 2 notifications are in `pending`
- WHEN the page is refreshed
- THEN `pending` SHALL contain both notifications

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted
- WHEN serialized state is inspected
- THEN `enqueue`, `acknowledge`, `dismiss`, `clearPending` SHALL NOT be present

### Requirement: Cooldown State Migrated to nudgeStore

Cooldown `Map<string, number>` SHALL move from in-memory `CooldownTracker` class into persisted nudgeStore state as `cooldowns: Record<string, number>`. Cooldowns SHALL persist across refresh. CooldownTracker class MAY be kept as a thin wrapper reading/writing via `useNudgeStore.getState()`.

#### Scenario: Cooldown persists across refresh

- GIVEN rule "R1" registered at timestamp 1000, cooldownMinutes=1440 (24h)
- WHEN the page is refreshed
- THEN `isOnCooldown("R1", 1440)` at timestamp 1001 SHALL return true
- AND at timestamp 1000 + 24h + 1ms SHALL return false

#### Scenario: Unknown rule not on cooldown

- GIVEN `cooldowns` has no entry for "R99"
- WHEN `isOnCooldown("R99", 60)` is called
- THEN SHALL return false

### REQ-NUDGE-COOLDOWN: CooldownTracker

Cooldown state (`cooldowns: Record<string, number>`) MUST live in persisted `nudgeStore` state instead of an in-memory `Map` class field. The `CooldownTracker` class SHALL read/write via `useNudgeStore.getState().cooldowns`. Methods `register(id)`, `isOnCooldown(id, cooldownMinutes)`, `reset(id?)` MUST preserve identical semantics.
(Previously: Cooldown was in-memory `Map<string, number>` class field in `CooldownTracker` — lost on page refresh.)

#### Scenario: Cooldown blocks and expires
- GIVEN tracker with `now = () => 0`, rule cooldown=60
- WHEN `register("R1")` then `isOnCooldown("R1", 60)` at t=0 → true; at t=61 → false
- THEN cooldown blocks within window, allows after expiry

#### Scenario: Unknown rule and reset
- GIVEN empty tracker
- THEN `isOnCooldown("unknown", 60)` returns false
- AND `reset()` clears all entries; `reset("R1")` clears single

### REQ-CEREALS-RESTRICTION: Hard-block on excess cereals

**MUST** fire when `restrictionActive && counts.CEREALS > 4`. Severity `hard_block`, type `safety_alert`, cooldown 24h.

#### Scenario: Respects restriction guard
- GIVEN `counts.CEREALS=5`
- WHEN `restrictionActive=false` → condition false; `restrictionActive=true` → condition true
- THEN rule only activates during caloric restriction

#### Scenario: Boundary at 4
- GIVEN `restrictionActive=true, counts.CEREALS=4`
- WHEN condition evaluated
- THEN returns false (≤4 is within limit)

### REQ-CEREALS-DEFICIT: Cereal deficit reminder

**MUST** fire when `counts.CEREALS < 3`. Type `behavioral_nudge`, severity `info`, cooldown 6h.
Added 2026-07-23 per INFORME_ADR FR-2 requirement (minimum 3 cereal rations/day).

#### Scenario: Fires when below minimum
- GIVEN `counts.CEREALS=2`
- WHEN condition evaluated
- THEN returns true

#### Scenario: Does not fire at minimum
- GIVEN `counts.CEREALS=3`
- WHEN condition evaluated
- THEN returns false

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

### REQ-FRUITS-GLYCEMIC: Warning on high-GI fruit

**MUST** fire when `containsHighGlycemicFruit`. Glycemic set: `{uva, dátil, higo, pasa, plátano maduro}`. Severity `soft_warn`, cooldown 24h.

#### Scenario: Category gate prevents false match
- GIVEN food name "uva" with category=VEGETABLES
- WHEN buildNudgeContext() computes containsHighGlycemicFruit
- THEN returns false (category must be FRUITS)

#### Scenario: Fires on glycemic fruit
- GIVEN food name "dátil" with category=FRUITS
- WHEN condition(ctx)
- THEN returns true, severity soft_warn

### REQ-FRUITS-DEFICIT: Fruit deficit reminder

**MUST** fire when `counts.FRUITS < 2`. Type `behavioral_nudge`, severity `info`, cooldown 6h.
Added 2026-07-23 per SPECS_RF / SPECS_TECH §5 requirement (minimum 2 fruit rations/day).

#### Scenario: Fires when below minimum
- GIVEN `counts.FRUITS=1`
- WHEN condition evaluated
- THEN returns true

#### Scenario: Does not fire at minimum
- GIVEN `counts.FRUITS=2`
- WHEN condition evaluated
- THEN returns false

### REQ-VEGETABLES-DEFICIT: Afternoon vegetable reminder

**MUST** fire when `counts.VEGETABLES < 3 && currentHour >= 14`. Type `behavioral_nudge`, severity `info`, cooldown 6h.
Updated 2026-07-23: threshold lowered from 20 (8PM) to 14 (2PM) for earlier intervention.

#### Scenario: Time gate blocks before 14:00
- GIVEN counts.VEGETABLES=2
- WHEN currentHour=13 → false; currentHour=14 → true
- THEN rule activates from 14:00 (afternoon window)

#### Scenario: Sufficient vegetables
- GIVEN `counts.VEGETABLES=3, currentHour=15`
- WHEN condition(ctx)
- THEN returns false

### REQ-NUDGE-INTEGRATION: Side-effect boundary

`buildNudgeContext()` is the single integration boundary — it reads trackerStore + logStore via `getState()`. `evaluateRules()` is pure: no store access, no side effects. Caller receives `NudgeEvaluation[]` and calls `useNudgeStore.getState().enqueue()`.

#### Scenario: Caller enqueues evaluations
- GIVEN engine returns `[eval1, eval2]`
- WHEN caller enqueues each notification
- THEN nudgeStore.pending has 2 new items

#### Scenario: evaluateRules is pure
- GIVEN engine module source
- THEN `evaluateRules()` imports no Zustand stores, no nudgeStore, no logStore, no trackerStore

### REQ-SUSTAINABLE-SUBSTITUTION: Substitution nudge on high-carbon scan

**MUST** fire a `BEHAVIORAL_NUDGE` when `environmentalScore < 30 && alternatives.length > 0`. Cooldown **SHALL** be 4 hours. The notification body **MUST** include up to 3 alternative food names from `alternatives`.

#### Scenario: Fires on high-carbon food with alternatives

- GIVEN `environmentalScore=20` and `alternatives=[lentejas, garbanzos, caballa]`
- WHEN `condition(ctx)` is evaluated
- THEN returns true, type `BEHAVIORAL_NUDGE`, cooldown 240 minutes
- AND body includes "lentejas, garbanzos, caballa"

#### Scenario: Does NOT fire when score >= 30

- GIVEN `environmentalScore=45` and `alternatives=[lentejas]`
- WHEN `condition(ctx)` is evaluated
- THEN returns false

#### Scenario: Does NOT fire when no alternatives exist

- GIVEN `environmentalScore=20` and `alternatives=null`
- WHEN `condition(ctx)` is evaluated
- THEN returns false

#### Scenario: Low-carbon food does not trigger

- GIVEN `environmentalScore=12` (legumes CF=0.8) and `alternatives=null`
- WHEN `condition(ctx)` is evaluated
- THEN returns false

### REQ-EGGS-RED-MEAT-ALT: Eggs as red meat alternative nudge

The `EGGS_RED_MEAT_ALT` rule (id `'EGGS_RED_MEAT_ALT'`, type `SYSTEM_ACTION`) MUST fire when `counts[FoodCategory.RED_MEAT] > 0 && !ctx.hasEggs`. The condition MUST NOT check `WHITE_MEAT`.

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

## Non-Functional

- **TDD**: every scenario is a test case. Write test → fail → implement → pass.
- **Performance**: `evaluateRules` on 3 rules completes under 1ms.
- **Scope Rule**: all code in `src/features/nudge-engine/`, nothing in `src/shared/`.
- **Glycemic set** is a module-level `Set<string>` in `rules.ts` — not config or env.
