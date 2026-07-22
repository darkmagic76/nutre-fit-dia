# ADR-006: Activity Tracking Strategy — Goal Tracker vs Budget Adjuster

**Status:** Accepted  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

Two distinct features compete under the name "Activity Tracking" across specification documents:

| Document             | What it asks for                                                                                                                          | Type                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `INFORME_ADR` FR-4.3 | "ajustará el presupuesto calórico del día **en tiempo real** según la actividad física realizada" (Google Fit / Apple Health integration) | **ActivityBudgetAdjuster** |
| `SPECS_RF` RF-03     | "Seguimiento de 150-300 min/semana de actividad moderada y 2 días de fortalecimiento muscular"                                            | **ActivityGoalTracker**    |
| `SPECS_TECH` §6      | "Monitoreo de un objetivo de 150-300 min/semana [...] al menos 2 días de fortalecimiento muscular"                                        | **ActivityGoalTracker**    |

ADR-004 already defines a static `physicalActivityFactor` (1.2–1.9) for BMR → TDEE calculation. This is a **basal classification** of the user's general lifestyle (sedentary, lightly active, moderately active, very active) — it is neither a daily budget adjuster nor a weekly goal tracker.

These are three separate concepts sharing vocabulary. They must be untangled before implementation.

## Decision

### Separation of Concerns

```
Physical Activity in the domain
├── BasalPAF (ADR-004)         — Static coefficient describing lifestyle. Already implemented.
├── ActivityGoalTracker (V1)   — Weekly target compliance. SPECS_RF RF-03 + SPECS_TECH §6.
└── ActivityBudgetAdjuster (V2)— Real-time caloric budget recalibration. INFORME_ADR FR-4.3.
```

### V1 Scope: ActivityGoalTracker

**What it does**: tracks whether the user meets WHO/OMS weekly targets. No budget adjustment. No real-time integration.

**Inputs** (manual entry or future device sync):

- Weekly moderate-intensity minutes (target: 150–300)
- Strength training sessions per week (target: ≥ 2 days)

**Outputs**:

- Compliance percentage per week
- Streak data (consecutive weeks meeting targets)
- Read-only display in metabolic dashboard

**Feature location**: `src/features/activity-tracker/`

**Why V1, not V2**:

- SPECS_RF and SPECS_TECH — the most refined specifications — both describe a goal tracker, not a budget adjuster
- Manual entry requires no external API integration (GoogleFit/AppleHealth OAuth, data sync, conflict resolution)
- Weekly granularity is computationally simpler than real-time recalibration
- The clinical value is self-contained: activity compliance correlates with HbA1c improvement independently of caloric math

**Interaction with ADR-004**: none. `BasalPAF` remains unchanged. Activity goal compliance is informational, not algorithmic.

### V2 Scope (Post-TFM): ActivityBudgetAdjuster

**What it does**: adjusts the daily caloric target in real time based on tracked physical activity via Google Fit / Apple Health API.

**Why deferred**:

- Requires OAuth integration with two external health platforms
- Real-time adjustment changes the caloric target mid-day, requiring plan recalculation
- Clinical safety: budget increases from exercise must be validated against glucose data to prevent compensatory overeating
- No refined specification (SPECS_RF, SPECS_TECH) includes this — it exists only in INFORME_ADR FR-4.3

**Contract for V2** (to avoid rearchitecture):

- `ActivityBudgetAdjuster` reads from the same `activity-tracker` feature, extending it with device sync
- ADR-004's `CaloricTargetInput` will accept an optional `activityAdjustment: number` field
- When absent (V1), adjustment = 0. When present (V2), added post-deficit calculation

### Non-decision: BasalPAF

The static `physicalActivityFactor` in ADR-004 answers a different question: "What is this person's baseline energy expenditure given their general lifestyle?" This is a clinical parameter, not a tracking feature. It does not change day-to-day and does not require device integration.

## Consequences

- ✅ Clear scope boundary: V1 ships a focused goal tracker that satisfies SPECS_RF and SPECS_TECH
- ✅ No GoogleFit/AppleHealth dependency for V1 — dramatically reduces integration risk
- ✅ `CaloricTargetInput` designed with V2 extension point (`activityAdjustment`) — no rearchitecture needed
- ✅ BasalPAF and goal tracking coexist without conflict
- ❌ INFORME_ADR FR-4.3 (real-time budget adjustment) is explicitly deferred to V2
- ❌ Manual activity entry has lower data fidelity than device sync — acceptable for V1, clinical-grade for V2

## Traceability

| Requirement                              | Covered by                    | Phase |
| ---------------------------------------- | ----------------------------- | ----- |
| INFORME_ADR FR-4.3 (real-time budget)    | `ActivityBudgetAdjuster`      | V2    |
| SPECS_RF RF-03 (150-300 min + 2d fuerza) | `ActivityGoalTracker`         | V1    |
| SPECS_TECH §6 (150-300 min + 2d fuerza)  | `ActivityGoalTracker`         | V1    |
| ADR-004 PAF (basal classification)       | `BasalPAF` (static, existing) | Done  |
