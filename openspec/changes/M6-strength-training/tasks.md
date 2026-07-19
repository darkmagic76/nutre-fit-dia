# Tasks — M6-strength-training

## Phase 1: Audit + Test (RED)
- [x] 1.1 Verify useActivityTracker sets strengthSessionsMin=2
- [x] 1.2 Verify meetsStrength is computed correctly
- [x] 1.3 Write test: meetsStrength=true when strengthSessions >= 2
- [x] 1.4 Write test: ActivityTrackerView shows "✅ Objetivo" when meetsStrength

## Phase 2: Wire + Verify (GREEN)
- [x] 2.1 Ensure weeklyGoal.strengthSessionsMin default is 2 in hook
- [x] 2.2 Render goal badge in ActivityTrackerView when meetsStrength
- [x] 2.3 Run pnpm quality — all tests pass
