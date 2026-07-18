# Design: Nudge Engine Core + SafetyAlerts (PR1)

## Technical Approach

Pure rule evaluation pipeline: `buildNudgeContext()` (integration boundary — reads stores via `getState()`) → `evaluateRules()` (pure — matches conditions, checks cooldown, builds notifications) → caller enqueues into `useNudgeStore`. Rules as data (`SafetyRule[]`), no polymorphism. `CooldownTracker` wraps a `Map<string, number>` with injectable `now()`.

## Architecture Decisions

### Decision: buildNudgeContext imports stores; evaluateRules is pure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Pure context builder (pass log/restriction) | Testable but pushes integration burden to caller | **Rejected** — caller doesn't exist yet (PR1) |
| `buildNudgeContext` reads `getState()` | Imports stores, but it's the ONE integration boundary | **Chosen** — all impurity in one function. `evaluateRules` stays pure. |

### Decision: SafetyRule extends NudgeRule

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Standalone SafetyRule interface | Duplicates id/type/cooldown, needs separate evaluation type | **Rejected** — more surface area |
| `SafetyRule extends NudgeRule` | Reuses NudgeEvaluation, no new types needed | **Chosen** — adds `severity`, `condition`, `title`, `body` |

### Decision: PR2+ fields set to defaults

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Make fields optional | Callers must handle undefined | **Rejected** — shifts burden |
| Set `animalProteinCount=0`, `minutesSinceHydration=0`, `isTodayValid=true` | PR2 updates builder; callers unchanged | **Chosen** — backward-compatible extension |

### Decision: evaluateRules checks cooldown but does NOT register

| Option | Tradeoff | Decision |
|--------|----------|----------|
| evaluateRules registers cooldown | Mutates param — violates purity contract | **Rejected** — spec says MUST be pure |
| Caller registers after processing | Pure function, caller owns side effects | **Chosen** — cleaner contract, matches spec |

## Data Flow

```
Interval tick / event
       │
       ▼
buildNudgeContext()
  │  reads trackerStore.getState().restrictionActive
  │  reads logStore.getState().todayLog
  │  computes counts = countRations(todayLog)
  │  computes containsHighGlycemicFruit (category+name match)
  │  computes currentHour = Date.now().getHours()
  │
  └──→ returns NudgeContext
       │
       ▼
evaluateRules(ctx, SAFETY_RULES, cooldown)
  │  for each rule:
  │    condition(ctx) && !cooldown.isOnCooldown(id, cooldownMinutes)
  │    → buildNotification(rule) → NudgeEvaluation
  │
  └──→ returns NudgeEvaluation[]
       │
       ▼
Caller (integration):
  │  for each evaluation:
  │    cooldown.register(rule.id)
  │    useNudgeStore.getState().enqueue(eval.notification)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/nudge-engine/types.ts` | Modify | Add `SafetyRule extends NudgeRule`; extend `NudgeContext` with `counts`, `containsHighGlycemicFruit`, `currentHour` |
| `src/features/nudge-engine/rules.ts` | Create | `HIGH_GLYCEMIC_FRUITS` set + `SAFETY_RULES` array (3 rules with id/severity/condition/cooldown/title/body) |
| `src/features/nudge-engine/cooldownTracker.ts` | Create | `CooldownTracker` class wrapping `Map<string, number>`. DI constructor `now?: () => number` |
| `src/features/nudge-engine/engine.ts` | Create | `buildNudgeContext()`, `buildNotification()`, `evaluateRules()` |
| `src/features/nudge-engine/index.ts` | Modify | Export `SafetyRule`, `CooldownTracker`, `SAFETY_RULES`, `evaluateRules`, `buildNudgeContext` |

## Interfaces / Contracts

```typescript
// types.ts — additions
export interface SafetyRule extends NudgeRule {
  severity: NotificationSeverity
  condition: (ctx: NudgeContext) => boolean
  title: string
  body: string
}

export interface NudgeContext {
  // ...existing fields
  counts: CountByCategory
  containsHighGlycemicFruit: boolean
  currentHour: number
}
```

```typescript
// cooldownTracker.ts
export class CooldownTracker {
  constructor(now?: () => number)  // default: Date.now
  register(id: string): void
  isOnCooldown(id: string, cooldownMinutes: number): boolean
  reset(id?: string): void
}
```

```typescript
// engine.ts
export function buildNudgeContext(): NudgeContext
export function evaluateRules(
  ctx: NudgeContext,
  rules: SafetyRule[],
  cooldown: CooldownTracker,
): NudgeEvaluation[]
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `CooldownTracker` — register, isOnCooldown, expiry, reset, unknown id | Inject `now()`, assert boolean returns at time boundaries |
| Unit | Rule conditions — each of 3 rules with matching/non-matching ctx | Pure: pass NudgeContext, assert boolean. Cover boundary cases (CEREALS=4 vs 5, hour=19 vs 20, category gate) |
| Unit | `evaluateRules` — match, cooldown block, empty rules, no match | Pure: pass mock rules + cooldown, assert NudgeEvaluation[] content and count |
| Integration | `buildNudgeContext` — reads store state, computes counts + glycemic | Set `useTrackerStore` + `useLogStore` state via `setState()`, assert returned context fields |

## Migration / Rollout

No migration required. New code path — existing stores unchanged. Feature flag not needed (no UI in PR1).

## Open Questions

- None. All decisions resolved against spec and existing codebase.
