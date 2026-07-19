# Tasks: M1 — Sustainable Food Substitution

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200–250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Substitution service + tests + barrel export | PR 1 | Single PR; base = main |

## Phase 1: TDD — Write Tests First (RED)

- [x] 1.1 Write "white meat triggers substitution" — `suggestAlternative(pollo)` returns non-empty
- [x] 1.2 Write "high-carbon non-meat triggers" — dairy CF=5.0 returns alternatives
- [x] 1.3 Write "low-carbon food returns empty" — legumes CF=0.8 returns []
- [x] 1.4 Write "no carbon data returns empty" — cereals without CF returns []
- [x] 1.5 Write "only legumes and blue fish returned" — assert every result category
- [x] 1.6 Write "white fish excluded" — bacalao/merluza not in results
- [x] 1.7 Write "returns top 3 by score" — 5+ candidates yields ≤ 3 items
- [x] 1.8 Write "results sorted descending" — verify score order
- [x] 1.9 Write "missing alternatives returns []" — empty mocked catalog

## Phase 2: Implement Substitution Service (GREEN)

- [x] 2.1 Create `substitutionService.ts` — `suggestAlternative(food): Food[]` with `BLUE_FISH_IDS` and `isTriggerFood` helper
- [x] 2.2 Implement trigger gate: `category === 'white_meat'` OR `carbonFootprint >= 4.0`
- [x] 2.3 Implement candidate filter: LEGUMES + blue fish (FISH + BLUE_FISH_IDS), exclude self
- [x] 2.4 Implement ranking: map via `computeEnvironmentalScore()`, sort `.score` DESC, slice top 3

## Phase 3: Barrel Export + Quality Gate

- [x] 3.1 Add `suggestAlternative` export to `src/shared/sustainability/index.ts`
- [x] 3.2 Run `pnpm quality` — all tests green, no lint/type errors
