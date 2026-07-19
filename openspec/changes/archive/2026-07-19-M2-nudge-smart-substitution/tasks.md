# Tasks: M2 — Nudge: Inteligente Substitution

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: TDD RED — Tests First

- [x] 1.1 Add `environmentalScore: number | null` and `alternatives: string[] | null` to `NudgeContext` in `types.ts`
- [x] 1.2 Add `SUSTAINABLE_SUBSTITUTION` test: fires when score < 30 and alternatives exist (`rules.test.ts`)
- [x] 1.3 Add test: does NOT fire when score >= 30 (`rules.test.ts`)
- [x] 1.4 Add test: does NOT fire when alternatives is null (`rules.test.ts`)
- [x] 1.5 Add test: `buildNudgeContext(food)` computes environmentalScore + alternatives (`engine.test.ts`)
- [x] 1.6 Add test: `buildNudgeContext()` without food sets both to null (`engine.test.ts`)
- [x] 1.7 Update all `NudgeContext` mocks in `engine.test.ts` (x6) + `nudgeEngine.integration.test.ts` (fixed dayOfWeek non-determinism) with new nullable fields

## Phase 2: TDD GREEN — Implementation

- [x] 2.1 Append `SUSTAINABLE_SUBSTITUTION` to `NUDGE_RULES` in `rules.ts`: BEHAVIORAL_NUDGE, COOLDOWN_4H, condition gates on `ctx.environmentalScore !== null && ctx.environmentalScore < 30 && ctx.alternatives !== null && ctx.alternatives.length > 0`, body includes `alternatives.slice(0,3).join(', ')`
- [x] 2.2 Extend `buildNudgeContext(food?: Food)` in `engine.ts`: import `computeEnvironmentalScore` + `suggestAlternative` from `@shared/sustainability`, compute fields when food provided, set null otherwise
- [x] 2.3 Extend `evaluateAndEnqueue(food?: Food)` in `engine.ts`: pass food param through to `buildNudgeContext(food)`

## Phase 3: Integration Wiring

- [x] 3.1 Change `evaluateAndEnqueue()` → `evaluateAndEnqueue(selected!)` in `ScannerContainer.tsx` `handleClassify`
- [x] 3.2 Run `pnpm quality` — all 330 tests pass clean

## Notes

- `alternatives: null` when food omitted OR when `suggestAlternative` returns `[]` — per design decision (follows `latestGlucose: number | null` convention)
- `handleAddToLog` keeps `evaluateAndEnqueue()` without food — proposal scope ("only on scan")
- `engine.ts` imports from `@shared/sustainability` (both `computeEnvironmentalScore` + `suggestAlternative` already exported)
