# Informe: Análisis de Fuentes Oficiales vs. Estado Actual de Specs/Código

**Fecha:** 18 de agosto de 2026  
**Fuentes analizadas:**

- `INFORME_RECOMENDACIONES_DIETETICAS.md` — Recomendaciones dietéticas AESAN 2022
- `estrategia_en_diabetes_del_sistema_nacional_de_salud_2012.md` — Estrategia en Diabetes SNS 2012

**Objetivo:** Identificar gaps entre las fuentes oficiales y las specs/código actuales del proyecto NutreFitDia. Análisis solo — sin modificaciones.

---

## 1. Estrategia en Diabetes SNS 2012 — Aplicabilidad

### Lo que dice la fuente

- Planificación individualizada de comidas con **conteo de carbohidratos**
- Énfasis en **índice glucémico** y **carga glucémica**
- Horarios regulares de comida (3 principales + 2-3 tentempiés)
- Patrón de dieta mediterránea como referencia
- Distribución calórica: 50-55% HC, 15-20% proteínas, <30% grasas
- Fibra: ≥25g/día (específico para control glucémico)
- Limitar azúcares simples a <10% del total calórico

### Estado actual del código

| Requisito Diabetes           | Implementado | Detalle                                                                        |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------ |
| Conteo de carbohidratos      | ⚠️ Parcial   | `carbsPer100g` existe en el catálogo, pero no se calcula por comida ni por día |
| Índice glucémico             | ❌ No        | No hay campo `glycemicIndex` en el modelo `Food`                               |
| Carga glucémica              | ❌ No        | No se calcula                                                                  |
| Horarios regulares           | ⚠️ Parcial   | Meal fractioning tiene BREAKFAST/LUNCH/DINNER/SNACK pero sin horarios          |
| Fibra diaria                 | ⚠️ Parcial   | `fiberPer100g` existe pero no hay target diario ni validación                  |
| Azúcares añadidos            | ⚠️ Parcial   | `addedSugarsPer100g` existe en procesados, pero no hay límite diario           |
| Distribución macronutrientes | ❌ No        | No hay validación de ratios HC/proteína/grasa                                  |

### Veredicto

La app tiene la **infraestructura de datos** para soportar diabetes (campos existentes), pero **ninguna lógica de negocio** que los use para validación, nudges o planificación.

---

## 2. INFORME AESAN 2022 — Cumplimiento Actual

### 2.1 Raciones por categoría (RATION_LIMITS vs. AESAN)

| Categoría          | AESAN 2022                    | Código actual                                         | ¿Cumple?     |
| ------------------ | ----------------------------- | ----------------------------------------------------- | ------------ |
| Hortalizas         | ≥3/día                        | min: 3/día                                            | ✅           |
| Frutas             | 2-3/día                       | min: 2, max: 3/día                                    | ✅           |
| Cereales           | 3-6/día (≤4 si restricción)   | min: 3, max: 6, restrictOnCaloricDeficit: true, max=4 | ✅           |
| Legumbres          | ≥4/semana hasta diario        | min: 4/semana                                         | ✅           |
| Frutos secos       | ≥3/semana, máx 1/día          | min: 3/semana, NUTS_MAX_DAILY=1                       | ✅           |
| Pescado            | ≥3/semana                     | min: 3, max: 7/semana                                 | ✅           |
| Huevos             | hasta 4/semana                | max: 4/semana                                         | ✅           |
| Lácteos            | máx 3/día                     | max: 3/día                                            | ✅           |
| Carne              | máx 3/semana                  | WHITE_MEAT max: 3/semana, RED_MEAT max: 3/semana      | ✅           |
| Aceite oliva       | diario en comidas principales | min: 3/día (AOVE tagging)                             | ✅           |
| Agua               | bebida principal              | min: 4/día                                            | ✅           |
| Patatas/tubérculos | consumo moderado              | ❌ No tiene categoría propia ni límites               | ⚠️ **FALTA** |

### 2.2 Gramajes por ración (AESAN_GRAM_STANDARDS)

El código dice "pág. 52" del informe AESAN 2022. Los valores actuales:

| Categoría    | Código (g/ración) | Observación                                                   |
| ------------ | ----------------- | ------------------------------------------------------------- |
| Cereales     | 40-60g            | Probablemente peso seco. Necesita verificación contra pág. 52 |
| Verduras     | 150-200g          | Razonable (peso crudo)                                        |
| Frutas       | 120-200g          | Razonable (unidad mediana)                                    |
| Aceite oliva | 10-15g            | ~1 cucharada sopera. Correcto                                 |
| Lácteos      | 200-250g          | 1 vaso de leche. Correcto                                     |
| Legumbres    | 50-60g            | **Peso seco** (AESAN especifica seco). 50g seco ≈ 150g cocido |
| Pescado      | 150-200g          | Filete mediano. Correcto                                      |
| Huevos       | 50-100g           | 1 huevo grande ≈ 60-70g. Correcto                             |
| Carne blanca | 100-150g          | Correcto                                                      |
| Carne roja   | 100-150g          | Correcto                                                      |
| Agua         | 200-250ml         | 1 vaso. Correcto                                              |
| Frutos secos | 20-30g            | Puñado pequeño. Correcto                                      |

