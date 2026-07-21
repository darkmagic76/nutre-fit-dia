# food-category-red-meat Specification

## Purpose

Canonical `RED_MEAT` as the 11th `FoodCategory` group, correcting the semantic knot where ADR-007, ADR-008, and SPECS_TECH §4 reference RED_MEAT but the canonical model (ADR-005) only defines WHITE_MEAT.

**ADR**: ADR-005 amendment (11th group with EAT-Lancet clinical justification)

## Requirements

### Requirement: Enum and Schema

The system MUST add `RED_MEAT: 'red_meat'` to the `FoodCategory` const object. The `FoodCategorySchema` Zod enum MUST include `'red_meat'`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Enum exists | source code | accessing `FoodCategory.RED_MEAT` | value is `'red_meat'` |
| Zod validates | a food with `category: 'red_meat'` | `FoodCategorySchema.parse` | passes without error |
| TypeScript type includes | `type FoodCategory` | checking for `'red_meat'` | member exists in union |
| Existing test compiles | `engine.test.ts:71` references `FoodCategory.RED_MEAT` | compiler runs | no TS error |

### Requirement: Display Name

The system MUST add `[FoodCategory.RED_MEAT]: 'Carne roja'` to `CATEGORY_DISPLAY_NAMES`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Spanish label | category RED_MEAT | reading `CATEGORY_DISPLAY_NAMES` | returns `'Carne roja'` |

### Requirement: Animal Protein Counter

The system MUST add `FoodCategory.RED_MEAT` to `ANIMAL_PROTEIN_CATEGORIES`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Counted as animal protein | `counts[RED_MEAT] = 2, counts[EGGS] = 1` | `ANIMAL_PROTEIN_CATEGORIES.reduce()` | total is 3 |
| DAIRY_CALCIUM_NUDGE fires | `animalProteinCount > 2` with RED_MEAT items | condition evaluated | returns true |

### Requirement: Food Catalog

The system MUST add 3 red meat foods: ternera (CF 27), cerdo (CF 7.5), cordero (CF 24). Chorizo (id `proc-embutido-chorizo`) MUST be reclassified from `WHITE_MEAT` to `RED_MEAT`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| New foods exist | catalog loaded | `foods.filter(f => f.category === FoodCategory.RED_MEAT)` | returns ≥ 3 items |
| Ternera footprint | ternera | reading `carbonFootprint` | is 27 |
| Chorizo reclassified | catalog loaded | `foods.find(f => f.id === 'proc-embutido-chorizo')` | `category === FoodCategory.RED_MEAT` |
| Chorizo preserves metadata | chorizo reclassified | reading all fields except category | all existing fields preserved; only `category` changed from `WHITE_MEAT` to `RED_MEAT` |

### Requirement: CountByCategory Integration

The `CountByCategory` interface and `emptyCounts()` factory in `rationValidator.ts` MUST include RED_MEAT with default value 0. `countRations()` MUST increment RED_MEAT counts.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Default zero | `emptyCounts()` | reading `[FoodCategory.RED_MEAT]` | returns 0 |
| Counts red meat | entries with 2 red meat foods | `countRations(entries)` | `result[FoodCategory.RED_MEAT] === 2` |
| Backward compat | code iterates `Object.entries(counts)` | RED_MEAT key exists | no runtime error |
