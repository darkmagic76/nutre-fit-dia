# Proposal: M4 — Zero-Waste Module

## Intent

SPECS_TECH and RNF-03 mandate labeling foods with "defectos estéticos" tags and prioritizing local/seasonal/unpackaged products. H3 added carbon/seasonal data but lacks explicit zero-waste and ugly-produce flags. M4 adds these as informational UI badges to educate users and promote sustainable food choices.

## Scope

### In Scope
- Add `isUglyProduce: boolean` (default false) to `FoodSchema`
- Add `isZeroWaste: boolean` (default false) to `FoodSchema`
- Populate flags in `foods-data.ts` (~6-8 items tagged)
- Add badge indicators in `PlanView` (zero-waste + ugly-produce) and `ScannerView` (zero-waste only)
- Schema tests + badge rendering tests

### Out of Scope
- Changes to `computeEnvironmentalScore()` or ranking logic — flags are V1 informational only
- Scanner qualification (no isZeroWaste/isUglyProduce in `ClassificationResult`)
- Filtering or sorting by these flags
- Nudge rules based on these flags

## Capabilities

### New Capabilities
- `zero-waste-badges`: Visual badge indicators for isUglyProduce and isZeroWaste flags rendered in PlanView and ScannerView food cards

### Modified Capabilities
- None — flags are informational; no existing spec requirements change

## Approach

1. Add two fields to `FoodSchema` in `src/shared/domain/food.ts` with `.default(false)`
2. Tag relevant catalog items in `src/shared/data/foods-data.ts` (vegetables with cosmetic defects → isUglyProduce; local/seasonal/unpackaged → isZeroWaste)
3. Create a shared `ZeroWasteBadges` component in `src/shared/ui/` (used by 2+ features) rendering emoji + text labels
4. Integrate badges into `PlanView.tsx` (beside existing `CulturalBadges`) and `ScannerView.tsx` (on food detail)
5. Write unit tests: schema defaults, flag population, badge rendering

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/domain/food.ts` | Modified | Add `isUglyProduce`, `isZeroWaste` to schema |
| `src/shared/data/foods-data.ts` | Modified | Tag ~6-8 items with new flags |
| `src/shared/ui/ZeroWasteBadges.tsx` | **New** | Badge component for zero-waste indicators |
| `src/features/recipe-engine/PlanView.tsx` | Modified | Render ZeroWasteBadges on food entries |
| `src/features/nutritional-traffic-light/ScannerView.tsx` | Modified | Render ZeroWasteBadges on selected food |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Flag overlap with existing `isSeasonal` | Low | Document `isZeroWaste` = seasonal AND local AND unpackaged (superset of `isSeasonal`) |
| Scope creep into scoring changes | Low | Explicit out-of-scope in proposal; enforce at spec phase |

## Rollback Plan

Remove two fields from `FoodSchema`, delete `ZeroWasteBadges.tsx`, revert tag changes in `foods-data.ts`, and remove badge JSX from `PlanView.tsx` and `ScannerView.tsx`.

## Dependencies

- H3 (Sustainability Scoring) — `isSeasonal` and catalog data already exist

## Success Criteria

- [ ] Schema defaults: new fields default to `false` on existing foods
- [ ] Tagged foods show correct badges in PlanView and ScannerView
- [ ] All existing tests remain green (340+)
