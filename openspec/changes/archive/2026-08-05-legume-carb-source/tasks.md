# Tasks: Legume as Carbohydrate Source Nudge

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~25–30 (purely additive) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-always |
| Suggested work units | Single PR |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: RED — Write failing tests

- [x] 1.1 Add `describe('LEGUME_CARB_SOURCE')` block in `src/features/nudge-engine/rules.test.ts`, after the `LEGUMES_GLYCEMIC_BASE` describe block (currently ends ~line 206). Include: (a) find rule by `id === 'LEGUME_CARB_SOURCE'`, (b) fires when `LEGUMES=1` & `CEREALS=2`, (c) does NOT fire when `LEGUMES=0`, (d) does NOT fire at boundary `CEREALS=3`
- [x] 1.2 Run `pnpm test:run` — confirm **3 tests FAIL** (rule not yet in NUDGE_RULES)

## Phase 2: GREEN — Implement rule + i18n

- [x] 2.1 Add keys `nudge.title.legumeCarbSource` and `nudge.body.legumeCarbSource` to `Translations` interface in `src/shared/i18n/types.ts`. Update comment `(17 rules)` → `(18 rules)` in both Nudge rule titles and bodies sections
- [x] 2.2 Add Spanish copy to `src/shared/i18n/es.ts`: title `"Las legumbres también aportan hidratos de carbono"`, body per spec
- [x] 2.3 Add English copy to `src/shared/i18n/en.ts`: title `"Legumes are also a source of carbohydrates"`, body per spec
- [x] 2.4 Insert `{ id: 'LEGUME_CARB_SOURCE', type: BEHAVIORAL_NUDGE, severity: INFO, cooldown: COOLDOWN_6H, condition: ctx => ctx.counts[LEGUMES] > 0 && ctx.counts[CEREALS] < CEREAL_MIN_RATIONS }` into `NUDGE_RULES` in `src/shared/nudge/rules.ts`, after `CEREALS_DEFICIT` (after line 49 `},`)
- [x] 2.5 Run `pnpm test:run` — confirm **all 3 new tests pass**, all 731+ existing tests still pass, typecheck clean

## Phase 3: REFACTOR — Verify + clean up

- [x] 3.1 Run `pnpm quality` — confirm format:check, lint, typecheck, and full test suite pass with zero failures
- [x] 3.2 Verify no duplicate keys, no stale comments, no leftover debug code in any of the 5 touched files

## Verification Commands

```bash
# After Phase 1 — expect 3 failures
pnpm test:run -- src/features/nudge-engine/rules.test.ts

# After Phase 2 — expect all pass
pnpm test:run

# After Phase 3 — full quality gate
pnpm quality
```
