# Tasks: Nudge Engine Core + SafetyAlerts (PR1)

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

| Field | Value |
|-------|-------|
| Estimated changed lines | ~380 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

## Phase 1: Foundation — Types & Cooldown

- [x] 1.1 `src/features/nudge-engine/types.ts` — add `SafetyRule extends NudgeRule` (severity, condition, title, body). Extend `NudgeContext` with `counts: CountByCategory`, `containsHighGlycemicFruit: boolean`, `currentHour: number`
- [x] 1.2 `src/features/nudge-engine/cooldownTracker.test.ts` — RED: write CooldownTracker tests (register, isOnCooldown at t=0 vs t=61, unknown id, reset all, reset single, default Date.now)
- [x] 1.3 `src/features/nudge-engine/cooldownTracker.ts` — GREEN: implement CooldownTracker class (`Map<string, number>`, constructor `now?: () => number`, register, isOnCooldown, reset)

## Phase 2: Core — Rules & Engine

- [x] 2.1 `src/features/nudge-engine/rules.test.ts` — RED: test each of 3 rule conditions directly (CEREALS >4 with restriction, glycemic fruit name+category gate, VEGETABLES <3 && hour>=20, boundary cases at 4 cereals, hour=19, hour=20)
- [x] 2.2 `src/features/nudge-engine/rules.ts` — GREEN: implement `HIGH_GLYCEMIC_FRUITS` set + `SAFETY_RULES` array (3 SafetyRule objects with conditions, titles, bodies)
- [x] 2.3 `src/features/nudge-engine/engine.test.ts` — RED: test `buildNudgeContext()` (reads stores, counts, glycemic detection, category gate, empty log, hour derivation) + test `evaluateRules()` as pure function (multiple match, cooldown block, no match, empty rules, no mutation)
- [x] 2.4 `src/features/nudge-engine/engine.ts` — GREEN: implement `buildNudgeContext()` (reads trackerStore/logStore via getState, counts via countRations, glycemic match) + `buildNotification()` + `evaluateRules()` (filter condition && !cooldown, map to NudgeEvaluation)

## Phase 3: Integration & Polish

- [x] 3.1 `src/features/nudge-engine/nudgeEngine.integration.test.ts` — write integration test: set store state via `useTrackerStore.setState`/`useLogStore.setState`, build context, evaluate, assert full pipeline output with expected rule matches and cooldown effects
- [x] 3.2 `src/features/nudge-engine/index.ts` — export `SafetyRule`, `CooldownTracker`, `SAFETY_RULES`, `buildNudgeContext`, `evaluateRules`
- [x] 3.3 Run `pnpm typecheck && pnpm test:run` — verify all tests green, no type errors
