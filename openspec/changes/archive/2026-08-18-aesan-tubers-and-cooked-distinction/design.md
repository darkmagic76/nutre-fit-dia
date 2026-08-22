# Technical Design: aesan-tubers-and-cooked-distinction

## 1. Architecture Approach

This change is **additive and non-breaking** across all Clean Architecture layers. No existing behavior is modified — only new values, entries, and a single conditional branch are introduced.

### Layer-by-layer impact

| Layer | Change | Rationale |
|---|---|---|
| **Domain** (`src/domain/`) | Extend `FoodCategory` enum, `FoodSchema` (optional `preparationState`), `RATION_LIMITS`, `AESAN_GRAM_STANDARDS`, `CountByCategory`, `validateFoodPortions()` | Core domain types grow by one enum value + one optional field. All defaults preserve backward compatibility. |
| **Application** (`src/application/`) | `planGenerator.ts`: add TUBERS to `getWeeklySlots()` | Plan generator distributes tuber slots across 2 days/week. |
| **Infrastructure** (`src/infrastructure/`) | `nudge/rules.ts`: add `TUBERS_EXCESS` system-action rule | Fires when weekly tuber count exceeds 5. |
| **Shared** (`src/shared/`) | `foods-data.ts`: 8 new catalog entries; i18n: `category.tubers` translations | Catalog data and UI labels. |
| **Feature** (`src/features/`) | `classificationService.ts`: add TUBERS → GREEN in `CATEGORY_DEFAULTS` | Traffic-light classification. |

### SRP compliance

Each file changes for exactly one reason:
- `foodCategory.ts` — enum definition
- `food.ts` — schema definition
- `rationValidator.ts` — validation rules and standards
- `foods-data.ts` — catalog data
- `classificationService.ts` — classification defaults
- `rules.ts` — nudge rule definitions
- `planGenerator.ts` — weekly slot distribution
- i18n files — translation keys

No file mixes concerns. No cross-layer dependencies are introduced.

---

## 2. File-by-File Changes

### 2.1 `src/domain/foodCategory.ts` (+2 lines)

**Change**: Add `TUBERS: 'tubers'` to `defineEnum()` call and `FoodCategorySchema` array.

```typescript
// In defineEnum():
TUBERS: 'tubers',  // after NUTS

// In FoodCategorySchema array:
'tubers',  // after 'nuts'
```

No changes to `ANIMAL_PROTEIN_CATEGORIES` (tubers are plant-based).

### 2.2 `src/domain/food.ts` (+1 line)

**Change**: Add optional `preparationState` field to `FoodSchema` with default `'as-stored'`.

```typescript
// After isSeasonal, before culturalMetadata:
/** Preparation state: 'as-stored' (dry/raw) or 'cooked' (ready-to-eat). Default 'as-stored'. */
preparationState: z.enum(['as-stored', 'cooked']).default('as-stored'),
```

This is an additive, non-breaking change. All 39 existing foods default to `'as-stored'` automatically via Zod's `.default()`.

### 2.3 `src/domain/rationValidator.ts` (+18 lines)

**Changes**:

1. **`RATION_LIMITS`** — add TUBERS entry:
   ```typescript
   [FoodCategory.TUBERS]: {
     max: 5,
     unit: 'week',
   },
   ```

2. **`CountByCategory`** — add TUBERS field:
   ```typescript
   [FoodCategory.TUBERS]: number;
   ```

3. **`defaultRationCounts()`** — add TUBERS:
   ```typescript
   [FoodCategory.TUBERS]: 0,
   ```

4. **`AESAN_GRAM_STANDARDS`** — add TUBERS:
   ```typescript
   [FoodCategory.TUBERS]: { min: 150, max: 200 },
   ```

5. **`validateFoodPortions()`** — skip gram validation for cooked entries:
   ```typescript
   // At the top of the for loop, before the standard lookup:
   if (food.preparationState === 'cooked') continue;
   ```

6. **`validateWeeklyRations()`** — add TUBERS to `weeklyCategories`:
   ```typescript
   const weeklyCategories: FoodCategoryType[] = [
     FoodCategory.LEGUMES,
     FoodCategory.FISH,
     FoodCategory.EGGS,
     FoodCategory.WHITE_MEAT,
     FoodCategory.RED_MEAT,
     FoodCategory.NUTS,
     FoodCategory.TUBERS,  // ← new
   ];
   ```

### 2.4 `src/shared/data/foods-data.ts` (+120 lines)

**Change**: Append 8 new food entries after the NUTS block.

**Tubers** (3 entries, `preparationState` defaults to `'as-stored'`):

