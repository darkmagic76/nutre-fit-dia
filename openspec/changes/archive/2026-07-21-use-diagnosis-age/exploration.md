## Exploration: Use Diagnosis Age to Adjust Caloric Restriction Aggressiveness

### Current State

`diagnosisAge` is collected as an optional string field in the ProfileForm, validated in the trackerStore (must be 0-120, cannot exceed current age), and passed through to `computeCaloricTarget()` via the `UserMetrics` interface. **It has zero behavioral effect.** The code comment at `caloricTargetService.ts:11` explicitly states: *"diagnosisAge is stored for downstream phenotypic filtering (FR-4.1). It does not alter the MSJ formula itself."*

The current algorithm:

```
restrictionActive = imc > 25  (via isRestrictionCandidate)
rawDeficit = restrictionActive ? min(600, tdee * 0.3) : 0
target = max(tdee - rawDeficit, 1200)
```

The FR-MATRIX marks FR-4.1 as "✅ Completado" because `diagnosisAge` exists in `UserProfileSchema` and the trackerStore — but the **behavioral half** of the requirement ("ajustar la agresividad de la restricción") is not implemented.

### Spec Analysis

| Source | Statement | Implication |
|--------|-----------|-------------|
| INFORME_ADD FR-4.1 | "Edad de Diagnóstico: Para ajustar la agresividad de la restricción." | **Mandatory**: diagnosisAge MUST affect restriction aggressiveness |
| SPECS_TECH §2 | "Validación de Datos de Entrada: Ingesta obligatoria de edad de diagnóstico... para el filtrado fenotípico." | diagnosisAge is a mandatory input for phenotype-based decisions |
| ADR-004 | No mention of diagnosisAge | ADR is stale — does not reflect FR-4.1 or the current code interface |
| caloricTargetService.ts | Comment on line 11 | Explicitly says diagnosisAge does NOT affect the formula — contradicts FR-4.1 |

The spec is unambiguous: FR-4.1 requires `diagnosisAge` to **adjust restriction aggressiveness**. The current code does NOT implement this.

### Clinical Rationale

Evidence for diagnosisAge as a modifier of restriction aggressiveness:

1. **Early-onset T2D (diagnosisAge < 40)**: Well-documented more aggressive phenotype — faster beta-cell decline, greater insulin resistance, higher cardiovascular complication risk (ADA 2024, Sattar et al. *Diabetologia*). These patients need **more aggressive** caloric restriction to preserve beta-cell function and achieve metabolic control.

2. **Standard-onset T2D (diagnosisAge 40-60)**: Typical disease trajectory. Standard PREDIMED-Plus approach applies without modification.

3. **Late-onset T2D (diagnosisAge > 60)**: Slower disease progression but higher risk of sarcopenia, frailty, and malnutrition with aggressive restriction. These patients need **gentler** restriction with a higher safety floor.

The physiological rationale: younger patients have more lean body mass, higher metabolic rate, and greater metabolic reserve — they can safely tolerate and benefit from more aggressive restriction. Older patients are at risk of muscle loss and micronutrient deficiency when caloric intake drops too low.

### Affected Areas

- `src/shared/services/caloricTargetService.ts` — Core change: add `diagnosisAge`-based deficit modifier function and optional safety floor adjustment
- `src/shared/services/caloricTargetService.test.ts` — Add test scenarios for each diagnosis age bracket
- `adr/ADR-004-caloric-target-algorithm.md` — Update ADR with `diagnosisAge` input parameter and modulation logic
- `adr/FR-MATRIX-trazabilidad.md` — Update FR-4.1 traceability to reflect algorithm implementation (not just data collection)
- `src/shared/domain/metrics.ts` — No change needed (diagnosisAge already in UserMetrics)
- `src/shared/stores/trackerStore.ts` — No change needed (already passes diagnosisAge)

### Approaches

1. **Scale deficit amount by diagnosisAge bracket** — Most faithful to FR-4.1
   - Implement `diagnosisAgeDeficitModifier(diagnosisAge)` returning 1.0 (<40), 0.85 (40-60), 0.7 (>60)
   - Apply modifier to the `PREDIMED_PLUS_DEFICIT_KCAL` constant: `Math.round(600 × modifier)`
   - Keep the 30% TDEE safety cap
   - Optionally adjust safety floor to 1400 for late-onset (> 60)
   - Pros: Directly implements FR-4.1 "adjust aggressiveness", clinically defensible tiered thresholds, preserves PREDIMED-Plus protocol structure
   - Cons: Adds clinical threshold constants that need validation, bracket boundaries are somewhat arbitrary (±5 years shifts change behavior)
   - Effort: Low

2. **Use disease duration (currentAge - diagnosisAge)** — Alternative proxy for disease progression
   - Compute `yearsWithT2D = currentAge - diagnosisAge`
   - Longer duration (> 15 years) → full deficit; short duration (< 5 years) → gentler deficit
   - Pros: Duration is a known predictor of beta-cell decline, continuous variable feels more precise
   - Cons: FR-4.1 specifically says "Edad de Diagnóstico" not "years since diagnosis", requires both fields
   - Effort: Low

3. **Adjust only the safety floor, not the deficit** — Minimal change
   - Keep 600 kcal deficit for all, but raise floor for late-onset (> 60) to 1400
   - Pros: Simplest change, protects older patients
   - Cons: Does NOT "adjust aggressiveness of restriction" as FR-4.1 requires — only adds a safety net
   - Effort: Very Low

### Recommendation

**Approach 1 (Scale deficit by diagnosisAge)** is recommended:

1. Most faithful to FR-4.1's explicit "ajustar la agresividad de la restricción"
2. Clinically defensible: early-onset T2D is a more aggressive phenotype
3. Preserves the PREDIMED-Plus 600 kcal reference — only scales it
4. Can be implemented as a pure function with < 10 lines of new code

Specific algorithm change:

```
function diagnosisAgeDeficitModifier(diagnosisAge: number): number {
  if (diagnosisAge < 40) return 1.0   // early-onset: full deficit
  if (diagnosisAge <= 60) return 0.85  // standard-onset: moderate
  return 0.7                           // late-onset: gentle
}

ADJUSTED_DEFICIT = min(round(600 * modifier), round(TDEE * 0.3))
SAFETY_FLOOR = diagnosisAge > 60 ? 1400 : 1200
```

### Risks

- **Clinical validation risk**: The specific bracket thresholds (40, 60) and modifier values (1.0, 0.85, 0.7) need domain expert review. These are educated estimates based on published T2D phenotype research but should be validated by a dietitian-nutritionist per RNF-01.
- **Behavioral change for existing users**: If a user has diagnosisAge stored and suddenly their target changes, this could cause confusion. Mitigation: the field was optional and most test data shows `diagnosisAge: ''`, so real users likely haven't set it.
- **ADR staleness**: ADR-004 must be updated to include diagnosisAge as an input parameter and document the modulation logic — the current ADR does not mention diagnosisAge at all.
- **FR-MATRIX inaccuracy**: The matrix marks FR-4.1 as completed. After implementing this change, the matrix must be updated to reflect that the algorithm part is also implemented.

### Ready for Proposal

Yes. The requirement is clear (FR-4.1), the clinical rationale is sound, and the implementation scope is small and isolated. Recommend the orchestrator proceed to `sdd-propose` with Approach 1.
