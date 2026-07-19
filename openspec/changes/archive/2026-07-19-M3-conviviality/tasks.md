# Tasks: M3 — Convivialidad (Social Eating & Cooking Technique Labels)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~20 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

Not needed — single PR under 50 lines.

## Phase 1: TDD — RED Tests

- [x] 1.1 Add test in `PlanView.test.tsx`: `socialEating=true` renders "Ideal para comer en compañía"
- [x] 1.2 Add test in `PlanView.test.tsx`: `cookingTechnique='stew'` renders "Preparación: guiso tradicional"

## Phase 2: TDD — GREEN Implementation

- [x] 2.1 Add `COOKING_LABELS: Record<string, string>` const in `PlanView.tsx` mapping `stew→"guiso tradicional"`, `steam→"al vapor"`, `boiled→"hervido"`, `grilled→"a la plancha"`, `raw→"en crudo"`
- [x] 2.2 Extend `CulturalBadges` JSX in `PlanView.tsx` with conditional `<span>` for `socialEating` text ("Ideal para comer en compañía")
- [x] 2.3 Extend `CulturalBadges` JSX in `PlanView.tsx` with conditional `<span>` for `cookingTechnique` label ("Preparación: {COOKING_LABELS[...]}")

## Phase 3: Quality Gate

- [x] 3.1 Run `pnpm quality` — lint, typecheck, and tests (existing 332 + 3 new) pass
