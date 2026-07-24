# Tasks: Clarify Vegetable Deficit Nudge Time Gate

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~60 (7 files) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | single-pr |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Export constant + add i18n keys + implement 2 conditional messages + tests | Single PR | All 60 lines; well under review budget. No chaining needed. |

---

## Phase 1: RED — Write Failing Tests

- [ ] 1.1 `src/shared/nudge/rules.ts:21`: Change `const VEGETABLE_NUDGE_HOUR_THRESHOLD` → `export const`
- [ ] 1.2 `src/shared/nudge/index.ts`: Re-export `VEGETABLE_NUDGE_HOUR_THRESHOLD` in barrel
- [ ] 1.3 `src/features/med-diet-validator/components/DailyViolations.tsx`: Add optional `currentHour?: number` to `DailyViolationsProps` (default `new Date().getHours()`)
- [ ] 1.4 `DailyViolations.test.tsx`: Write test — Message A visible when vegetable deficit + `currentHour={11}` (< 14), `hasFoods=true`
- [ ] 1.5 `DailyViolations.test.tsx`: Write test — Message B visible when vegetable deficit + `currentHour={14}` (≥ 14), `hasFoods=true`
- [ ] 1.6 `DailyViolations.test.tsx`: Write test — neither Message A nor B when no vegetable deficit, `currentHour={10}`, `hasFoods=true`
- [ ] 1.7 Run `pnpm test:run -- DailyViolations` → **MUST FAIL** (no messages rendered yet)

## Phase 2: GREEN — Minimum Implementation

- [ ] 2.1 `src/shared/i18n/types.ts`: Add `'violations.vegetableNudge.before2pm': string` and `'violations.vegetableNudge.after2pm': string`
- [ ] 2.2 `src/shared/i18n/es.ts`: Add ES translations for both keys (before2pm: "Los recordatorios de hortalizas se activan a partir de las 14:00. Aún tienes tiempo de incluir verduras en tu comida.", after2pm: "Tienes déficit de hortalizas. El recordatorio se ha registrado en tu historial de nudges.")
- [ ] 2.3 `src/shared/i18n/en.ts`: Add EN translations for both keys (before2pm: "Vegetable reminders activate from 2PM onward. You still have time to include vegetables at lunch.", after2pm: "You have a vegetable deficit. The reminder has been logged in your nudge history.")
- [ ] 2.4 `DailyViolations.tsx`: Implement `vegetableDeficit = violations.some(v => v.category === 'vegetables' && v.direction === 'under')`
- [ ] 2.5 `DailyViolations.tsx`: Implement conditional rendering — `if (vegetableDeficit)` → `currentHour < 14` ? Message A : Message B — both with `role="status"`, after the existing `!validation.valid` block
- [ ] 2.6 Run `pnpm test:run -- DailyViolations` → **MUST PASS**

## Phase 3: REFACTOR — Validate

- [ ] 3.1 AAA validation: each test has clear Arrange (fixtures), Act (render), Assert (screen queries)
- [ ] 3.2 Scope Rule verification: `VEGETABLE_NUDGE_HOUR_THRESHOLD` imported from `@shared/nudge` in test and component — no duplicated `14`
- [ ] 3.3 ARIA: both info paragraphs use `role="status"`, screen-reader-compatible
- [ ] 3.4 Run `pnpm test:run` — full suite green, zero regressions
