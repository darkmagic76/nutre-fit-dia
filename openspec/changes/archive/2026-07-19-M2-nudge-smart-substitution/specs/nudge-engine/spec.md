# Delta for nudge-engine

## ADDED Requirements

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

## MODIFIED Requirements

### REQ-NUDGE-CONTEXT: buildNudgeContext()

`buildNudgeContext(food?)` **MUST** read `restrictionActive` (trackerStore), `todayLog` (logStore), compute `CountByCategory` via `countRations()`, detect glycemic fruits via `HIGH_GLYCEMIC.has(f.name)` where `f.category === FRUITS`, derive `currentHour` from `Date.now().getHours()`, and when `food` is provided **MUST** compute `environmentalScore` via `computeEnvironmentalScore(food)` and `alternatives` via `suggestAlternative(food)`. When `food` is omitted, `environmentalScore` **MUST** be `null` and `alternatives` **MUST** be `null`.
(Previously: `buildNudgeContext()` with no food parameter, no environmental or alternatives fields)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy path | restrictionActive=true, log: 3 cereals + 1 apple | buildNudgeContext() | counts.CEREALS=3, containsHighGlycemicFruit=false |
| Glycemic fruit | log has "uva" in FRUITS | buildNudgeContext() | containsHighGlycemicFruit=true |
| Empty log | todayLog=[] | buildNudgeContext() | all counts=0, containsHighGlycemicFruit=false |
| Category gate | "uva" in non-FRUITS category | buildNudgeContext() | containsHighGlycemicFruit=false |
| Food provided | food=chorizo (CF=8.0) | buildNudgeContext(food) | environmentalScore=22, alternatives=[lentejas, garbanzos, caballa] |
| Food omitted | no food arg | buildNudgeContext() | environmentalScore=null, alternatives=null |
| Food with no alternatives | food=someFood, suggestAlternative returns [] | buildNudgeContext(food) | environmentalScore=22, alternatives=null |
