# ADR-004: Caloric Target Algorithm (Mifflin-St Jeor + PREDIMED-Plus)

**Status:** Accepted — Amended 2026-07-15, Amended 2026-07-21, Amended 2026-07-22  
**Date:** 2026-07-12  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The metabolic engine must compute personalized daily caloric targets for Type 2 Diabetes patients following the erMedDiet protocol.

### Amendment (2026-07-15)

The original decision applied the 600 kcal deficit unconditionally. Traceability analysis against `SPECS_RF` (RF-02) and `SPECS_TECH` (§2) revealed a discrepancy: both refined specifications state the deficit is **conditional on IMC > 25**, not universal. The `FR-MATRIX` flagged this as `⚠️ Pendiente: Refinar caloricTargetService`. This amendment reconciles the ADR with the refined clinical requirements.

### Amendment (2026-07-21) — Diagnosis-Age Modifier (FR-4.1)

FR-4.1 phenotypic filtering requires scaling caloric restriction aggressiveness by `diagnosisAge` (age at which Type 2 Diabetes was first diagnosed). Three clinical brackets modulate the 600 kcal PREDIMED-Plus base deficit:

| Bracket                  | diagnosisAge   | Modifier | Adjusted Deficit | Clinical Rationale                                            |
| ------------------------ | -------------- | -------- | ---------------- | ------------------------------------------------------------- |
| Early onset              | `< 40`         | `1.0`    | 600 kcal         | Younger patients tolerate full aggressive restriction         |
| Standard onset           | `40–60`        | `0.85`   | 510 kcal         | Moderate restriction appropriate for mid-life diagnosis       |
| Late onset               | `> 60`         | `0.7`    | 420 kcal         | Conservative restriction for older patients with frailty risk |
| Default (empty/zero/NaN) | `≤ 0` or `NaN` | `0.85`   | 510 kcal         | Conservative default when diagnosis age is unknown            |

The modifier is applied **before** the 30% TDEE safety cap to preserve clinical intent — capping after modifier ensures both the clinical aggressiveness AND safety guardrail are respected.

**Clinical validation of thresholds and modifiers is deferred to RNF-01** (dietitian review). Current values are evidence-informed estimates from PREDIMED-Plus age-stratified cohorts and should be validated against patient outcomes before production deployment.

## Decision

Implement in `src/shared/services/caloricTargetService.ts`:

> **Note (2026-07-22 amendment):** Originally located at `src/features/metabolic-tracker/services/`. Moved to `src/shared/services/` per Scope Rule (ADR-001) because `computeCaloricTarget()` is consumed by both the metabolic-tracker and recipe-engine features. The feature now imports from `@shared/services`.

### Inputs

| Parameter | Type | Unit | Source |
|---|---|---|---|---|
| `weight` | number | kg | User profile |
| `height` | number | cm | User profile |
| `age` | number | years | User profile |
| `gender` | `'male' \| 'female'` | — | User profile |
| `physicalActivityFactor` | 1.2–1.9 | — | WHO/FAO classification |
| `imc` | number | kg/m² | Computed from weight/height |
| `diagnosisAge` | number | years | User profile (FR-4.1 phenotypic filtering) |

### Algorithm

1. **BMR**: Mifflin-St Jeor equation (gender-specific)
   - Male: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5`
   - Female: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161`

2. **TDEE**: `BMR × physicalActivityFactor` (1.2–1.9 per WHO/FAO)

3. **Deficit decision** (conditional branching + diagnosis-age modifier):
   - `if imc > 25`:
     - `baseDeficit = 600 kcal` (PREDIMED-Plus intensive intervention protocol)
     - `modifier = getDiagnosisModifier(diagnosisAge)` — scales aggressiveness per phenotypic bracket:
       - `< 40` → `1.0` (early onset — full deficit)
       - `40–60` → `0.85` (standard onset — moderate deficit)
       - `> 60` → `0.7` (late onset — gentle deficit)
       - `≤ 0` or `NaN` → `0.85` (conservative default when unknown)
     - `adjusted = Math.round(baseDeficit × modifier)` — scaled deficit before capping
     - `deficit = min(adjusted, TDEE × 0.3)` — capped at 30% of TDEE as a safety guardrail
   - `else`: `deficit = 0`
     - Patients with IMC ≤ 25 do not require caloric restriction under erMedDiet
     - Target = TDEE (weight maintenance)

