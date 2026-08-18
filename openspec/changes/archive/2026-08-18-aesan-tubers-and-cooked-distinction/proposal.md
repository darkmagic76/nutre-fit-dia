# Proposal: aesan-tubers-and-cooked-distinction

## Intent

Close the AESAN 2022 compliance gap: the report explicitly includes **tubers** ("tubérculos") as a distinct food group with its own ration recommendation (150–200 g/ration, "consumo moderado"), and distinguishes between **dry weight** (legumes 50–60 g en seco, cereals 40–60 g pan / 60–80 g seco pasta/arroz) and **cooked weight** for planning accuracy. Neither concept exists in the current domain model.

## Problem

The system currently has 12 food categories (`FoodCategory`) and 39 catalog entries. Two AESAN 2022 requirements are unmet:

1. **No TUBERS category** — potatoes, sweet potatoes, and yam are absent from the domain entirely. AESAN assigns them a weekly moderate-consumption limit (150–200 g/ration) that cannot be enforced without a dedicated category.

2. **No dry/cooked distinction** — legumes and cereals are catalogued only in their dry form (e.g. `gramsPerRation: 60` for dry lentils). AESAN recommends cooked portions (~150 g for legumes, ~180 g for cereals) for meal planning and user-facing display. The single `gramsPerRation` field cannot represent both states, forcing the UI to show dry weights when users are cooking with cooked food.

## Scope

### In scope

- Add `TUBERS` to the `FoodCategory` enum, Zod schema, and all dependent structures.
- Define `RATION_LIMITS[TUBERS]` and `AESAN_GRAM_STANDARDS[TUBERS]` per AESAN 2022 values.
- Add tuber foods to the catalog (patata, boniato/batata, ñame).
- Add cooked-weight catalog entries for legumes (lentejas-cocido, garbanzos-cocido, alubias-cocido) and cereals (arroz-integral-cocido, pasta-integral-cocida) — **separate entries**, not a `preparationState` field.
- Update `CountByCategory`, `defaultRationCounts()`, and weekly/daily validation to include `TUBERS`.
- Add `category.tubers` to i18n types and both `es`/`en` translation dictionaries.
- Add `TUBERS` to `CATEGORY_DEFAULTS` in the traffic-light classification service.
- Add tuber-specific nudge rules (deficit/excess) to the NudgeEngine.
- Update `getWeeklySlots()` in the plan generator to include tuber slots.
- Tests for all modified modules (TDD: RED → GREEN → REFACTOR).

### Out of scope

- Adding a `preparationState` field to the `Food` schema (rejected — see Alternatives).
- Modifying the `Food` domain model structure beyond adding new catalog entries.
- Changes to the barcode scanner or external food lookup.
- Migration of existing user data (no schema change to persisted structures).

## Approach

**Hybrid: new category + separate catalog entries.**

### TUBERS category

| Constant | Value | Rationale |
|---|---|---|
| `RATION_LIMITS[TUBERS]` | `{ max: 5, unit: 'week' }` | "Consumo moderado" — no daily minimum, weekly cap |
| `AESAN_GRAM_STANDARDS[TUBERS]` | `{ min: 150, max: 200 }` | AESAN 2022 pág. 52 tuber portion range |
| Traffic-light default | `GREEN` | Tubers are unprocessed whole foods |
| Weekly plan slots | 2 days/week (e.g. days 2, 5) | Moderate frequency consistent with "consumo moderado" |

### Catalog entries (new foods added to `foods-data.ts`)

**Tubers** (raw, as-stored):

| ID | Name (ES) | gramsPerRation | kcal/100g |
|---|---|---|---|
| `tuber-patata` | Patata | 175 | 77 |
| `tuber-boniato` | Boniato | 175 | 86 |
| `tuber-name` | Ñame | 175 | 118 |

**Legume cooked variants** (ready-to-eat, ~150 g cooked ≈ 50–60 g dry):

| ID | Name (ES) | gramsPerRation | kcal/100g |
|---|---|---|---|
| `legume-lentejas-cocido` | Lentejas cocidas | 150 | 93 |
| `legume-garbanzos-cocido` | Garbanzos cocidos | 150 | 120 |
| `legume-alubias-cocido` | Alubias cocidas | 150 | 95 |

**Cereal cooked variants** (ready-to-eat, ~180 g cooked ≈ 60–70 g dry):

| ID | Name (ES) | gramsPerRation | kcal/100g |
|---|---|---|---|
| `cereal-arroz-integral-cocido` | Arroz integral cocido | 180 | 123 |
| `cereal-pasta-integral-cocida` | Pasta integral cocida | 180 | 124 |

### Why separate entries, not `preparationState`

Counting rations (`CountByCategory`) is **per-entry, not per-gram**. Both a dry lentil entry and a cooked lentil entry count as 1 ration of `LEGUMES`. This is correct per AESAN — the recommendation is "4+ rations/week" regardless of preparation. A `preparationState` field would add schema complexity, require migration logic, and force every consumer of `Food` to branch on state. Separate entries keep the schema unchanged and make each entry self-contained with its own nutritional profile.

### Key design decisions

1. **Ration counting stays unchanged** — `countRations()` increments by 1 per food entry regardless of dry/cooked. Both variants of the same food count as 1 ration in the same category.