| ID | Name | gramsPerRation | kcalPer100g | protein | carbs | fiber | fat | CO2 | seasonal |
|---|---|---|---|---|---|---|---|---|---|
| `tuber-patata` | Patata | 175 | 77 | 2.0 | 17 | 2.2 | 0.1 | 0.3 | true |
| `tuber-boniato` | Boniato | 175 | 86 | 1.6 | 20 | 3.0 | 0.1 | 0.4 | true |
| `tuber-name` | Ñame | 175 | 118 | 1.5 | 28 | 4.1 | 0.2 | 0.5 | true |

**Cooked legumes** (3 entries, `preparationState: 'cooked'`):

| ID | Name | gramsPerRation | kcalPer100g | protein | carbs | fiber | fat | CO2 | seasonal |
|---|---|---|---|---|---|---|---|---|---|
| `legume-lentejas-cocido` | Lentejas cocidas | 150 | 93 | 6.5 | 14 | 5.0 | 0.5 | 0.8 | true |
| `legume-garbanzos-cocido` | Garbanzos cocidos | 150 | 120 | 7.0 | 17 | 5.5 | 2.0 | 0.8 | true |
| `legume-alubias-cocido` | Alubias cocidas | 150 | 95 | 6.0 | 15 | 5.5 | 0.5 | 0.8 | true |

**Cooked cereals** (2 entries, `preparationState: 'cooked'`):

| ID | Name | gramsPerRation | kcalPer100g | protein | carbs | fiber | fat | CO2 | seasonal |
|---|---|---|---|---|---|---|---|---|---|
| `cereal-arroz-integral-cocido` | Arroz integral cocido | 180 | 123 | 2.7 | 26 | 1.8 | 1.0 | 2.7 | true |
| `cereal-pasta-integral-cocida` | Pasta integral cocida | 180 | 124 | 4.5 | 26 | 3.5 | 0.6 | 1.2 | true |

Nutritional values are approximate cooked-weight data from AESAN 2022 / BEDCA tables.

### 2.5 `src/shared/i18n/types.ts` (+1 line)

**Change**: Add `'category.tubers': string` to the `Translations` interface.

```typescript
'category.tubers': string;  // after 'category.nuts'
```

### 2.6 `src/shared/i18n/es.ts` (+1 line)

**Change**: Add Spanish translation.

```typescript
'category.tubers': 'Tubérculos',
```

### 2.7 `src/shared/i18n/en.ts` (+1 line)

**Change**: Add English translation.

```typescript
'category.tubers': 'Tubers',
```

### 2.8 `src/features/nutritional-traffic-light/services/classificationService.ts` (+1 line)

**Change**: Add TUBERS to `CATEGORY_DEFAULTS`.

```typescript
[FoodCategory.TUBERS]: TrafficLightColor.GREEN,  // unprocessed whole foods
```

### 2.9 `src/infrastructure/nudge/rules.ts` (+18 lines)

**Change**: Add `TUBERS_EXCESS` rule after the NUTS block.

```typescript
// ─── TUBERS: AESAN 2022 (tubérculos, consumo moderado) ───

{
  id: 'TUBERS_EXCESS',
  type: NotificationType.SYSTEM_ACTION,
  severity: NotificationSeverity.INFO,
  cooldown: COOLDOWN_24H,
  title: 'nudge.title.tubersExcess',
  body: 'nudge.body.tubersExcess',
  condition: (ctx) => ctx.counts[FoodCategory.TUBERS] > 5,
},
```

No deficit nudge — tubers have no minimum requirement ("consumo moderado").

### 2.10 `src/application/services/planGenerator.ts` (+5 lines)

**Change**: Add TUBERS slots to `getWeeklySlots()`.

```typescript
// After NUTS slots in rawSlots:
// Tubers: 2/week (consumo moderado) — Tue/Fri
{ day: 2, category: FoodCategory.TUBERS, rations: 1 },
{ day: 5, category: FoodCategory.TUBERS, rations: 1 },
```

---

## 3. Domain Model Changes

### FoodSchema extension

```typescript
preparationState: z.enum(['as-stored', 'cooked']).default('as-stored')
```

- **Type**: `'as-stored' | 'cooked'`
- **Default**: `'as-stored'` (applied automatically by Zod on parse)
- **Backward compatibility**: All 39 existing foods parse without the field and receive the default.
- **Forward compatibility**: The enum can be extended later (e.g., `'fried'`, `'baked'`) without breaking existing entries.

### FoodCategory enum extension

One new value: `TUBERS = 'tubers'`

The `FoodCategorySchema` Zod enum must be updated in lockstep. The `defineEnum()` helper ensures type-level and runtime-level consistency.

### Validation logic change

`validateFoodPortions()` gains a single early-exit:

```typescript
if (food.preparationState === 'cooked') continue;
```

This is placed **before** the `AESAN_GRAM_STANDARDS` lookup, so cooked entries are never checked against dry-weight standards. This eliminates the need for a parallel `AESAN_COOKED_GRAM_STANDARDS` map or per-category cooked ranges.

