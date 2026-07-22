# Proposal: M6 — Strength Training Goal Tracking

## Intent

Complete the WHO strength training target (≥2 sessions/week) in the Activity Tracker. The `WeeklyGoal` type and default already define `strengthSessionsMin: 2`, but the hook and view are partially wired — need to ensure `meetsStrength` drives a visible goal badge and the compliance computation includes the strength criterion.

## Scope

### In Scope
- Ensure `useActivityTracker` sets `strengthSessionsMin: 2` as default (verify `DEFAULT_WEEKLY_GOAL`)
- Ensure `meetsStrength` is computed from `strengthSessions >= strengthSessionsMin`
- Ensure `ActivityTrackerView` renders the "✅ Objetivo fuerza" badge conditionally
- Verify + test the badge renders correctly

### Out of Scope
- UI redesign of the activity tracker card
- Historical compliance reports or weekly summaries
- Push notifications or nudges for missed strength days

## Capabilities

### New Capabilities
- `activity-tracker`: Daily/weekly activity logging with moderate minutes and strength sessions, goal compliance computation, and streak tracking

### Modified Capabilities
- None — pure implementation gap inside an existing feature

## Approach

1. **Hook** — confirm `DEFAULT_WEEKLY_GOAL.strengthSessionsMin` is `2` and `meetsStrength` compares `strengthSessions` against it (already coded)
2. **View** — confirm `meetsStrength` prop is passed and the badge `<p>✅ Objetivo</p>` appears inside the strength sessions card (already coded)
3. **Test** — add a test case: when `strengthSessions >= 2`, badge renders; when < 2, it does not
4. Clean up any straggling type mismatches between `WeeklyGoal` interface and `DEFAULT_WEEKLY_GOAL`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/activity-tracker/hooks/useActivityTracker.ts` | Verify | `meetsStrength` already computed against `DEFAULT_WEEKLY_GOAL.strengthSessionsMin` |
| `features/activity-tracker/ActivityTrackerView.tsx` | Verify | Goal badge already rendered for `meetsStrength` |
| `features/activity-tracker/hooks/useActivityTracker.test.ts` | Modified | Add badge render verification |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Already implemented but badge text ambiguous | Low | Confirm badge reads "✅ Objetivo" contextually within the strength card |

## Rollback Plan

Single commit — revert `git revert HEAD` on the M6 commit. No schema changes, no data migration.

## Dependencies

- None (fully contained within `features/activity-tracker/`)

## Success Criteria

- [ ] `strengthSessionsMin` is `2` in `DEFAULT_WEEKLY_GOAL`
- [ ] `meetsStrength` is `true` when `strengthSessions >= 2`
- [ ] Badge renders in the "Sesiones fuerza" card when `meetsStrength` is `true`
- [ ] Badge is absent when `strengthSessions < 2`
- [ ] All existing tests pass
