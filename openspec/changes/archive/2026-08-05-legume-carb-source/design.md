# Design: Legume as Carbohydrate Source Nudge

## Technical Approach

Purely additive, data-driven rule addition — zero engine or infrastructure changes. Follows the exact `CEREALS_DEFICIT` pattern: define a `SafetyRule` object, insert into `NUDGE_RULES`, add i18n keys. The nudge engine already iterates all rules; no new evaluation logic required.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Cooldown | `COOLDOWN_6H` (6 hours) | 12h, 24h | Matches `CEREALS_DEFICIT` — rule is informational/low-severity, and 6h strikes balance between education value and non-intrusiveness |
| Rule position | After `CEREALS_DEFICIT` | After LEGUMES_GLYCEMIC_BASE, at end of array | Semantic grouping: both rules concern cereal intake. Co-firing is a feature, and grouping them aids readability |
| Condition | Strict `<` for cereals | `<=` | Per spec, fires only when below minimum. Boundary `cereals=3` is the clinical threshold — at or above it means no deficit |
| i18n strategy | Static string keys in `types.ts` | Dynamic keys or parameterized templates | Body is static educational text, not dynamic like `SUSTAINABLE_SUBSTITUTION`. Simpler is better |

## Data Flow

```
User adds food → DailyLog updates counts → NudgeEngine.evaluateRules()
    │
    ├── ctx.counts[LEGUMES] > 0  ──┐
    ├── ctx.counts[CEREALS] < 3   ──┤──→ LEGUME_CARB_SOURCE fires (INFO)
    │                                │
    ├── ctx.counts[CEREALS] < 3   ──┤──→ CEREALS_DEFICIT fires (INFO)
    │                                │
    └── Both appear in nudge panel ──┘  (co-firing — complementary)
```

## File Changes

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `src/shared/nudge/rules.ts` | Modify | +10 | Add `LEGUME_CARB_SOURCE` rule entry after `CEREALS_DEFICIT` (line 49). Zero import changes — all needed symbols already imported |
| `src/features/nudge-engine/rules.test.ts` | Modify | +25 | Add `describe('LEGUME_CARB_SOURCE')` block with 3 tests following existing pattern |
| `src/shared/i18n/types.ts` | Modify | +4 | Add 2 keys (`nudge.title.legumeCarbSource`, `nudge.body.legumeCarbSource`) + update comment `(17 rules)` → `(18 rules)` |
| `src/shared/i18n/es.ts` | Modify | +2 | Spanish copy — neutral/professional register |
| `src/shared/i18n/en.ts` | Modify | +2 | English copy — interface parity |

**Total: 5 files, ~43 lines net new**

## Rule Implementation

Insert after CEREALS_DEFICIT `id` block (after line 49 closing `},`):

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
},
```

All symbols (`NotificationType`, `NotificationSeverity`, `FoodCategory`, `CEREAL_MIN_RATIONS`, `COOLDOWN_6H`) are already imported at the top of the file. No import changes needed.

## i18n Copy

### Spanish (es.ts)

```ts
'nudge.title.legumeCarbSource': 'Las legumbres también aportan hidratos de carbono',
'nudge.body.legumeCarbSource':
  'Has consumido legumbres hoy. Las legumbres son una fuente de hidratos de carbono de digestión más lenta y menor índice glucémico que los cereales refinados. Pueden ayudarte a completar tu ingesta de cereales.',
```

### English (en.ts)

```ts
'nudge.title.legumeCarbSource': 'Legumes are also a source of carbohydrates',
'nudge.body.legumeCarbSource':
  "You've eaten legumes today. Legumes provide slower-digesting carbohydrates with a lower glycemic index than refined cereals. They can help complement your cereal intake.",
```

## Types Update

In `types.ts`, add under the Nudge rule titles section:

```ts
'nudge.title.legumeCarbSource': string;
```

And under the Nudge rule bodies (static) section:

```ts
'nudge.body.legumeCarbSource': string;
```

Update comment: `// Nudge rule titles (17 rules)` → `// Nudge rule titles (18 rules)`

## Test Plan

3 unit tests in `describe('LEGUME_CARB_SOURCE')`, following the existing `describe` block pattern:

| # | Test | GIVEN | WHEN | THEN |
|---|------|-------|------|------|
| 1 | Fires with legumes > 0 and cereals < 3 | `counts[LEGUMES]=1`, `counts[CEREALS]=2` | `rule.condition(ctx)` | `true` |
| 2 | Does NOT fire with no legumes | `counts[LEGUMES]=0`, `counts[CEREALS]=1` | `rule.condition(ctx)` | `false` |
| 3 | Does NOT fire at cereal boundary | `counts[LEGUMES]=1`, `counts[CEREALS]=3` | `rule.condition(ctx)` | `false` |

### Spec Coverage

| Scenario | Test # | Status |
|----------|--------|--------|
| Fires when legumes present, cereals below minimum | #1 | Covered |
| Does NOT fire when no legumes consumed | #2 | Covered |
| Does NOT fire at exact cereal minimum boundary | #3 | Covered |
| Co-fires with CEREALS_DEFICIT | Verified by engine test suite | Existing coverage |
| Cooldown respected | Verified by engine test suite | Existing coverage |
| i18n keys resolve in both locales | Compile-time enforced by `Translations` interface | Type-safe |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | 3 condition tests | `describe('LEGUME_CARB_SOURCE')` in `rules.test.ts` |
| Type-safety | i18n key existence | `Translations` interface enforces both locales at compile time |
| Regression | All 17 existing rules | `pnpm test:run` — must pass unchanged |

**No integration or E2E tests needed** — the nudge engine and panel already handle generic rule evaluation and rendering.

## Migration / Rollout

No migration required. Feature is purely additive — new rule activates immediately in engine evaluation loop. Rollback: remove 1 rule entry, 4 i18n lines.

## Open Questions

None. All design decisions resolved. Ready for implementation.