**Why this approach over cooked-weight standards**:
1. Cooked weights vary by cooking method, water absorption, and recipe — there is no single AESAN standard for "cooked legumes."
2. The `preparationState` field marks entries as "physical equivalence, not clinical standard."
3. Adding cooked ranges to `AESAN_GRAM_STANDARDS` would couple validation to preparation state, violating SRP.
4. The skip is explicit, auditable, and has zero impact on existing foods.

---

## 4. Catalog Structure

### New entries summary

| Category | Count | IDs | preparationState |
|---|---|---|---|
| TUBERS | 3 | `tuber-patata`, `tuber-boniato`, `tuber-name` | `'as-stored'` (default) |
| LEGUMES | 3 | `legume-lentejas-cocido`, `legume-garbanzos-cocido`, `legume-alubias-cocido` | `'cooked'` |
| CEREAIS | 2 | `cereal-arroz-integral-cocido`, `cereal-pasta-integral-cocida` | `'cooked'` |

**Total catalog**: 39 → 47 entries.

### Ration counting behavior

Both dry and cooked entries of the same food count as **1 ration** in the same category. This is correct per AESAN — the recommendation is "4+ rations/week of legumes" regardless of preparation. `countRations()` increments by 1 per entry, no branching on `preparationState`.

### Plan generator preference

`pickSustainableFood()` filters by `!f.isProcessed`. None of the new entries have `isProcessed: true`, so all are eligible for auto-plan assignment. The planner will naturally prefer dry entries (lower carbon footprint, higher sustainability score) over cooked entries because cooked entries have higher water content and thus lower kcal density, which affects the environmental score calculation.

---

## 5. Test Strategy (TDD: RED → GREEN → REFACTOR)

### Test file locations

| File | Tests |
|---|---|
| `src/domain/foodCategory.test.ts` | TUBERS enum value, schema parse/reject |
| `src/domain/food.test.ts` | `preparationState` default, valid/invalid values |
| `src/domain/rationValidator.test.ts` | TUBERS in limits/standards/counts, weekly validation, portion skip for cooked |
| `src/shared/data/foods.test.ts` (or inline in existing food tests) | New catalog entries exist with correct values |
| `src/features/nutritional-traffic-light/services/classificationService.test.ts` | TUBERS classifies as GREEN |
| `src/infrastructure/nudge/rules.test.ts` | TUBERS_EXCESS fires at >5, does not fire at ≤5 |
| `src/application/services/planGenerator.test.ts` | TUBERS slots in weekly plan, food assignment |

### Test order (RED → GREEN)

1. **RED**: `foodCategory.test.ts` — test `FoodCategory.TUBERS === 'tubers'`, schema accepts `'tubers'`, rejects `'tuber'`
2. **GREEN**: Add TUBERS to enum + schema
3. **RED**: `food.test.ts` — test `preparationState` defaults to `'as-stored'`, accepts `'cooked'`, rejects `'raw'`
4. **GREEN**: Add `preparationState` to FoodSchema
5. **RED**: `rationValidator.test.ts` — test TUBERS in `RATION_LIMITS`, `AESAN_GRAM_STANDARDS`, `CountByCategory`, `defaultRationCounts()`
6. **GREEN**: Add TUBERS to all structures in rationValidator.ts
7. **RED**: `rationValidator.test.ts` — test `validateFoodPortions()` skips cooked entries, validates as-stored
8. **GREEN**: Add early-exit in `validateFoodPortions()`
9. **RED**: `rationValidator.test.ts` — test `validateWeeklyRations()` includes TUBERS (6 → over, 5 → valid, 0 → valid)
10. **GREEN**: Add TUBERS to `weeklyCategories`
11. **RED**: `foods-data.ts` tests — verify 8 new entries exist with correct values
12. **GREEN**: Add catalog entries
13. **RED**: `classificationService.test.ts` — test TUBERS → GREEN
14. **GREEN**: Add TUBERS to `CATEGORY_DEFAULTS`
15. **RED**: `rules.test.ts` — test TUBERS_EXCESS condition
16. **GREEN**: Add TUBERS_EXCESS rule
17. **RED**: `planGenerator.test.ts` — test TUBERS slots in weekly plan
18. **GREEN**: Add TUBERS to `getWeeklySlots()`
19. **REFACTOR**: Run full test suite, verify coverage thresholds, clean up any duplication

### Non-regression tests

After all new tests pass, run the full existing suite (`pnpm test:run`) to verify:
- All 39 existing foods unchanged
- All existing tests pass without modification
- Coverage thresholds met (statements 80%, branches 80%, functions 100%, lines 80%)

---

## 6. Migration Plan

### Zero migration required

This change is **purely additive**:
- `preparationState` has a default value → existing foods parse without modification
- `TUBERS` is a new enum value → no existing food references it
- No persisted schema changes (all data is in-memory)
- No localStorage key changes
- No database migration

