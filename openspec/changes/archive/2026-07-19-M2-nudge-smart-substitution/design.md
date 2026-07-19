# Design: M2 — Nudge: Inteligente Substitution

## Technical Approach

Extend `buildNudgeContext(food?)` to compute `environmentalScore` (via `computeEnvironmentalScore`) and `alternatives` (via `suggestAlternative`) from an optional scanned food. Add `SUSTAINABLE_SUBSTITUTION` rule to `NUDGE_RULES` that fires when `score < 30 && alternatives.length > 0`. Wire `ScannerContainer.handleClassify` to pass `selected` food through the pipeline. Zero new dependencies — both services already exist in `@shared/sustainability`. All existing 14 rules unchanged, all context fields backward compatible.

## Architecture Decisions

| # | Decision | Options | Tradeoffs | Chosen |
|---|----------|---------|-----------|--------|
| 1 | Nullable type for new context fields | (a) `null` when no food / (b) always `[]` & `0` | (a) preserves semantics — callers know food was/wasn't passed; (b) simpler condition checks but loses info | **(a)** `number \| null` + `string[] \| null` — condition gates on `!== null` |
| 2 | Where to compute env score + alternatives | (a) inside `buildNudgeContext` / (b) in a new service | (a) keeps all context-building in one place, no new indirection; (b) over-engineering for 2 function calls | **(a)** inline calls in `buildNudgeContext` — follows existing pattern where all context is composed in one function |
| 3 | Cooldown duration | 4h vs 12h vs 24h | Same as ADHERENCE_GLUCOSE/WEIGHT (4h) — sustainability is not safety-critical but re-scanning same food should be rate-limited | **4h** (`COOLDOWN_4H`) |
| 4 | Alternatives type (spec vs user discrepancy) | `null` vs `[]` for "no food" | Spec says `[]`, user says nullable. `null` expresses "not computed" vs `[]` for "computed but empty" | **`null`** when no food, **`[]`** when `suggestAlternative` returns empty (minor spec fix needed) |

## Data Flow

```
ScannerContainer.handleClassify(food)
  │
  ▼
evaluateAndEnqueue(food)          ← new optional param
  │
  ▼
buildNudgeContext(food)
  │  ├─ computeEnvironmentalScore(food) → ctx.environmentalScore
  │  └─ suggestAlternative(food)        → ctx.alternatives (food names[])
  │
  ▼
evaluateRules(ctx, NUDGE_RULES, cooldown)
  │  └─ SUSTAINABLE_SUBSTITUTION.condition(ctx)
  │       → score < 30 && has alternatives?
  │
  ▼
enqueue(notification)            ← body: "Considera alternativas... {alt1}, {alt2}"
cooldownTracker.register(ruleId)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `nudge-engine/types.ts` | Modify | Add `environmentalScore: number \| null` and `alternatives: string[] \| null` to `NudgeContext` |
| `nudge-engine/engine.ts` | Modify | `buildNudgeContext(food?: Food)` — compute new fields when food provided. `evaluateAndEnqueue(food?: Food)` — pass through |
| `nudge-engine/rules.ts` | Modify | Append `SUSTAINABLE_SUBSTITUTION` (BEHAVIORAL_NUDGE, COOLDOWN_4H) to `NUDGE_RULES` |
| `nudge-engine/rules.test.ts` | Modify | +4 test cases for the new rule condition (boundaries: score<30+alts, score≥30, no alts, low-carbon) |
| `nudge-engine/engine.test.ts` | Modify | Update all `NudgeContext` mocks with `environmentalScore: null` + `alternatives: null` |
| `nudge-engine/nudgeEngine.integration.test.ts` | Modify | Update all `NudgeContext` mocks with new nullable fields |
| `nutritional-traffic-light/ScannerContainer.tsx` | Modify | Change `evaluateAndEnqueue()` → `evaluateAndEnqueue(selected)` in `handleClassify` |

`nudge-engine/index.ts` — **no change** (exports unchanged, both engine functions are already exported).

## Interfaces / Contracts

```typescript
// types.ts — added fields
export interface NudgeContext {
  // ... existing fields unchanged ...
  environmentalScore: number | null  // null when food not provided
  alternatives: string[] | null      // null when food not provided
}

// engine.ts — modified signatures
export function buildNudgeContext(food?: Food): NudgeContext
export function evaluateAndEnqueue(food?: Food): void
```

Rule body production: `alternatives.slice(0, 3).join(', ')` → "lentejas, garbanzos, caballa".

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit — rules | 4 new test cases: fires when score<30+alts; NOT when score≥30; NOT when no alts; NOT when low-carbon food (no trigger) | Pure condition tests, same pattern as existing 14 rules |
| Unit — engine | 2 new: buildNudgeContext(food) sets fields; buildNudgeContext() returns nulls | Mock store state + food fixture |
| Integration | Update all NudgeContext mocks with `environmentalScore: null` + `alternatives: null` | 3 existing mocks in engine.test.ts, 2 in integration test |
| E2E (manual) | Scan a high-carbon food → verify BEHAVIORAL_NUDGE appears | NudgePanel H7 already renders all nudges |

## Migration / Rollout

No migration required. The new fields are nullable and default to `null`, which is ignored by all existing rules. `buildNudgeContext()` callers (those not passing food) continue working identically. Only `ScannerContainer.handleClassify` changes its call; `handleAddToLog` stays unchanged (food is logged but already committed).

## Open Questions

- [ ] Spec says `alternatives: []` when food omitted — design uses `null` (user mandate). Reconcile in spec update.
- [ ] Should `handleAddToLog` also pass food? Logged foods could also trigger substitution — but proposal says "only on scan". Keeping as-is.
