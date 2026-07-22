# ADR-007: Sustainability Scoring — Domain Model and Feature Placement

**Status:** Accepted  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

Sustainability is a first-class clinical requirement across all specification documents, not an afterthought:

| Source               | Requirement                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `INFORME_ADR` FR-1.1 | "Sostenibilidad y Salud Planetaria: Alineación con los ODS 2030, optimizando la huella hídrica y de carbono en la selección de recetas" |
| `INFORME_ADR` FR-2.2 | "Environmental Weight: puntuación ambiental. El arroz tiene una huella de carbono 4× superior al trigo y 12× superior a la patata"      |
| `INFORME_ADR` FR-5.2 | "Productos de temporada y proximidad. Reducción de carnes rojas y lácteos por ODS 2030 y salud planetaria (EAT-Lancet)"                 |
| `SPECS_RF`           | "Calificación Dual: evaluación de salud metabólica + impacto ambiental"                                                                 |
| `SPECS_RF`           | "Sustitución Inteligente: cambiar carne roja por legumbres o pescado azul"                                                              |
| `SPECS_RF` RNF-03    | "Priorización de productos locales, de temporada y minimización de envases"                                                             |
| `SPECS_TECH` §4      | "Ranking de Sostenibilidad: alternativas priorizadas según baja huella hídrica y de carbono"                                            |
| `SPECS_TECH` §7      | Comparative emissions: legumbres 50× menos que ternera, 11× menos que cerdo, 7× menos que pollo, 6× menos que huevos                    |

Sustainability scoring touches 4+ features: Scanner (dual qualification), RecipeEngine (prioritization), NudgeEngine (intelligent substitution), MealPlan (environmental weight). Per ADR-001 Scope Rule, code used by 2+ features must live in `shared/`.

The tension: sustainability is **domain logic** (EAT-Lancet, AESAN 2022, ODS 2030), not infrastructure. But placing it in `shared/` risks the "junk drawer" anti-pattern where `shared/` accumulates orphaned business rules.

## Decision

### Placement: `src/shared/sustainability/`

Sustainability scoring lives in `shared/` because it is consumed by multiple features, but it is structured as a **domain module** — not a utility bag:

```
src/shared/sustainability/
├── types.ts          — EnvironmentalScore, Seasonality, Proximity, PackagingLevel
├── schemas.ts        — Zod schemas for runtime validation
├── constants.ts      — Reference data from AESAN 2022 / EAT-Lancet
├── scoringService.ts — computeEnvironmentalScore(food): EnvironmentalScore
├── substitutionService.ts — suggestAlternative(food): Food[]
└── index.ts          — Public API surface
```

### Why not a feature?

A feature in Screaming Architecture owns a complete user-facing capability. Sustainability is not a standalone user goal — no user opens the app to "check my carbon footprint." It is an **algorithmic weighting factor** embedded in food selection, recipe ranking, and nudge suggestions. It belongs in `shared/` because it is a cross-cutting domain concern, same way `shared/domain/` hosts `FoodCategory` and `TrafficLightColor`.

### Domain Model

#### Core Entity: `EnvironmentalScore`

```ts
export interface EnvironmentalScore {
  carbonFootprint: CarbonFootprint; // kg CO2eq per kg of food
  waterFootprint?: WaterFootprint; // liters per kg (V2)
  seasonality: Seasonality; // current season match
  proximity: Proximity; // local vs imported
  packagingLevel: PackagingLevel; // waste impact
  overallScore: number; // 0–100 weighted composite
}
```

#### Sub-models

```ts
export interface CarbonFootprint {
  value: number; // kg CO2eq per kg
  category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  source: 'AESAN_2022' | 'EAT_Lancet' | 'OPEN_FOOD_FACTS';
}

export type Seasonality = {
  isSeasonal: boolean;
  months: number[]; // [1..12], empty if year-round
  region: string; // e.g. 'iberian_peninsula'
};

export type Proximity = 'local' | 'national' | 'eu' | 'imported';
export type PackagingLevel = 'none' | 'minimal' | 'standard' | 'excessive';
```

### Reference Data: AESAN 2022 Emission Ratios

The comparative ratios from SPECS_TECH §7 are encoded as constants, not hardcoded in scoring logic:

```ts
// src/shared/sustainability/constants.ts
export const PROTEIN_EMISSION_RATIOS = {
  legumes: 1, // baseline (lowest)
  eggs: 6, // 6× legumes
  poultry: 7, // 7× legumes
  pork: 11, // 11× legumes
  beef: 50, // 50× legumes
  fish_white: 4, // estimated from EAT-Lancet
  fish_blue: 5, // estimated from EAT-Lancet
} as const;
```

These ratios are **relative**, not absolute kg CO2eq. For V1, relative scoring is sufficient to rank alternatives. V2 can integrate absolute values from lifecycle assessment databases (Agribalyse, Ecoinvent).

### Dual Qualification Contract

