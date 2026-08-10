# Delta for nudge-engine

## ADDED Requirements

### Requirement: ContextInput Type

`ContextInput` MUST be `{ restrictionActive: boolean; todayLog: Food[]; weeklyMinutes: number; trends: BiomarkerTrend; food?: Food }`. No store/framework types. Maps 1:1 to `getState()` calls currently inside `buildNudgeContext()`.

#### Scenario: Typecheck enforces contract

- GIVEN `buildNudgeContext(input: ContextInput)`
- WHEN called with partial object
- THEN TS rejects missing fields
- AND plain data literal `{ restrictionActive: true, todayLog: [], weeklyMinutes: 0, trends: {...} }` passes without store mocking

### Requirement: EngineDeps & Container Orchestration

`EngineDeps` MUST expose `enqueue(notif)`, `acknowledge(id)`, `pending: SystemNotification[]`. `CooldownTracker` SHALL receive `{ registerCooldown, getCooldowns, resetCooldown }` from container's nudgeStore. Containers orchestrate: `NudgeEngineContainer` builds `EngineDeps` + `CooldownTracker`; `NutritionalTrafficLightContainer`, `MetabolicTrackerContainer`, `ActivityTrackerContainer` build `ContextInput` from 4 stores. Engine MUST have zero Zustand imports.

#### Scenario: NudgeEngineContainer assembles dependencies

- GIVEN container renders
- WHEN calling engine
- THEN passes `EngineDeps` wired from `useNudgeStore` + `CooldownTracker` with injected ops

#### Scenario: Other containers build ContextInput

- GIVEN trackerStore, logStore, activityStore, biomarkerStore have state
- WHEN container calls `buildNudgeContext(input)`
- THEN reads all 4 stores, passes `ContextInput` POJO — engine code never imports stores

## MODIFIED Requirements

### REQ-NUDGE-CONTEXT: buildNudgeContext(input)

`buildNudgeContext(input: ContextInput)` MUST accept `ContextInput` instead of reading stores. Calls `countRations(input.todayLog)`, detects glycemic fruits via `HIGH_GLYCEMIC.has(f.name)` where `f.category === FRUITS`, derives `currentHour` from `Date.now().getHours()`. When `input.food` provided, computes `environmentalScore`/`alternatives`. When omitted, both MUST be `null`. Other fields from `input.trends`/`input.weeklyMinutes`. Zero side effects, zero store imports.
(Previously: `buildNudgeContext(food?)` read 4 stores via `getState()`.)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy path | restrictionActive=true, log=[3 cereals, 1 apple] | buildNudgeContext(input) | counts.CEREALS=3, containsHighGlycemicFruit=false |
| Glycemic fruit | todayLog has "uva" in FRUITS | buildNudgeContext(input) | containsHighGlycemicFruit=true |
| Empty log | todayLog=[] | buildNudgeContext(input) | all counts=0, containsHighGlycemicFruit=false |
| Category gate | "uva" in non-FRUITS | buildNudgeContext(input) | containsHighGlycemicFruit=false |
| Food provided | food=chorizo (CF=8.0) | buildNudgeContext(input) | environmentalScore=22, alternatives=[lentejas, garbanzos, caballa] |
| Food omitted | food=undefined | buildNudgeContext(input) | environmentalScore=null, alternatives=null |
| Pure function | input passed, no stores mocked | function executed | zero `getState()` calls, zero Zustand imports |

### REQ-NUDGE-COOLDOWN: CooldownTracker Constructor Injection

Constructor MUST accept `{ registerCooldown, getCooldowns, resetCooldown }`. `register(id)` calls `ops.registerCooldown(id, now())`. `isOnCooldown(id, m)` calls `ops.getCooldowns()`, computes elapsed. `reset(id?)` calls `ops.resetCooldown(id)`. MUST NOT import `useNudgeStore`. Injectable `now()` preserved.
(Previously: called `useNudgeStore.getState()` directly in every method.)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| DI ctor wires ops | ops `{ reg: mock, get: ()=>({}), reset: mock }`, now=()=>0 | `new CooldownTracker(ops, now).register("R1")` | mock called `("R1",0)`, no nudgeStore import |
| Cooldown blocks/expires | `getCooldowns()` returns `{R1:0}`, m=60 | now=0 → true; now=61 | blocks within window, allows after |
| Unknown + reset | empty getCooldowns | `isOnCooldown("X",60)`→false; `reset("R1")` calls `ops.resetCooldown("R1")` |

### REQ-NUDGE-INTEGRATION: evaluateAndEnqueue with Injected Dependencies

`evaluateAndEnqueue(ctx, deps: EngineDeps, cooldown: CooldownTracker)` MUST be pure — no Zustand imports. Resolves stale non-safety pending nudges via `deps.acknowledge(id)`. Enqueues new matches via `deps.enqueue(notif)`, registers cooldown. Containers call `buildNudgeContext(input)` separately before this. SAFETY_ALERT excluded from auto-resolve.
(Previously: `evaluateAndEnqueue(food?)` called `buildNudgeContext()` and `useNudgeStore.getState()` internally.)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Zero Zustand imports | engine module source | grep for store imports | no Zustand stores imported |
| Stale auto-resolve | deps.pending has behavioral nudge R1, ctx no longer matches | evaluateAndEnqueue(ctx, deps, cooldown) | `deps.acknowledge(id)` called |
| New match enqueued | ctx matches R2, not on cooldown | evaluateAndEnqueue(ctx, deps, cooldown) | `deps.enqueue(notification)` + `cooldown.register("R2")` |
| SAFETY_ALERT preserved | deps.pending has safety alert, condition no longer met | evaluateAndEnqueue(ctx, deps, cooldown) | acknowledge NOT called for safety alert |