4. **Target**: `TDEE - deficit`

5. **Safety floor**: target never below 1200 kcal/day
   - Below this threshold, micronutrient adequacy cannot be guaranteed without clinical supplementation

All values rounded to nearest integer (decimal precision has no clinical value for daily targets).

### Clinical Rationale for IMC > 25

- WHO defines overweight as IMC ≥ 25 kg/m²
- SPECS_RF RF-02 explicitly gates the 600 kcal reduction on IMC > 25
- SPECS_TECH §2 confirms: "Trigger automático que, ante la detección de sobrepeso u obesidad (IMC > 25), aplica una restricción de 600 kcal/día"
- PREDIMED-Plus enrolled participants with IMC ≥ 27 and ≤ 40; the 25 threshold is a conservative clinical boundary endorsed by both refined specifications

### Service Signature (TypeScript)

```ts
interface CaloricTargetInput {
  weight: number; // kg
  height: number; // cm
  age: number; // years
  gender: 'male' | 'female';
  physicalActivityFactor: number; // 1.2–1.9
  imc: number; // kg/m², pre-computed by caller
  diagnosisAge: number; // years, age at T2D diagnosis (FR-4.1 phenotypic filtering)
}

interface CaloricTargetOutput {
  bmr: number; // kcal/day
  tdee: number; // kcal/day
  deficit: number; // kcal/day (0 if imc ≤ 25)
  target: number; // kcal/day (≥ 1200)
  restrictionActive: boolean; // true when deficit > 0
}

function computeCaloricTarget(input: CaloricTargetInput): CaloricTargetOutput;

// FR-4.1 diagnosis-age modifier constants and pure function
const DIAGNOSIS_AGE_EARLY_THRESHOLD = 40;
const DIAGNOSIS_AGE_LATE_THRESHOLD = 60;
const DEFICIT_MODIFIER_EARLY = 1.0; // < 40 years
const DEFICIT_MODIFIER_STANDARD = 0.85; // 40–60 years
const DEFICIT_MODIFIER_LATE = 0.7; // > 60 years

function getDiagnosisModifier(diagnosisAge: number): number;
// Returns: 1.0 (early), 0.85 (standard/default), 0.7 (late)
// NaN and ≤ 0 default to 0.85 (conservative)
```

The `restrictionActive` flag enables downstream features (`ErMedDietValidator`, `RecipeEngine`) to branch on cereal limits (4 vs 6 raciones) without re-checking IMC.

## Consequences

- ✅ Medically validated formula (Mifflin-St Jeor is the clinical standard)
- ✅ PREDIMED-Plus compliant 600 kcal deficit with 30% safety cap
- ✅ Deficit now conditional on IMC > 25, matching SPECS_RF RF-02 and SPECS_TECH §2
- ✅ Diagnosis-age modifier scales deficit by phenotypic bracket (FR-4.1): early → full 600, standard → 510, late → 420
- ✅ Modifier applied BEFORE 30% cap to preserve clinical intent while maintaining safety guardrail
- ✅ `restrictionActive` flag avoids IMC-check duplication across features
- ❌ Floating-point arithmetic in JS requires care (IEEE 754 rounding)
- ❌ IMC is pre-computed by caller — the service does not own the IMC formula (responsibility of `UserProfile` or a shared `computeIMC()` utility)
- ❌ Clinical thresholds (40, 60) and modifier values (1.0, 0.85, 0.7) require dietitian validation per RNF-01
