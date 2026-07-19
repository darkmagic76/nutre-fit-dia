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

### REQ-NUDGE-COOLDOWN: CooldownTracker

In-memory `Map<ruleId, timestamp>`. Constructor accepts `now?: () => number` for DI. Methods: `register(id)`, `isOnCooldown(id, cooldownMinutes)`, `reset(id?)`.

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

### REQ-VEGETABLES-DEFICIT: Evening vegetable reminder

**MUST** fire when `counts.VEGETABLES < 3 && currentHour >= 20`. Severity `soft_warn`, cooldown 6h.

#### Scenario: Time gate blocks before 20:00
- GIVEN counts.VEGETABLES=2
- WHEN currentHour=19 → false; currentHour=20 → true
- THEN rule activates only from 20:00

#### Scenario: Sufficient vegetables
- GIVEN `counts.VEGETABLES=3, currentHour=21`
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

## Non-Functional

- **TDD**: every scenario is a test case. Write test → fail → implement → pass.
- **Performance**: `evaluateRules` on 3 rules completes under 1ms.
- **Scope Rule**: all code in `src/features/nudge-engine/`, nothing in `src/shared/`.
- **Glycemic set** is a module-level `Set<string>` in `rules.ts` — not config or env.
