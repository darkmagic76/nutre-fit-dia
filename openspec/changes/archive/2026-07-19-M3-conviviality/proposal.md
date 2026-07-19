# Proposal: M3 — Convivialidad (Companion Eating & Cooking Techniques)

## Intent

RNF-02 mandates promoting social eating (UNESCO value) and simple cooking techniques (steam/boiled/stew). H5 added `CulturalMetadataSchema` with `socialEating` + `cookingTechnique` fields and emoji badges. M3 extends the UI to show textual Spanish suggestions alongside badges, making UNESCO values explicit and actionable at a glance.

## Scope

### In Scope
- `COOKING_LABELS` constant map — Spanish labels per technique (e.g., `stew` → `"guiso tradicional"`)
- `CulturalBadges` extended with textual suggestion spans below the emoji row
- 2 new tests: textual suggestion rendering, cooking technique label

### Out of Scope
- Cooking technique filtering or sorting in plan view
- Social eating planning features (group meal sizing, invitations)
- New domain types or schema changes

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `cultural-metadata`: badge rendering requirement extends — emoji badges remain, textual suggestions added below them when `socialEating` or `cookingTechnique` are present

## Approach

1. Add `COOKING_LABELS: Record<string, string>` constant inside `PlanView.tsx` mapping `steam`, `boiled`, `grilled`, `raw`, `stew` to Spanish labels (`"al vapor"`, `"hervido"`, `"a la plancha"`, `"crudo"`, `"guiso tradicional"`)
2. Extend `CulturalBadges` to render a `<span className="text-xs text-stone-500 block">` below the emoji row: `"Ideal para comer en compañía"` when `socialEating === true`, and `"Preparación: {COOKING_LABELS[cookingTechnique]}"` when `cookingTechnique` is set
3. Update `PlanView.test.tsx` — 1 test asserting "Ideal para comer en compañía" renders for lentejas, 1 test asserting "Preparación: guiso tradicional" renders

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/recipe-engine/PlanView.tsx` | Modified | Add `COOKING_LABELS`, extend `CulturalBadges` |
| `src/features/recipe-engine/PlanView.test.tsx` | Modified | Add 2 textual suggestion tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Label text change requires i18n later | Low | Hardcode Spanish now — app is single-locale; extract when needed |
| Cooking technique label overlap on narrow screens | Low | Use `text-xs` + `block` layout; verified in responsive context |

## Rollback Plan

Revert changes to `PlanView.tsx` and `PlanView.test.tsx`. No other files touched — full rollback in 2 files.

## Dependencies

- None (builds on H5 `cultural-metadata` capability already shipped)

## Success Criteria

- [ ] Foods with `socialEating: true` display "Ideal para comer en compañía" text
- [ ] Foods with `cookingTechnique` display "Preparación: {label}" with correct technique name
- [ ] Existing emoji badge behavior and aria-labels are preserved
- [ ] Foods without `culturalMetadata` show no suggestion text
- [ ] 2 new tests pass in `pnpm test:run`
