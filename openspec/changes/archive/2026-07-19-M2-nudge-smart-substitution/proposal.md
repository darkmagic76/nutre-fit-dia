# Proposal: M2 — Nudge: Inteligente Substitution

## Intent

When a scanned food has `environmentalScore < 30`, the nudge engine must trigger a `BEHAVIORAL_NUDGE` with sustainable alternatives (legumes + blue fish) via the existing `suggestAlternative()`. This enables the "Sustitución Inteligente" requirement from SPECS_RF.

## Scope

### In Scope
- Add `SUSTAINABLE_SUBSTITUTION` rule to `NUDGE_RULES` in nudge-engine/rules.ts
- Extend `NudgeContext` with `environmentalScore` and `alternatives` fields
- Pass scanned food from ScannerContainer → `evaluateAndEnqueue(food?)` → `buildNudgeContext()`
- Unit tests for the new rule condition + integration test for the full flow

### Out of Scope
- UI changes to NudgePanel (existing H7 handles all BEHAVIORAL_NUDGE types)
- Scoring algorithm changes (H3 scoring is already production)
- Suggesting substitutions for foods already in the log (only on scan)

## Capabilities

### New Capabilities
None — this change integrates three existing capabilities.

### Modified Capabilities
- **nudge-engine**: New `SUSTAINABLE_SUBSTITUTION` rule (type BEHAVIORAL_NUDGE). New `environmentalScore` and `alternatives` fields in `NudgeContext`. `buildNudgeContext()` gains optional `food` parameter to compute these fields.

## Approach

Extend `evaluateAndEnqueue(food?: Food)` to accept the scanned food. `buildNudgeContext(food?)` computes `environmentalScore` from the food (via `computeEnvironmentalScore`) and `alternatives` (via `suggestAlternative`). The new rule checks `environmentalScore < 30 && alternatives.length > 0`.

Minimal change — 17 lines added, 0 modified in existing rules.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/nudge-engine/types.ts` | Modified | Add `environmentalScore: number \| null` + `alternatives: Food[]` to NudgeContext |
| `src/features/nudge-engine/rules.ts` | Modified | Append `SUSTAINABLE_SUBSTITUTION` rule to `NUDGE_RULES` array |
| `src/features/nudge-engine/engine.ts` | Modified | `buildNudgeContext(food?)` accepts optional food param; update `evaluateAndEnqueue(food?)` |
| `src/features/nudge-engine/rules.test.ts` | New tests | Test condition: score < 30 + has alternatives vs score ≥ 30 vs no alternatives |
| `src/features/nudge-engine/nudgeEngine.integration.test.ts` | New test | Full pipeline: scan high-carbon food → nudge enqueued with alternative names in body |
| `src/features/nutritional-traffic-light/ScannerContainer.tsx` | Modified | Pass `selected` food to `evaluateAndEnqueue(selected)` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hardcoded threshold (30) needs tuning | Low | Config constant in rules.ts, easy to adjust |
| Cooldown prevents re-triggering on re-scan | Low | Cooldown 24h is appropriate for sustainability nudges |

## Rollback Plan

Remove the `SUSTAINABLE_SUBSTITUTION` rule from `NUDGE_RULES` array, revert `buildNudgeContext` signature to no-arg, and revert `evaluateAndEnqueue` to no-arg. All other rules continue working unchanged.

## Dependencies

- M1 (`suggestAlternative`) — already shipped in development
- H3 (`computeEnvironmentalScore`) — already shipped
- H2 (`evaluateAndEnqueue` pipeline) — already shipped

## Success Criteria

- [ ] Unit test: `SUSTAINABLE_SUBSTITUTION` fires when `environmentalScore < 30` and alternatives exist
- [ ] Unit test: does NOT fire when `environmentalScore >= 30` (even with alternatives)
- [ ] Unit test: does NOT fire when alternatives are empty (even with low score)
- [ ] Integration test: scanning a high-carbon food (white meat) enqueues a BEHAVIORAL_NUDGE with alternative names in the body
- [ ] All existing 14 rules continue passing untouched
- [ ] No regressions in ScannerContainer classification flow
