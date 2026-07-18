# Proposal: Nudge Engine Core + SafetyAlerts (PR1)

## Intent

Build nudge engine evaluation pipeline — `buildNudgeContext()`, `evaluateRules()`, `CooldownTracker` — with 3 SafetyAlert rules. PR1 of H2 (3 chained PRs). Safety-critical alerts fire before behavioral nudges (PR2+).

## Scope

**In**: `buildNudgeContext()`, `evaluateRules()`, `CooldownTracker`, 3 SafetyAlert rules, `NudgeContext` extension

**Out**: Behavioral nudges, UI components, `SafetyAlert` from `rationValidator.ts`

## Capabilities

**New**: `nudge-engine` — rule evaluation pipeline (context, matching, cooldown, notification generation)

**Modified**: None — existing specs unchanged; reads `restrictionActive`/`todayLog` via Zustand `getState()`

## Rules

| Rule | Severity | Condition | Cooldown |
|------|----------|-----------|----------|
| `CEREALS_RESTRICTION` | `HARD_BLOCK` | `restrictionActive && counts.CEREALS > 4` | 24h |
| `FRUITS_GLYCEMIC_ALERT` | `SOFT_WARN` | food.name in {uva,dátil,higo,pasa,plátano maduro} AND category==FRUITS | 24h |
| `VEGETABLES_DEFICIT` | `SOFT_WARN` | `counts.VEGETABLES < 3 && hour >= 20` | 6h |

## Approach

**Data-driven rules**: `SafetyRule[]` array with `condition: (ctx) => boolean`. Iterate, evaluate, no switch/polymorphism.

**Pure engine**: `evaluateRules()` returns `NudgeEvaluation[]`. No side effects — caller enqueues into `useNudgeStore`.

**CooldownTracker**: `Map<string, number>` keyed by rule ID. Accepts optional `now()` for testability.

**Context builder**: reads `restrictionActive` (trackerStore), `todayLog` (logStore), computes counts + glycemic fruit match + currentHour.

## Architecture

```
buildNudgeContext()
  → counts = countRations(todayLog)
  → containsHighGlycemicFruit = todayLog.some(f => f.category==FRUITS && HIGH_GLYCEMIC.has(f.name))
  → currentHour = Date.now().getHours()

evaluateRules(ctx, rules, cooldown)
  → rules.filter(r => r.condition(ctx) && !cooldown.isOnCooldown(r.id))
       .map(r => ({ rule: r, notification: buildNotification(r) }))
```

## Affected Files

| File | Change |
|------|--------|
| `types.ts` | Add `SafetyRule` interface, extend `NudgeContext` |
| `rules.ts` | NEW: 3 rule defs + highGlycemicFruits set |
| `cooldownTracker.ts` | NEW: CooldownTracker class |
| `engine.ts` | NEW: buildNudgeContext + evaluateRules |
| `index.ts` | Export new types/functions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Empty todayLog → all counts 0 | Low | No false alerts — all conditions evaluate to false |
| Cooldown lost on refresh | Low | Acceptable V1; sessionStorage later if needed |
| Glycemic match on wrong category | Low | Filter by `food.category == FRUITS` before matching |

## Dependencies

- `restrictionActive` in trackerStore ✅
- `todayLog` + `countRations()` ✅
- `SystemNotification` type ✅

## Estimate

~180 impl lines, ~160 test lines, 5 files (3 new, 2 modified), ~8 unit tests.

## Success Criteria

- [ ] All 3 rules produce correct `NudgeEvaluation` when conditions match
- [ ] Cooldown blocks retrigger; allows after expiry
- [ ] HARD_BLOCK → severity `hard_block`, type `safety_alert`
- [ ] Glycemic rule matches by name AND category
- [ ] Vegetables rule fires only after 20:00
- [ ] `pnpm test:run` + `pnpm typecheck` pass

## Rollback

`git revert` the 5 files. No shared code touched — no cascading impact.