2. **Gram validation uses category standards** — `validateFoodPortions()` checks `gramsPerRation` against `AESAN_GRAM_STANDARDS[category]`. Cooked entries have higher `gramsPerRation` values that fall within the same category range (legumes 50–60 g dry → cooked entries need a separate standard or the cooked entries use cooked-weight ranges). **Risk**: the current `AESAN_GRAM_STANDARDS[LEGUMES]` is `{ min: 50, max: 60 }` (dry weight). Cooked legumes at 150 g would fail validation. **Mitigation**: cooked entries will use a `preparationState`-aware standard OR we extend `AESAN_GRAM_STANDARDS` with cooked ranges. See risk section below.

3. **Plan generator prefers dry entries for planning** — when auto-generating a weekly plan, the generator should prefer dry-weight entries (the canonical AESAN reference). Cooked entries are available for manual log entry when users track what they actually ate.

## Impact

### Files affected (estimated)

| File | Change | Est. lines |
|---|---|---|
| `src/domain/foodCategory.ts` | Add `TUBERS` to enum + schema | +4 |
| `src/domain/rationValidator.ts` | Add TUBERS to limits, standards, CountByCategory, defaultRationCounts, weekly categories | +15 |
| `src/shared/data/foods-data.ts` | Add 8 new food entries (3 tubers + 3 legume cooked + 2 cereal cooked) | +120 |
| `src/shared/i18n/types.ts` | Add `category.tubers` + nudge keys | +8 |
| `src/shared/i18n/es.ts` | Add Spanish translations | +10 |
| `src/shared/i18n/en.ts` | Add English translations | +10 |
| `src/infrastructure/nudge/rules.ts` | Add tuber deficit/excess rules | +30 |
| `src/features/nutritional-traffic-light/services/classificationService.ts` | Add TUBERS to CATEGORY_DEFAULTS | +2 |
| `src/application/services/planGenerator.ts` | Add TUBERS to getWeeklySlots() | +5 |
| **Tests** (all above) | TDD: new tests for category, validation, classification, nudges, plan | ~150 |
| **Total** | | **~354 lines** |

### Risk level: **LOW–MEDIUM**

- **LOW**: Adding a new enum value + catalog entries is additive, non-breaking.
- **MEDIUM**: Cooked-weight gram validation conflict — `AESAN_GRAM_STANDARDS[LEGUMES]` = {50, 60} (dry) vs cooked entries at 150 g. This requires either (a) a cooked-weight standard per category, or (b) cooked entries using a different validation path. **Recommendation**: extend `AESAN_GRAM_STANDARDS` to support cooked ranges via a `cookedMin`/`cookedMax` optional field, or create a `AESAN_COOKED_GRAM_STANDARDS` parallel map.

## Alternatives Considered

### A. `preparationState` field on `Food`

Add `preparationState?: 'dry' | 'cooked'` to the Food schema and adjust validation/gram standards based on state.

**Rejected because**:
- Schema migration cost: every Food consumer must handle the optional field.
- `CountByCategory` already works correctly (1 entry = 1 ration regardless of state).
- Nutritional profiles differ significantly between dry and cooked (water absorption changes kcal/100g, macros). Separate entries capture this naturally.
- Violates the project's principle of keeping the Food model minimal and immutable.

### B. Merge tubers into VEGETABLES

AESAN groups tubers near vegetables in some tables. We could reuse the VEGETABLES category.

**Rejected because**:
- AESAN 2022 gives tubers a **distinct** ration recommendation (150–200 g, moderate weekly consumption) that differs from vegetables (3+/day, no upper limit).
- Merging would make it impossible to enforce the weekly tuber cap independently.
- Ubiquitous language: the expert says "tubérculos" as a separate group.

### C. Dynamic gram conversion (dry → cooked multiplier)

Store only dry entries and compute cooked weight at runtime using a multiplier (e.g. 2.5× for legumes).

**Rejected because**:
- Multipliers vary by food and cooking method (boiled vs steamed vs pressure-cooked).
- Adds runtime complexity and a hidden conversion layer that obscures the actual nutritional data.
- Users log what they eat (cooked), not what they started with (dry).

## Rollback Plan

1. Revert the git commit(s) containing this change.
2. No database migration or persisted schema change — all changes are in-memory domain model and catalog data.
3. If tuber foods were logged by users before rollback, those entries would reference a now-invalid category. **Mitigation**: the rollback should be done before any production deployment with user data. If user data exists, a one-time migration script would be needed to reassign tuber entries to VEGETABLES (temporary fallback).

## Success Criteria

1. ✅ `FoodCategory.TUBERS` exists and is recognized by the Zod schema.
2. ✅ 3+ tuber foods are in the catalog with correct AESAN gram ranges (150–200 g).
3. ✅ Cooked variants of legumes and cereals exist with realistic cooked-weight nutritional data.
4. ✅ `validateRations()` and `validateWeeklyRations()` include TUBERS in their checks.
5. ✅ `validateFoodPortions()` accepts cooked-weight entries without false-positive alerts.
6. ✅ Traffic-light classification assigns GREEN to tuber foods by default.
7. ✅ NudgeEngine fires appropriate nudges when tuber intake exceeds 5/week.
8. ✅ Plan generator includes tuber slots in the weekly plan.
9. ✅ i18n displays "Tubérculos" (ES) / "Tubers" (EN) in category labels.
10. ✅ All tests pass (`pnpm test:run`) with coverage thresholds met.
11. ✅ `pnpm quality` (format + lint + typecheck + test) passes green.