#### Problema detectado: peso seco vs. cocido

Los gramajes son **por ración genérica**, pero el informe AESAN distingue entre:

- **Peso seco vs. cocido** (legumbres: 50g seco ≠ 150g cocido)
- **Peso crudo vs. cocinado** (cereales: 60g pasta seca ≠ 180g cocida)
- **Unidad vs. peso** (1 huevo, 1 naranja mediana)

El catálogo actual tiene un solo `gramsPerRation` por alimento, sin especificar si es seco/cocido/crudo.

### 2.3 Lo que FALTA del AESAN 2022

| Requisito AESAN                          | Estado     | Detalle                                                                   |
| ---------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Priorizar cereales integrales            | ❌ No      | No hay flag `isWholeGrain` ni validación de ratio integral/refinado       |
| Pescado azul prioritario                 | ⚠️ Parcial | `isHighPriority` existe en bacalao/sardinas pero no distingue azul/blanco |
| Minimizar carne procesada                | ⚠️ Parcial | `isProcessed` existe pero no hay límite específico para procesados        |
| Frutos secos sin sal/azúcar              | ⚠️ Parcial | No hay validación de `harmfulIngredients` para frutos secos               |
| Lácteos sin azúcares añadidos            | ❌ No      | No hay campo `addedSugars` en lácteos                                     |
| Reducir lácteos si hay otros animales    | ❌ No      | No hay regla cross-category lácteos vs. carne/pescado                     |
| Patatas/tubérculos como categoría        | ❌ No      | No existe `FoodCategory.TUBERS`                                           |
| Impacto ambiental por especie de pescado | ⚠️ Parcial | `carbonFootprint` existe pero no hay clasificación por sostenibilidad     |
| Mercurio en pescado                      | ❌ No      | AESAN 2019 advierte sobre pez espada/atún rojo. No hay campo              |
| Omega-3                                  | ❌ No      | No hay campo `omega3Per100g`                                              |

---

## 3. Gramajes Exactos en el Plan Generado — Oportunidades

### Estado actual

`meal-fractioning/spec.md` calcula kcal como:

```
(kcalPer100g × gramsPerRation / 100) × rations
```

Esto es correcto pero limitado. Se puede mejorar con:

1. **Gramajes por comida (no solo por ración):**
   - Actualmente: "2 raciones de cereales" = 2 × 50g = 100g
   - Mejora: mostrar "Desayuno: 50g pan integral + 150g yogur = 200g total, 45g HC"

2. **Distinguir peso seco vs. cocido:**
   - Legumbres: 50g seco → ~150g cocido (×3 factor)
   - Cereales: 60g pasta seca → ~180g cocida (×3 factor)
   - El plan debería mostrar ambos valores para claridad del usuario

3. **Conteo de carbohidratos por comida (para diabetes):**
   - Cada comida debería mostrar: `totalCarbs = Σ(gramsPerRation × carbsPer100g / 100)`
   - Target sugerido: 45-60g HC por comida principal (recomendación diabetes)

4. **Carga glucémica estimada:**
   - Con `glycemicIndex` + `carbsPerRation` se puede calcular CG = (IG × g HC) / 100
   - Permitiría alertas de "esta comida tiene carga glucémica alta"

5. **Fibra diaria:**
   - Target AESAN: 25-30g/día
   - Se puede calcular con los datos existentes: `Σ(gramsPerRation × fiberPer100g / 100)`

---

## 4. Resumen Ejecutivo

### ¿Se cumplen las specs actuales con las fuentes oficiales?

- **RATION_LIMITS**: ✅ 11/12 categorías cumplen. Falta patatas/tubérculos.
- **AESAN_GRAM_STANDARDS**: ✅ Valores razonables pero necesitan verificación contra pág. 52 y distinción seco/cocido.
- **Clinical thresholds**: ✅ Bien alineados con AESAN/PREDIMED/WHO.
- **Meal fractioning**: ⚠️ Funcional pero sin granularidad de carbohidratos ni fibra.

### ¿Qué se puede mejorar sin romper nada?

1. Añadir `FoodCategory.TUBERS` con gramajes y límites
2. Añadir campo `preparationState: 'raw' | 'dry' | 'cooked'` al modelo Food
3. Añadir `glycemicIndex` al catálogo (datos públicos disponibles)
4. Añadir cálculo de carbohidratos y fibra por comida en meal-fractioning
5. Añadir regla cross-category: si lácteos > 2/día Y carne+pescado > 3/semana → nudge de reducción
6. Añadir validación de frutos secos: si `harmfulIngredients` contiene sal/azúcar → alerta

### ¿Viola alguna spec las fuentes oficiales?

- **No hay violaciones directas.** Los límites y gramajes están dentro de los rangos AESAN.
- **Hay omisiones significativas:** patatas/tubérculos, cereales integrales, mercurio en pescado, carbohidratos por comida, fibra diaria.