The scanner (ADR-003 `ScannerAdapter`) currently returns `ScanResult` with health data only. Sustainability adds a **second dimension** without changing the contract:

```ts
// ADR-003 ScanResult extended (backward-compatible)
interface ScanResult {
  foodId: string;
  confidence: number;
  ingredients: string[];
  detectedAddedSugars: string[];
  healthScore: TrafficLightColor; // existing
  environmentalScore?: EnvironmentalScore; // NEW — optional, populated when data available
}
```

The `?` means: a food with unknown environmental data still gets a health classification. The dual qualification degrades gracefully to single qualification when sustainability data is missing.

### Scoring Algorithm (V1)

```ts
function computeEnvironmentalScore(food: Food): EnvironmentalScore {
  const carbon = getCarbonFootprint(food);
  const season = getSeasonality(food, currentMonth, userRegion);
  const proximity = getProximity(food, userRegion);

  // Weighted composite (0–100)
  const overallScore = round(
    carbon.weight * 0.5 + // Carbon dominates (AESAN 2022 priority)
      season.weight * 0.3 + // Seasonality second
      proximity.weight * 0.2, // Proximity third
  );

  return {
    carbonFootprint: carbon,
    seasonality: season,
    proximity,
    packagingLevel: 'standard',
    overallScore,
  };
}
```

Weights are initial defaults, not hardcoded magic numbers — they come from a configurable `WEIGHTS` constant so clinical teams can tune them without code changes.

### Integration Points

| Consumer                                  | How it uses sustainability                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scanner** (`nutritional-traffic-light`) | Returns `environmentalScore` alongside `healthScore` in `ScanResult`                                                                                   |
| **RecipeEngine**                          | Ranks recipes by weighted score: `healthWeight × healthScore + sustainabilityWeight × environmentalScore`                                              |
| **NudgeEngine**                           | Triggers `BehavioralNudge` when a scanned food has `environmentalScore.overallScore < 30` → suggests sustainable alternative via `substitutionService` |
| **MealPlan**                              | Applies `EnvironmentalWeight` from INFORME_ADR FR-2.2: adjusts food frequency in weekly plans (e.g., rice limited because 12× potato's footprint)      |

### Data Sources Strategy

| Data point                     | V1 source                                                  | V2 source                                              |
| ------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| Carbon footprint (kg CO2eq/kg) | Static table from AESAN 2022 / EAT-Lancet reference values | Agribalyse API or Open Food Facts environmental fields |
| Water footprint                | ❌ Not in V1                                               | Water Footprint Network database                       |
| Seasonality                    | Static calendar per region (Iberian peninsula)             | Geolocation + seasonal produce API                     |
| Proximity                      | Manual tag on food item or inferred from seasonality       | Geolocation + supply chain data                        |
| Packaging                      | ❌ Not in V1                                               | OCR detection from packaging material labels           |

## Consequences

- ✅ Dual qualification: every scanned food gets both health and environmental scores
- ✅ `EnvironmentalScore` is optional on `ScanResult` — degrades gracefully when data is missing
- ✅ Emission ratios from SPECS_TECH §7 are encoded as auditable constants, not magic numbers
- ✅ Scoring weights are configurable — clinical team can tune without touching algorithm code
- ✅ `substitutionService` enables SPECS_RF "Sustitución Inteligente" and SPECS_TECH "IF Red_Meat THEN Suggest Legume or BlueFish"
- ✅ All 4+ consuming features reference a single `src/shared/sustainability/` module — no duplication
- ❌ V1 carbon data is static reference values, not dynamic lifecycle assessment — acceptable for TFM, insufficient for production
- ❌ Water footprint and packaging deferred to V2 — SPECS_RF mentions them but data availability is poor
- ❌ `overallScore` weighting is a clinical decision, not purely technical — defaults must be reviewed by a dietitian before production

## Traceability

| Requirement                                                 | Covered by                                       |
| ----------------------------------------------------------- | ------------------------------------------------ |
| INFORME_ADR FR-1.1 (ODS 2030 alignment)                     | `EnvironmentalScore` overall composite           |
| INFORME_ADR FR-2.2 (Environmental Weight, arroz 12× patata) | `constants.ts` emission ratios, `scoringService` |
| INFORME_ADR FR-5.2 (temporada, proximidad, ODS 2030)        | `Seasonality` + `Proximity` sub-models           |
| SPECS_RF "Calificación Dual"                                | `ScanResult.environmentalScore`                  |
| SPECS_RF "Sustitución Inteligente"                          | `substitutionService.ts`                         |
| SPECS_RF RNF-03 (local, temporada, envases)                 | `Seasonality` + `Proximity` (packaging V2)       |
| SPECS_TECH §4 "Ranking de Sostenibilidad"                   | `scoringService.computeEnvironmentalScore()`     |
| SPECS_TECH §7 emission comparisons                          | `PROTEIN_EMISSION_RATIOS` constants              |
