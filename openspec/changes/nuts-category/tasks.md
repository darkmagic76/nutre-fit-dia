# Tasks: Categoría NUTS (Frutos Secos)

## Tarea 1: Domain — FoodCategory enum + schema
**Archivos**: `src/domain/foodCategory.ts`
- Agregar `NUTS: 'nuts'` a `defineEnum()`
- Agregar `'nuts'` al array de `FoodCategorySchema`
- NO agregar a `ANIMAL_PROTEIN_CATEGORIES`

## Tarea 2: Domain — Clinical thresholds
**Archivos**: `src/domain/clinical.ts`
- Agregar `NUTS_MIN_WEEKLY = 3`
- Agregar `NUTS_MAX_DAILY = 1`

## Tarea 3: Domain — Ration validator + tests
**Archivos**: `src/domain/rationValidator.ts`, `src/domain/rationValidator.test.ts`
- Agregar NUTS a `RATION_LIMITS`: `{ min: 3, unit: 'week' }`
- Agregar NUTS a `AESAN_GRAM_STANDARDS`: `{ min: 20, max: 30 }`
- Agregar `[FoodCategory.NUTS]: number` a `CountByCategory`
- Agregar `[FoodCategory.NUTS]: 0` a `defaultRationCounts()`
- Agregar `FoodCategory.NUTS` a `validateWeeklyRations()` weekly categories list
- Agregar check max diario en `validateRations()`: si `counts[NUTS] > NUTS_MAX_DAILY` → violation
- Actualizar test `covers all 11` → `covers all 12`
- Agregar `NUTS: 3` a weekly balance tests

## Tarea 4: Data — Food catalog
**Archivos**: `src/shared/data/foods-data.ts`
- Agregar 5 frutos secos: almendras, nueces, avellanas, anacardos, pistachos
- Todos: raw, sin sal, sin azúcar, sin procesar, carbonFootprint ~1.2-2.0

## Tarea 5: i18n — Translations
**Archivos**: `src/shared/i18n/es.ts`, `src/shared/i18n/en.ts`
- `'category.nuts': 'Frutos secos'` / `'category.nuts': 'Nuts'`
- `'nudge.title.nutsDeficit'` + `'nudge.body.nutsDeficit'`
- `'nudge.title.nutsExcess'` + `'nudge.body.nutsExcess'`

## Tarea 6: Nudge — Rules
**Archivos**: `src/infrastructure/nudge/rules.ts`
- Agregar `NUTS_DEFICIT` rule (behavioral, weekly, cooldown 24h)
- Agregar `NUTS_EXCESS` rule (system action, daily, cooldown 12h)
- Importar `NUTS_MIN_WEEKLY`, `NUTS_MAX_DAILY` de clinical.ts

## Tarea 7: Feature — Traffic Light
**Archivos**: `src/features/nutritional-traffic-light/services/classificationService.ts`
- Agregar `[FoodCategory.NUTS]: TrafficLightColor.GREEN` a `CATEGORY_DEFAULTS`

## Tarea 8: Tests + Pipeline
**Archivos**: `src/domain/food.test.ts`, `src/features/nutritional-traffic-light/services/classificationService.test.tsx`
- Test que NUTS es categoría válida del schema
- Test que almendras crudas → GREEN
- `pnpm quality` → clean
- `pnpm test:run` → 816+ tests passing
- Coverage thresholds maintained
