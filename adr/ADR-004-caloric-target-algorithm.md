# ADR-004: Caloric Target Algorithm (Mifflin-St Jeor + PREDIMED-Plus)

**Status:** Accepted — Amended 2026-07-15  
**Date:** 2026-07-12  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The metabolic engine must compute personalized daily caloric targets for Type 2 Diabetes patients following the erMedDiet protocol.

### Amendment (2026-07-15)

The original decision applied the 600 kcal deficit unconditionally. Traceability analysis against `SPECS_RF` (RF-02) and `SPECS_TECH` (§2) revealed a discrepancy: both refined specifications state the deficit is **conditional on IMC > 25**, not universal. The `FR-MATRIX` flagged this as `⚠️ Pendiente: Refinar caloricTargetService`. This amendment reconciles the ADR with the refined clinical requirements.

## Decision

Implement in `src/features/metabolic-tracker/services/caloricTargetService.ts`:

### Inputs

| Parameter | Type | Unit | Source |
|---|---|---|---|
| `weight` | number | kg | User profile |
| `height` | number | cm | User profile |
| `age` | number | years | User profile |
| `gender` | `'male' \| 'female'` | — | User profile |
| `physicalActivityFactor` | 1.2–1.9 | — | WHO/FAO classification |
| `imc` | number | kg/m² | Computed from weight/height |

### Algorithm

1. **BMR**: Mifflin-St Jeor equation (gender-specific)
   - Male: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5`
   - Female: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161`

2. **TDEE**: `BMR × physicalActivityFactor` (1.2–1.9 per WHO/FAO)

3. **Deficit decision** (NEW — conditional branching):
   - `if imc > 25`: `deficit = min(600 kcal, TDEE × 0.3)`
     - 600 kcal follows the PREDIMED-Plus intensive intervention protocol
     - Capped at 30% of TDEE as a safety guardrail (prevents excessive restriction for high-TDEE individuals)
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
  weight: number          // kg
  height: number          // cm
  age: number             // years
  gender: 'male' | 'female'
  physicalActivityFactor: number  // 1.2–1.9
  imc: number             // kg/m², pre-computed by caller
}

interface CaloricTargetOutput {
  bmr: number             // kcal/day
  tdee: number            // kcal/day
  deficit: number         // kcal/day (0 if imc ≤ 25)
  target: number          // kcal/day (≥ 1200)
  restrictionActive: boolean  // true when deficit > 0
}

function computeCaloricTarget(input: CaloricTargetInput): CaloricTargetOutput
```

The `restrictionActive` flag enables downstream features (`ErMedDietValidator`, `RecipeEngine`) to branch on cereal limits (4 vs 6 raciones) without re-checking IMC.

## Consequences

- ✅ Medically validated formula (Mifflin-St Jeor is the clinical standard)
- ✅ PREDIMED-Plus compliant 600 kcal deficit with 30% safety cap
- ✅ Deficit now conditional on IMC > 25, matching SPECS_RF RF-02 and SPECS_TECH §2
- ✅ `restrictionActive` flag avoids IMC-check duplication across features
- ❌ Floating-point arithmetic in JS requires care (IEEE 754 rounding)
- ❌ IMC is pre-computed by caller — the service does not own the IMC formula (responsibility of `UserProfile` or a shared `computeIMC()` utility)
