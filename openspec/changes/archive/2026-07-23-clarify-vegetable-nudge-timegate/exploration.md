## Exploration: Vegetable Deficit Nudge Time Gate Clarification

### Current State

The system has two independent evaluation paths for vegetable intake:

**1. Violation System** (`shared/services/rationValidator.ts`):
- Defines `RATION_LIMITS[FoodCategory.VEGETABLES]` with `min: 3` per day
- `validateRations()` runs on every store update, checks counts against limits, has NO time gate
- Produces `RationViolation[]` with messages like `"Hortalizas: 0 raciones (mín 3/día)"`
- Displayed in `DailyViolations.tsx` → `ViolationList.tsx` (shared/ui)

**2. Nudge System** (`shared/nudge/rules.ts`):
- `VEGETABLES_DEFICIT` rule checks TWO conditions (line 89-91):
  - `ctx.counts[FoodCategory.VEGETABLES] < VEGETABLE_MIN_RATIONS` (3)
  - `ctx.currentHour >= VEGETABLE_NUDGE_HOUR_THRESHOLD` (14 = 2PM)
- Both must be true for the nudge to fire
- Evaluated in `buildNudgeContext()` → `evaluateRules()` → `evaluateAndEnqueue()`
- The nudge is `BEHAVIORAL_NUDGE` with `INFO` severity, 6h cooldown

**THE GAP**:
- **Before 2PM**: User logs 0-2 vegetables → Violation shows in Daily Log BUT no nudge (condition false due to hour gate)
- **After 2PM**: Same deficit → Both violation AND nudge appear
- The user sees a violation with zero explanation for why the nudge is absent

### Affected Areas

- `src/shared/nudge/rules.ts:21` — `VEGETABLE_NUDGE_HOUR_THRESHOLD = 14` definition (line 21)
- `src/shared/nudge/rules.ts:89-91` — the two-condition check for VEGETABLES_DEFICIT
- `src/shared/nudge/types.ts:30` — `currentHour` in `NudgeContext`
- `src/shared/nudge/engine.ts:47` — `currentHour` derived from `new Date().getHours()`
- `src/features/med-diet-validator/components/DailyViolations.tsx` — violation display component (needs modification)
- `src/features/med-diet-validator/DailyLogView.tsx` — parent container (may pass extra props)
- `src/features/med-diet-validator/MedDietValidatorContainer.tsx` — top container (may need to pass currentHour)
- `src/shared/i18n/en.ts`, `es.ts`, `types.ts` — new translation keys needed
- `src/features/med-diet-validator/components/DailyViolations.test.tsx` — tests for new behavior
- `src/shared/nudge/index.ts` — may need to re-export `VEGETABLE_NUDGE_HOUR_THRESHOLD`

### Approaches

1. **A: Augment DailyViolations with conditional time-gate info** (recommended)
   - Detect vegetable deficit violation in the list, check if currentHour < 14, show an info hint
   - Pros: Directly contextual — user sees explanation right next to the violation; single component change; minimal DOM impact
   - Cons: DailyViolations gains awareness of time and nudge internals; need to filter violations by category to find vegetable deficits; slight coupling between validation UI and nudge domain
   - Effort: Low (~15-20 lines + i18n keys + tests)

2. **B: Standalone "nudge status" component in DailyLogView**
   - New component like `VegetableNudgeStatus` that checks: vegetable deficit exists AND before 2PM → shows info banner
   - Pros: Clean separation; no pollution of DailyViolations; easy to extend to other nudge types later
   - Cons: New file; user has to scan another area of the UI to find the explanation; more components to reason about
   - Effort: Medium (~30-40 lines + new component + i18n + tests)

3. **C: Tooltip on the vegetable deficit violation item**
   - Add a tooltip/expandable hint on the specific violation line for vegetables
   - Pros: Minimal visual footprint; doesn't add permanent UI noise
   - Cons: Tooltips are less accessible (hover-dependent); information is hidden by default; user might not discover it
   - Effort: Medium (~25-35 lines + i18n + tooltip component or aria-describedby)

### Recommendation

**Approach A** — It places the explanation exactly where the user is looking (right at the violation). The user sees "Hortalizas: 0 raciones (mín 3/día)" and right below it, a subtle info line explaining "The recommendation nudge will appear after 2 PM — you still have time to include vegetables in your meals."

Implementation sketch:
- `DailyViolations` receives an optional `currentHour` prop (or computes it internally via `new Date().getHours()`)
- After rendering the error `ViolationList`, check if any violation targets `category === 'vegetables'` with `direction === 'under'`
- If found AND `currentHour < 14`, render a small info paragraph below the violation list
- Import `VEGETABLE_NUDGE_HOUR_THRESHOLD` from `@shared/nudge` (need to export it from `index.ts`)

### Risks
- Time-gate coupling: `DailyViolations` would import nudge domain. Mitigation: export the constant from `shared/nudge/index.ts` — the constant is a business rule, not engine logic.
- Hardcoded hour check in UI: If the threshold changes, the UI stays in sync via the imported constant. No risk if we import, only if we hardcode `14` in JSX.
- i18n gap: Must add keys to both `en.ts` and `es.ts` + update `types.ts`. Forgetting `es.ts` breaks Spanish users silently (falls back to English key name).

### Ready for Proposal
Yes — the exploration is complete. Ready for `sdd-propose`.

### i18n Keys Needed

**New keys** (in en.ts, es.ts, types.ts):
- `'log.vegetableNudgeAfternoon'`: "The vegetable recommendation will appear after 2 PM." / "El aviso de hortalizas aparecerá después de las 14 hs."

### Estimated Changed Lines

| File | Change | Lines |
|------|--------|-------|
| `shared/nudge/index.ts` | Export `VEGETABLE_NUDGE_HOUR_THRESHOLD` | +1 |
| `DailyViolations.tsx` | Add time-gate info logic | +10 |
| `DailyViolations.test.tsx` | Add test cases | +20 |
| `shared/i18n/en.ts` | Add key | +2 |
| `shared/i18n/es.ts` | Add key | +2 |
| `shared/i18n/types.ts` | Add key type | +1 |
| **Total** | | **~36** |
