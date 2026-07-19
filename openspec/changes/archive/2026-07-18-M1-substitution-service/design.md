# Design: M1 — Sustainable Food Substitution

## Technical Approach

Pure function `suggestAlternative(food: Food): Food[]` in `shared/sustainability/substitutionService.ts`. Takes a high-carbon food, returns up to 3 protein-equivalent alternatives (LEGUMES + blue FISH) ranked by `computeEnvironmentalScore()` descending. Zero side effects — reads the in-memory food catalog, no store or API. Maps to spec requirements §Substitution Trigger, §Alternative Selection, §Ranking and Limit.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Module placement | `shared/sustainability/` vs `features/` | Scope Rule: used by NudgeEngine (M2) + Scanner UI → 2+ consumers → shared | `shared/sustainability/` |
| Catalog access | Direct import vs DI/injection | DI adds ceremony for V1; existing services use direct imports (scoringService, classificationService) | `import { foods } from '@shared/data/foods'` |
| Blue fish detection | Heuristic vs explicit ID map vs domain field | Domain field requires model change (out of scope); explicit map needs maintenance; heuristic is V1-simple | Explicit ID mapping `BLUE_FISH_IDS = ['fish-sardinas', 'fish-salmon']` validated by AESAN 2.4.2.1 |
| Trigger threshold | category-only vs category + carbonFootprint | Spec requires both: `white_meat` OR `carbonFootprint >= 4.0` (catches high-carbon dairy/processed) | Dual condition (per spec §Requirement 1) |

## Data Flow

```
suggestAlternative(food)
  │
  ├─ isTriggerFood(food)? ───No──→ return []
  │
  Yes
  │
  ├─ filter foods[]
  │   ├─ category = LEGUMES          → include
  │   ├─ category = FISH + id in BLUE_FISH_IDS → include (blue fish, per AESAN 2.4.2.1)
  │   └─ id === food.id              → exclude self
  │
  ├─ map: computeEnvironmentalScore().score
  ├─ sort: score DESC
  └─ slice: top 3 → return Food[]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/sustainability/substitutionService.ts` | Create | Core `suggestAlternative()` with trigger, filter, rank, slice |
| `src/shared/sustainability/substitutionService.test.ts` | Create | TDD: trigger, selection, ranking, edge cases, empty catalog |
| `src/shared/sustainability/index.ts` | Modify | Add `suggestAlternative` to barrel exports |

## Interfaces / Contracts

```typescript
// substitutionService.ts — exported API
function suggestAlternative(food: Food): Food[]
```

Input: `Food` (validated via Zod schema). Output: `Food[]` with max 3 items, sorted by environmental score descending. Empty array when no trigger or no candidates.

Internal helpers (not exported): `isTriggerFood(food)`, `isBlueFish(food)`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Trigger logic | WHITE_MEAT triggers, low-carbon returns [], missing CF returns [] |
| Unit | Blue fish filter | FISH in BLUE_FISH_IDS included, white fish (bacalao, merluza) excluded |
| Unit | Ranking & limit | Top 3 by score, descending order, 5+ candidates → 3 |
| Unit | Self-exclusion | Input food not in results |
| Unit | Empty catalog | Mock empty `foods` array → returns [] |
| Unit | High-carbon non-meat | `category='dairy', CF=5.0` triggers substitution |

Import `foods` from `@shared/data/foods` (mocked via `vi.mock`). Tests follow AAA pattern matching `scoringService.test.ts` style.

## Migration / Rollout

No migration required. Feature has zero downstream consumers (M2 NudgeEngine is future). Clean install: create two files, modify barrel export.

## Open Questions

- [x] Blue fish heuristic: Resolved — using explicit ID mapping `BLUE_FISH_IDS = ['fish-sardinas', 'fish-salmon']` validated by AESAN 2.4.2.1 (salmón = pescado azul). Replaces CF threshold.
