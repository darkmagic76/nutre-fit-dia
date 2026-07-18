# Proposal: H4 — Dual Qualification Scanner

## Intent

Wire the scanner (ADR-003 `ScannerAdapter`) with sustainability scoring (ADR-007) to produce dual qualification: health + environmental score per scanned food. Required by SPECS_RF "Calificación Dual" — backward-compatible, no UI changes.

## Scope

### In Scope
- Add `environmentalScore?: EnvironmentalScore` to `ScanResult` in infra types
- Add `environmentalScore?: EnvironmentalScore` to `ClassificationResult` in classification service
- `classifyFoodWithReasons()` calls `computeEnvironmentalScore(food)` and includes it in result
- 3 new tests: with carbon data, without carbon data, health+env combined output

### Out of Scope
- ScannerView / ScannerContainer changes (none needed — backward-compatible)
- Nudge integration on low environmental score (deferred to M2)
- Water footprint or packaging scoring (H3 V1 already defers these)

## Capabilities

### New Capabilities
- None — scanner dual qualification is integration of existing capabilities

### Modified Capabilities
- None — `ScanResult` and `ClassificationResult` contracts are extended with optional fields; no existing spec changes at the requirement level. `sustainability-scoring` spec already defines `EnvironmentalScore` and the dual qualification contract (ADR-007 §"Dual Qualification Contract").

## Approach

Backward-compatible extension pattern per ADR-007 §"Dual Qualification Contract":
1. `ScanResult.environmentalScore?` — optional, degrades gracefully when carbon data is missing
2. `ClassificationResult.environmentalScore?` — same contract at the service layer
3. `classifyFoodWithReasons()` imports and calls `computeEnvironmentalScore` for non-RED results
4. RED-override paths (occult sugars, trans fats) skip environmental scoring — no point scoring unsafe food

No changes to ScannerView, ScannerContainer, or MockScannerAdapter.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/infrastructure/ml/types.ts` | Modified | `ScanResult` gains optional `environmentalScore` |
| `src/features/nutritional-traffic-light/services/classificationService.ts` | Modified | `ClassificationResult` gains optional `environmentalScore`; `classifyFoodWithReasons` calls `computeEnvironmentalScore` |
| `src/features/nutritional-traffic-light/services/classificationService.test.ts` | Modified | 3 new H4 tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Environmental score on RED foods is meaningless | Low | Already skipped — RED paths return early before scoring |

## Rollback Plan

1. Revert `environmentalScore?` field from `ClassificationResult` and `ScanResult`
2. Remove `computeEnvironmentalScore` call from `classifyFoodWithReasons`
3. Remove 3 H4 test cases from test file
4. Restore original imports in classificationService

## Dependencies

- H3 (sustainability scoring core) — `computeEnvironmentalScore` must exist at `@shared/sustainability`

## Success Criteria

- [ ] `ScanResult` and `ClassificationResult` accept optional `environmentalScore` without breaking existing consumers
- [ ] `classifyFoodWithReasons` returns `environmentalScore` for foods with carbon data
- [ ] `classifyFoodWithReasons` returns `environmentalScore` with neutral carbon when data is missing
- [ ] Health-only classification (RED override paths) skip environmental scoring entirely
- [ ] All 3 H4 tests pass; existing 22 classification tests remain green