### Rollback

Simply revert the commit(s). No data migration needed because:
- No user data references TUBERS category (it didn't exist before)
- No user data references `preparationState` (it defaults to `'as-stored'`)
- All changes are in code, not persisted state

---

## 7. Risk Mitigation

### Risk 1: Cooked entries bypass gram validation entirely

**Mitigation**: The `preparationState === 'cooked'` skip is explicit and documented. Cooked entries are still validated by the FoodSchema (all required fields present, positive numbers, etc.). Only the AESAN gram-range check is skipped, which is correct because AESAN standards are defined for dry/raw weights.

### Risk 2: `preparationState` field proliferates into consumers that don't need it

**Mitigation**: The field is only consumed by `validateFoodPortions()`. No other module reads it. `countRations()`, `validateRations()`, `validateWeeklyRations()`, `classifyFood()`, and `pickSustainableFood()` all operate on `category` and `isProcessed` — they are unaffected.

### Risk 3: Plan generator assigns cooked entries to weekly plans

**Mitigation**: `pickSustainableFood()` ranks by environmental score. Cooked entries have higher water content and lower kcal density, resulting in lower sustainability scores. Dry entries will be preferred. Even if a cooked entry is selected, it counts as 1 ration correctly.

### Risk 4: TypeScript compilation fails due to missing TUBERS in Record types

**Mitigation**: `RATION_LIMITS`, `AESAN_GRAM_STANDARDS`, `CountByCategory`, and `CATEGORY_DEFAULTS` are all `Record<FoodCategory, ...>` types. Adding TUBERS to the enum makes these Records incomplete until TUBERS is added to each one. TypeScript will catch this at compile time — the build will fail if any Record is missing the TUBERS key. This is a **compile-time safety net**, not a runtime risk.

### Risk 5: i18n type mismatch

**Mitigation**: The `Translations` interface is updated first. TypeScript will enforce that both `es.ts` and `en.ts` include `'category.tubers'`. The build fails if either is missing.

---

## 8. Estimated Impact

| File | Lines changed | Type |
|---|---|---|
| `src/domain/foodCategory.ts` | +2 | Domain enum |
| `src/domain/food.ts` | +1 | Domain schema |
| `src/domain/rationValidator.ts` | +18 | Domain validation |
| `src/shared/data/foods-data.ts` | +120 | Catalog data |
| `src/shared/i18n/types.ts` | +1 | i18n types |
| `src/shared/i18n/es.ts` | +1 | i18n Spanish |
| `src/shared/i18n/en.ts` | +1 | i18n English |
| `src/features/.../classificationService.ts` | +1 | Classification |
| `src/infrastructure/nudge/rules.ts` | +18 | Nudge rules |
| `src/application/services/planGenerator.ts` | +5 | Plan generation |
| **Tests** (6-7 files) | ~180 | TDD tests |
| **Total** | **~348** | |

---

## 9. Verification Checklist

Before considering this change complete:

- [ ] `FoodCategory.TUBERS` exists and equals `'tubers'`
- [ ] `FoodSchema.parse()` accepts `{ category: 'tubers', ... }`
- [ ] `FoodSchema.parse()` rejects `{ category: 'tuber', ... }`
- [ ] `RATION_LIMITS[FoodCategory.TUBERS]` = `{ max: 5, unit: 'week' }`
- [ ] `AESAN_GRAM_STANDARDS[FoodCategory.TUBERS]` = `{ min: 150, max: 200 }`
- [ ] `CountByCategory` has `[FoodCategory.TUBERS]: number`
- [ ] `defaultRationCounts()[FoodCategory.TUBERS]` = `0`
- [ ] `validateFoodPortions()` skips entries with `preparationState: 'cooked'`
- [ ] `validateFoodPortions()` validates entries with `preparationState: 'as-stored'`
- [ ] `validateWeeklyRations()` includes TUBERS (6 → over, 5 → valid, 0 → valid)
- [ ] 3 tuber foods exist in catalog with correct values
- [ ] 3 cooked legume foods exist with `preparationState: 'cooked'`
- [ ] 2 cooked cereal foods exist with `preparationState: 'cooked'`
- [ ] `CATEGORY_DEFAULTS[FoodCategory.TUBERS]` = `TrafficLightColor.GREEN`
- [ ] `TUBERS_EXCESS` nudge rule exists and fires at >5/week
- [ ] `getWeeklySlots()` includes 2 TUBERS slots on different days
- [ ] `'category.tubers'` = `'Tubérculos'` (ES) and `'Tubers'` (EN)
- [ ] `pnpm test:run` passes with coverage thresholds
- [ ] `pnpm quality` passes (format + lint + typecheck + test)
- [ ] `pnpm build` passes (tsc -b + vite build)
