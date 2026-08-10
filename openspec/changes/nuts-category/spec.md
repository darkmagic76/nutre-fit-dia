# Spec: Categoría NUTS (Frutos Secos)

## Requisitos Funcionales

### FR-NUTS-1: Categoría de Dominio
- `FoodCategory.NUTS = 'nuts'` existe en el enum
- `FoodCategorySchema` valida `'nuts'` como categoría válida
- NUTS NO está en `ANIMAL_PROTEIN_CATEGORIES` (es proteína vegetal)

### FR-NUTS-2: Umbrales Clínicos
- `NUTS_MIN_WEEKLY = 3` (mínimo 3 raciones/semana)
- `NUTS_MAX_DAILY = 1` (máximo 1 ración/día)
- Fuente: AESAN 2022

### FR-NUTS-3: Límites de Ración
- `RATION_LIMITS[FoodCategory.NUTS] = { min: 3, unit: 'week' }`
- Validación semanal: < 3 → violation under
- Validación diaria: > 1 → violation over (max diario)

### FR-NUTS-4: Estándares de Porción
- `AESAN_GRAM_STANDARDS[FoodCategory.NUTS] = { min: 20, max: 30 }`
- Porción < 20g → warning
- Porción > 30g → critical alert

### FR-NUTS-5: Catálogo de Alimentos
- 5 frutos secos en `foods-data.ts`:
  - Almendras crudas (25g/ración, 575 kcal/100g)
  - Nueces (25g/ración, 650 kcal/100g)
  - Avellanas (25g/ración, 630 kcal/100g)
  - Anacardos (25g/ración, 550 kcal/100g)
  - Pistachos (25g/ración, 560 kcal/100g)
- Todos: sin sal, sin azúcar añadidos, sin procesar

### FR-NUTS-6: Nudge de Déficit Semanal
- ID: `NUTS_DEFICIT`
- Tipo: `BEHAVIORAL_NUDGE`
- Condición: `dayOfWeek >= 4 && counts[NUTS] < 3`
- Cooldown: 24h

### FR-NUTS-7: Nudge de Exceso Diario
- ID: `NUTS_EXCESS`
- Tipo: `SYSTEM_ACTION`
- Condición: `counts[NUTS] > 1`
- Cooldown: 12h

### FR-NUTS-8: Clasificación Semáforo
- `FoodCategory.NUTS → TrafficLightColor.GREEN` por defecto
- Frutos secos sin procesar son saludables

### FR-NUTS-9: i18n
- ES: `'category.nuts': 'Frutos secos'`
- EN: `'category.nuts': 'Nuts'`
- Nudge titles y bodies en ambos idiomas

## Escenarios de Test

### T-NUTS-1: Count Rations
- Dado 2 almendras + 1 nuez → `counts[NUTS] = 3`

### T-NUTS-2: Déficit Semanal
- Dado 2 frutos secos en la semana → violation under (min 3)
- Dado 3 frutos secos en la semana → no violation

### T-NUTS-3: Exceso Diario
- Dado 2 frutos secos en un día → violation over (max 1)
- Dado 1 fruto seco en un día → no violation

### T-NUTS-4: Gram Standards
- Dado 15g de almendras → warning (min 20g)
- Dado 35g de nueces → critical alert (max 30g)
- Dado 25g de avellanas → no alert

### T-NUTS-5: Traffic Light
- Almendras crudas → GREEN
- Almendras con azúcar añadida → RED (occult sugar)

### T-NUTS-6: Food Schema
- `FoodSchema.parse({ category: 'nuts', ... })` → válido
- `FoodCategory.NUTS` es categoría válida
