# Proposal: Use Diagnosis Age to Adjust Caloric Restriction Aggressiveness

## Intent

FR-4.1 requires `diagnosisAge` to adjust restriction aggressiveness. `diagnosisAge` is collected and stored but has zero behavioral effect — the code comment at `caloricTargetService.ts:11` explicitly says it "does not alter the MSJ formula." Early-onset T2D patients (<40) don't get the more aggressive deficit their phenotype warrants; late-onset (>60) don't get gentler restriction that protects against sarcopenia.

## Scope

### In Scope
- `getDiagnosisModifier(diagnosisAge)` pure function: 3 brackets (<40 → 1.0, 40-60 → 0.85, >60 → 0.7)
- Apply modifier to `PREDIMED_PLUS_DEFICIT_KCAL` in `computeCaloricTarget()` before floor/cap
- Update ADR-004 with `diagnosisAge` as algorithm input + modulation logic
- Update FR-MATRIX FR-4.1 from data-only to full implementation
- Unit tests for modifier + integration tests for `computeCaloricTarget()` with diagnosisAge

### Out of Scope
- Adjusting safety floor per diagnosisAge bracket (deferred: needs clinical review)
- UI changes (target display already exists)
- Clinical threshold validation by dietitian-nutritionist (RNF-01 — PR review gate)

## Capabilities

### New Capabilities
- `diagnosis-age-deficit`: diagnosisAge-based deficit modifier implementing FR-4.1 phenotypic filtering

### Modified Capabilities
None — no existing spec covers the caloric target algorithm behavior.

## Approach

Scale the 600 kcal PREDIMED-Plus deficit by a clinical modifier based on diagnosis age brackets (Approach 1 from exploration). Extract `getDiagnosisModifier()` as a pure exported function. Apply modifier: `Math.round(600 × modifier)`, then enforce existing 30% TDEE cap and 1200 kcal floor. BMR/TDEE calculation is untouched.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/services/caloricTargetService.ts` | Modified | Add `getDiagnosisModifier()`, apply to deficit |
| `src/shared/services/caloricTargetService.test.ts` | Modified | Add diagnosisAge bracket test cases |
| `adr/ADR-004-caloric-target-algorithm.md` | Modified | Add `diagnosisAge` input + modulation logic |
| `adr/FR-MATRIX-trazabilidad.md` | Modified | Update FR-4.1 to full implementation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bracket thresholds (40, 60) need expert validation | Med | Doc comments flag as evidence-based estimates; RNF-01 disclaimer |
| Existing test expects `diagnosisAge: 50` (0.85 bracket) — deficit changes from 574 to 488 | Low | Update test expectations; users likely haven't set diagnosisAge |

## Rollback Plan

Remove modifier call from `computeCaloricTarget()`, delete `getDiagnosisModifier()`. Revert test expectations. ADR-004 amendment is additive — no rollback needed for docs.

## Dependencies

None — `diagnosisAge` already flows through `UserMetrics` interface.

## Success Criteria

- [ ] `getDiagnosisModifier(< 40)` returns 1.0, `(40-60)` returns 0.85, `(> 60)` returns 0.7
- [ ] `computeCaloricTarget()` with diagnosisAge:50 produces deficit 510 when TDEE permits
- [ ] Deficit modifier does NOT affect BMR or TDEE values
- [ ] All existing tests pass after expectation updates
- [ ] FR-MATRIX FR-4.1 updated from ✅ data-only to ✅ full implementation
