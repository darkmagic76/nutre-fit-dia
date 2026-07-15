# ADR-005: Canonical FoodCategory — 10-Group Model

**Status:** Accepted  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

Three specification documents define food groups at different granularity levels:

| Source | Groups | Purpose |
|---|---|---|
| `INFORME_ADR.md` (FR-2) | 10 | Especificación funcional original — reglas clínicas detalladas por grupo |
| `SPECS_RF.md` | 5 | Vista condensada para UI de requisitos — omite lácteos, huevos, carnes blancas, agua, y fusiona hortalizas+frutas |
| `SPECS_TECH.md` (§5) | ~7 | Recupera agua y frutas separadas, pero no huevos, lácteos ni carnes blancas |

ADR-002 already established that `FoodCategory` must be a Zod-validated const object, but **never specified which model it encodes**. The `classificationService.ts` and `ErMedDietValidator` cannot be built correctly until this canonical model is fixed.

## Decision

**Adopt the 10-group model from INFORME_ADR as the canonical `FoodCategory`.** The SPECS_RF simplification is a UI-level derived view, not a domain model replacement.

### Canonical Groups

```ts
export const FoodCategory = {
  CEREALS:           'cereals',
  VEGETABLES:        'vegetables',
  FRUITS:            'fruits',
  OLIVE_OIL:         'olive_oil',
  DAIRY:             'dairy',
  LEGUMES:           'legumes',
  FISH:              'fish',
  EGGS:              'eggs',
  WHITE_MEAT:        'white_meat',
  WATER:             'water',
} as const

export type FoodCategory = (typeof FoodCategory)[keyof typeof FoodCategory]
```

### Justification — Clinical Rules per Group

Each group carries **irreducible clinical constraints** from INFORME_ADR that a collapsed model cannot enforce:

| Group | Constraint | Why it can't be collapsed |
|---|---|---|
| `CEREALS` | 3-6/día (máx 4 en restricción calórica) | Único grupo con regla condicional por IMC |
| `VEGETABLES` | ≥ 3/día + alerta 20:00h si deficitario | Regla temporal propia |
| `FRUITS` | 2-3/día + alerta por alta carga glucémica (uvas, higos, dátiles) | Regla de exclusión específica de especie |
| `OLIVE_OIL` | 3-6/día + tagging obligatorio en cada comida principal | Única grasa con requisito de tagging |
| `DAIRY` | Máx 3/día + nudge si Animal_Protein > 2 | Vinculado a contador de proteína animal |
| `LEGUMES` | 4/semana a diario + requisito base para control glucémico | Rol dual: proteína + fibra; pérdida clínica si se fusiona con proteína animal |
| `FISH` | ≥ 3/semana, alternar blanco/azul | Subclasificación por perfil lipídico (Omega-3) |
| `EGGS` | Máx 4/semana + alternativa preferente a carnes rojas | Frecuencia semanal distinta a carnes blancas |
| `WHITE_MEAT` | Máx 3/semana + limit si pescado excedido | Regla cruzada con `FISH` |
| `WATER` | 1.5-2L/día + nudge cada 3 horas | Grupo no calórico con tracking propio |

### Relationship to SPECS_RF (5-group model)

SPECS_RF groups are a **derived UI simplification**, not a domain replacement:

```
SPECS_RF view          ← Canonical groups
─────────────────         ─────────────────
Cereales              ← CEREALS
Hortalizas y Frutas   ← VEGETABLES + FRUITS (merged for UI display)
Grasas (AOVE)         ← OLIVE_OIL
Legumbres             ← LEGUMES
Pescado               ← FISH

Not represented in SPECS_RF (still canonical):
                       DAIRY, EGGS, WHITE_MEAT, WATER
```

When the UI needs a simplified view, map canonical groups to display groups. Never collapse the domain model to match the UI.

### Relationship to SPECS_TECH (7-group model)

SPECS_TECH §5 recovers `WATER` and separates `FRUITS` from `VEGETABLES`, confirming these distinctions are clinically meaningful. The remaining 3 absent groups (`DAIRY`, `EGGS`, `WHITE_MEAT`) from SPECS_TECH §5 are omissions of detail, not invalidations.

### AOVE — Dual Nature

`OLIVE_OIL` has **two conceptual roles** in the domain:
1. **Food group** (3-6 raciones/día): participates in ration counting
2. **Ingredient/tag** (obligatorio en cada comida principal): metadata on recipes

Both are modeled under the same `FoodCategory.OLIVE_OIL`. The tagging requirement is a rule in the recipe engine, not a second category.

### Subclassification (Future)

Some groups imply subtypes that future iterations will need:

- `FISH` → `{ white, blue }` (perfil Omega-3)
- `CEREALS` → `{ whole_grain, refined }` (aunque erMedDiet solo permite whole_grain)
- `FRUITS` → `{ high_gi, low_gi }` (uvas/higos/dátiles vs resto)

These are **not separate FoodCategory values**. They are sub-attributes on the `Food` entity. The canonical model stays at 10 groups.

## Consequences

- ✅ All 17 clinical rules from INFORME_ADR FR-2 are modelable
- ✅ `ErMedDietValidator` can distinguish `DAIRY`, `EGGS`, and `WHITE_MEAT` for the `Animal_Protein` counter
- ✅ `Nudge Engine` can trigger "fuente calcio vegetal" when `Animal_Protein > 2` because it can count animal sources
- ✅ SPECS_RF and SPECS_TECH views can be derived via mapping, not by mutilating the domain model
- ❌ `classificationService.ts` must be built on these 10 categories — more work upfront than 5, but avoids rework
- ❌ SPECS_RF UI will need a display mapping layer (e.g., `CEREALS` and `LEGUMES` visible as separate; `DAIRY`, `EGGS`, `WHITE_MEAT` visible under "Otras fuentes proteicas" or similar)

## Compliance

- `src/shared/domain/foodCategory.ts` exports the 10-group const object + Zod schema
- No feature creates its own `FoodCategory` subset — derive views via mapping functions
- Any proposed change to this canonical set requires a new ADR
