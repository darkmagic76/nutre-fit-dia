# Exploration: LEGUME_CARB_SOURCE nudge rule

## Current State

Nudge rules are data-driven objects in `src/shared/nudge/rules.ts` (`NUDGE_RULES: SafetyRule[]`). Each rule declares `id`, `type`, `severity`, `cooldown`, `title`/`body` (i18n keys resolved at display time), and a pure `condition(ctx: NudgeContext)`. The engine (`evaluateRules`) iterates the array, evaluates conditions, respects cooldowns, and returns `NudgeEvaluation[]` — rules never read stores.

Two rules are directly relevant:

- **`CEREALS_DEFICIT`** (BEHAVIORAL_NUDGE, INFO, `COOLDOWN_6H`) fires when `ctx.counts[FoodCategory.CEREALS] < CEREAL_MIN_RATIONS` (3). It is a daily deficit nudge.
- **`LEGUMES_GLYCEMIC_BASE`** (SYSTEM_ACTION, INFO, `COOLDOWN_24H`) fires when `ctx.dayOfWeek >= LEGUMES_CHECK_DAY_THRESHOLD (4)` AND `ctx.counts[FoodCategory.LEGUMES] < LEGUMES_MIN_WEEKLY_CHECK (1)`. It is a **weekly** requirement nudge (≥4 servings/week per AESAN) and says nothing about cereal complement.

The proposed `LEGUME_CARB_SOURCE` sits between them: an **informational daily nudge** that fires when legumes were eaten today (`counts[LEGUMES] > 0`) while cereal minimum is unmet (`counts[CEREALS] < CEREAL_MIN_RATIONS`), teaching that legumes are slow-digesting carbohydrates that complement cereal intake.

`NudgeContext` already exposes both needed inputs via `counts: CountByCategory` — **no context changes required**.

### Source authority (verified in `INFORME_RECOMENDACIONES_DIETETICAS.md`)

- Cereals section (~L1360-1370): "Algunas de estas raciones [de cereales] pueden ser sustituidas por el consumo de legumbres, para completar la ingesta de hidratos de carbono."
- Potatoes section (~L430-436): "otros grupos de alimentos son capaces de proporcionar hidratos de carbono con menor índice glucémico, de digestión más lenta, como son los cereales enteros y las legumbres."

## Affected Areas

- `src/shared/nudge/rules.ts` — add new `SafetyRule` entry to `NUDGE_RULES` (semantically next to `CEREALS_DEFICIT`). No import changes needed beyond what exists (`CEREAL_MIN_RATIONS`, `FoodCategory` already imported).
- `src/features/nudge-engine/rules.test.ts` — add `describe('LEGUME_CARB_SOURCE')` block following the existing `makeContext` + boundary pattern (existing describe blocks, e.g. `CEREALS_RESTRICTION`, are the template).
- `src/shared/i18n/types.ts` — add `nudge.title.legumeCarbSource` and `nudge.body.legumeCarbSource` to the `Translations` interface (TS enforces both en/es); update stale comment "Nudge rule titles (17 rules)" → 18.
- `src/shared/i18n/es.ts` — add both keys (UI is Spanish).
- `src/shared/i18n/en.ts` — add both keys (interface requires parity).
- `openspec/changes/legume-carb-source/specs/nudge-engine/spec.md` — delta spec for the sdd-spec phase (nudge-engine domain exists at `openspec/specs/nudge-engine/`).
- **Not affected**: `src/shared/constants/clinical.ts` (reuses `CEREAL_MIN_RATIONS`; no new constant warranted), `src/shared/nudge/types.ts` (context unchanged), nudge engine (`engine.ts`) — rules are data-driven.

## Approaches

1. **Data-driven rule in `NUDGE_RULES` (recommended)** — Add a rule object with static i18n keys and condition `ctx.counts[FoodCategory.LEGUMES] > 0 && ctx.counts[FoodCategory.CEREALS] < CEREAL_MIN_RATIONS`. Type `BEHAVIORAL_NUDGE`, severity `INFO`, cooldown `COOLDOWN_6H` (mirrors `CEREALS_DEFICIT`; `COOLDOWN_12H`/`24H` are valid alternatives if lower frequency is preferred for purely educational content).
   - Pros: Follows the established data-driven pattern exactly; zero engine/context changes; independently testable; independently dismissable/cooldown-managed.
   - Cons: None material.
   - Effort: Low.

