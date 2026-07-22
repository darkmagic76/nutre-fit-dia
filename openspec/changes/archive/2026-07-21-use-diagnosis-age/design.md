# Design: Use Diagnosis Age to Adjust Caloric Restriction Aggressiveness

## Technical Approach

Add `getDiagnosisModifier(diagnosisAge)`: a pure exported function returning multiplier 1.0 (<40), 0.85 (40-60), 0.7 (>60). Apply in `computeCaloricTarget()` after `rawDeficit` computation, before 30% cap and 1200 floor. Zero new dependencies, zero UI changes.

## Architecture Decisions

### Decision: Modifier as standalone pure function

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inline in `computeCaloricTarget` | Less testable, no isolation | ❌ |
| Exported pure `getDiagnosisModifier` | Isolated unit tests, self-documenting, reusable | ✅ |

**Rationale**: Enables 7 targeted unit tests at bracket boundaries. Exported for potential FR-4.1 downstream reuse.

### Decision: Modifier applied BEFORE cap/floor

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Apply after cap/floor | Safety wins but clinical intent lost | ❌ |
| Apply before cap/floor | Clinical intent preserved, safety still enforced downstream | ✅ |

**Rationale**: Modifier encodes clinical aggressiveness. Cap-on-modifier would prevent early-onset from ever getting 600 kcal. Apply modifier → cap → floor preserves both clinical logic AND safety.

## Data Flow

```
UserMetrics{ diagnosisAge, imc, ... }
       │
       ▼
computeCaloricTarget()
       │
       ├── bmrMifflinStJeor(weight,height,age,gender)  ──► BMR
       ├── BMR × physicalActivityFactor                  ──► TDEE
       ├── isRestrictionCandidate(imc)
       │       │
       │       ├── false ──► deficit = 0
       │       └── true:
       │               ├── baseDeficit = PREDIMED_PLUS_DEFICIT_KCAL  (600)
       │               ├── modifier = getDiagnosisModifier(diagnosisAge)  ◄── NEW
       │               ├── adjusted = Math.round(baseDeficit × modifier)  ◄── NEW
       │               ├── rawDeficit = min(adjusted, Math.round(TDEE × 0.3))
       │               └── target = max(TDEE - rawDeficit, 1200)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/services/caloricTargetService.ts` | Modify | Add `getDiagnosisModifier()`, apply before cap |
| `src/shared/services/caloricTargetService.test.ts` | Modify | 12+ test cases across 3 brackets + edges |
| `adr/ADR-004-caloric-target-algorithm.md` | Modify | Document diagnosisAge input + modifier constants |
| `adr/FR-MATRIX-trazabilidad.md` | Modify | FR-4.1 status: ✅ data → ✅ full |

## Interfaces / Contracts

No interface changes — `diagnosisAge: number` already in `UserMetrics` (metrics.ts:10).

New function:
```ts
export function getDiagnosisModifier(diagnosisAge: number): number {
  if (!diagnosisAge || Number.isNaN(diagnosisAge) || diagnosisAge < 40) {
    if (diagnosisAge >= 40 && diagnosisAge <= 60) return 0.85
  }
  // etc.
}
```

Bracket constants in module scope:
```ts
const DIAGNOSIS_AGE_EARLY_THRESHOLD = 40
const DIAGNOSIS_AGE_LATE_THRESHOLD = 60
const DEFICIT_MODIFIER_EARLY = 1.0
const DEFICIT_MODIFIER_STANDARD = 0.85
const DEFICIT_MODIFIER_LATE = 0.7
```

Algorithm insertion point (after line 53, before safety constraints):
```ts
const modifier = getDiagnosisModifier(input.diagnosisAge)
const adjustedDeficit = Math.round(PREDIMED_PLUS_DEFICIT_KCAL * modifier)
const rawDeficit = restrictionActive
  ? Math.min(adjustedDeficit, Math.round(tdee * DEFICIT_CAP_RATIO))
  : 0
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getDiagnosisModifier()` bracket boundaries | 8 cases: 0, 25, 39, 40, 50, 60, 61, NaN |
| Unit | Modifier isolation — BMR/TDEE unchanged | 2 cases: different diagnosisAge, identical BMR/TDEE |
| Integration | `computeCaloricTarget()` with modifier flow | Update 2 existing tests (diagnosisAge:50 → 0.85 → deficit=488) |
| Integration | Cap/floor preserved after modifier | 3 cases per spec R6 |

## Migration / Rollout

No migration needed. `diagnosisAge` defaults to empty string → `parseNumeric()` → 0 → 0.85 modifier (standard behavior). Users who haven't set it are unaffected. Existing test base input (`diagnosisAge: 50`) falls in standard bracket — deficit changes from 574 to 488, test expectation update only.

## Open Questions

- [ ] Clinical validation of thresholds (40, 60) and modifiers (1.0, 0.85, 0.7) — flagged per RNF-01 for dietitian review at PR
