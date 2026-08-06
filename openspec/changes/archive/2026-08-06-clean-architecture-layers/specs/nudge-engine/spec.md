# Delta for Nudge Engine

## ADDED Requirements

### Requirement: Use Case Wrapper for Nudge Integration

`application/use-cases/evaluateNudges.ts` SHALL wrap the nudge engine pipeline: build context → evaluate rules → auto-resolve → enqueue. The use case SHALL receive `NotificationRepository`, `ActivityRepository`, `BiomarkerRepository`, and `LogRepository` as parameters. Zero Zustand imports.

#### Scenario: Use case enqueues through port

- GIVEN `evaluateNudges(ctx, rules, notificationRepo, activityRepo, biomarkerRepo, logRepo)` is called
- WHEN rules match and produce evaluations
- THEN notifications SHALL be enqueued via `notificationRepo.enqueue()`
- AND the use case SHALL NOT call `useNudgeStore.getState()` directly

#### Scenario: Use case testable with in-memory fakes

- GIVEN in-memory fakes for all four repository ports
- WHEN `evaluateNudges` is called
- THEN all integration reads go through the fake ports
- AND the test requires zero Zustand mocks

## MODIFIED Requirements

### REQ-NUDGE-INTEGRATION: Side-effect boundary

`evaluateNudges()` use case is the single integration boundary — it receives repositories as ports and reads stores through them. `buildNudgeContext()` and `evaluateRules()` remain pure: no store access, no side effects. The use case receives `NudgeEvaluation[]` from `evaluateRules()` and enqueues via `notificationRepo.enqueue()`.

(Previously: `buildNudgeContext()` is the single integration boundary — it reads trackerStore + logStore via `getState()`. `evaluateRules()` is pure: no store access, no side effects. Caller receives `NudgeEvaluation[]` and calls `useNudgeStore.getState().enqueue()`.)

#### Scenario: Use case enqueues via port (updated)

- GIVEN engine returns `[eval1, eval2]`
- WHEN the use case processes evaluations
- THEN `notificationRepo.enqueue()` SHALL be called for each evaluation

#### Scenario: evaluateRules is pure (unchanged)

- GIVEN engine module source
- THEN `evaluateRules()` imports no Zustand stores, no nudgeStore, no logStore, no trackerStore
- AND `buildNudgeContext()` imports no Zustand stores, no nudgeStore, no logStore, no trackerStore (inputs received as params)