2. **Extend `CEREALS_DEFICIT` body dynamically** — Make `body` a function that conditionally appends the legume-complement message when `counts[LEGUMES] > 0`.
   - Pros: One less rule; message appears only when both conditions hold.
   - Cons: Conflates two distinct messages (deficit alert + education) into one rule; breaks single-responsibility of rules; couples the new behavior to the existing rule's cooldown/dismissal lifecycle; complicates existing tests.
   - Effort: Low-Medium.

3. **New `NudgeContext` flag (e.g. `hasLegumesToday`)** — Add field to context + builder logic.
   - Pros: Explicit semantic name.
   - Cons: `counts[LEGUMES]` is already available and used by `LEGUMES_GLYCEMIC_BASE`; adding a redundant flag means touching `types.ts` + `buildNudgeContext` for no added capability. Violates the "add only what's needed" discipline.
   - Effort: Low but unnecessary.

## Recommendation

**Approach 1** — a new data-driven rule `LEGUME_CARB_SOURCE`:

```ts
{
  id: 'LEGUME_CARB_SOURCE',
  type: NotificationType.BEHAVIORAL_NUDGE,
  severity: NotificationSeverity.INFO,
  cooldown: COOLDOWN_6H,
  title: 'nudge.title.legumeCarbSource',
  body: 'nudge.body.legumeCarbSource',
  condition: (ctx) =>
    ctx.counts[FoodCategory.LEGUMES] > 0 &&
    ctx.counts[FoodCategory.CEREALS] < CEREAL_MIN_RATIONS,
}
```

- No new clinical constants (reuses `CEREAL_MIN_RATIONS = 3`).
- i18n keys follow the existing camelCase rule-id convention: `legumeCarbSource` (like `cerealsDeficit`, `legumesGlycemicBase`).
- Educational copy (Spanish UI, English codebase): title ≈ "Las legumbres también cuentan" / body citing both AESAN quotes (legumes as slow-digesting carb source that can substitute cereal rations).
- It fires *alongside* `CEREALS_DEFICIT` by design — complementary education, not duplication. Document this coexistence in the delta spec.

## Risks

- **Co-firing with `CEREALS_DEFICIT`**: when cereals < 3 and legumes > 0, both nudges appear. The engine already supports multi-match evaluations (see `REQ-NUDGE-EVALUATE` "Multiple match" scenario), so this is safe; the spec must state they are complementary so future maintainers don't "fix" it into a conflict.
- **Boundary semantics**: condition must use `LEGUMES > 0` (strict) and `CEREALS < 3` (strict) — at exactly 3 cereal rations the minimum is met and the nudge must NOT fire. Tests must pin these boundaries.
- **i18n parity**: `Translations` is a single interface — both `es.ts` and `en.ts` must add the two keys or TypeScript fails. The "(17 rules)" comment in `types.ts` goes stale → update to 18.
- **Rule-placement consistency**: placing the rule near `CEREALS_DEFICIT` (semantic grouping) rather than near `LEGUMES_GLYCEMIC_BASE` is a stylistic choice; either is valid but the chosen placement should be deliberate and match the spec narrative.
- **No conflict with `LEGUMES_GLYCEMIC_BASE`**: that rule is weekly and day-gated (`dayOfWeek >= 4`, `legumes < 1`); this rule is daily and fires only when legumes were eaten. Complementary, not overlapping — but note `LEGUMES_GLYCEMIC_BASE`'s body mentions "≥4 raciones/semana"; the new copy must not contradict it.

## Ready for Proposal

**Yes.** The change is small, well-scoped, fully data-driven, and requires no engine or context changes. The orchestrator should tell the user: rule addition touches 5 files (rules.ts, rules.test.ts, 3 i18n files) + a delta spec; effort is Low; no new clinical constants are needed since the condition reuses `CEREAL_MIN_RATIONS`.
