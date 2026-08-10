# Design: Categoría NUTS (Frutos Secos)

## Arquitectura

### Capas Afectadas
```
domain/
  foodCategory.ts      → +NUTS al enum + schema
  clinical.ts          → +NUTS_MIN_WEEKLY, NUTS_MAX_DAILY
  rationValidator.ts   → +NUTS en RATION_LIMITS, AESAN_GRAM_STANDARDS, CountByCategory

shared/data/
  foods-data.ts        → +5 alimentos de frutos secos

shared/i18n/
  es.ts, en.ts         → +category.nuts + nudge keys

infrastructure/nudge/
  rules.ts             → +NUTS_DEFICIT, NUTS_EXCESS rules

features/nutritional-traffic-light/
  classificationService.ts → +NUTS → GREEN
```

## Decisiones de Diseño

### 1. Validación Dual (Semanal + Diaria)
NUTS es especial: tiene mínimo semanal (≥3/sem) Y máximo diario (≤1/día).

**Solución**:
- `RATION_LIMITS[NUTS] = { min: 3, unit: 'week' }` — sin max diario aquí
- `validateRations()` — agrega check separado: si `counts[NUTS] > NUTS_MAX_DAILY` → violation over
- `validateWeeklyRations()` — agrega NUTS a la lista de categorías semanales

Esto evita que el min semanal interfiera con el max diario.

### 2. NUTS NO es Animal Protein
No agregar a `ANIMAL_PROTEIN_CATEGORIES`. Los frutos secos son proteína vegetal.

### 3. Porción Estándar: 20-30g
AESAN 2022 define la ración de frutos secos como ~25g (un puñado pequeño).

### 4. Catálogo: Solo Crudos
V1 incluye solo frutos secos crudos, sin sal, sin azúcar. Procesados quedan fuera del scope.

## Testing Strategy
```
TDD Order:
1. Tests de dominio (rationValidator.test.ts) → RED
2. Implementar domain changes → GREEN
3. Tests de food schema (food.test.ts) → RED → GREEN
4. Tests de clasificación (classificationService.test.tsx) → RED → GREEN
5. Implementar classificationService → GREEN
6. Pipeline check → all green
```

## Migration Path
No hay migración — es una adición pura. Los datos existentes no se ven afectados.

## Rollback Plan
Si algo sale mal: revertir el commit. No hay side effects en datos existentes.
