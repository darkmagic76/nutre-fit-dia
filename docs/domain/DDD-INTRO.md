# Domain-Driven Development — Conceptual Introduction

> **📖 This document is a conceptual introduction to the Nutre-Fit-Dia domain. For code-level semantic analysis, see the specs in `openspec/specs/` and the type model in `src/shared/domain/`. This document complements, not replaces, those technical artifacts.**

As a Software Architect focused on **Domain-Driven Development (DDD)**, the first step to untie the "semantic knot" is recognizing that language in Nutre-Fit-Dia is not uniform; what a doctor understands by "validation" is radically different from what a developer understands.

Below, I present the analysis of the **Bounded Contexts** and the **polysemy** map detected in the sources.

## 1. Proposed Bounded Contexts (BC)

To prevent metabolic logic from being contaminated by recipe logistics or environmental metrics, I identify four clear contexts:

- **Metabolic Management BC (Core Domain):** Centered on patient physiology (insulin, HbA1c, glucose, BMI). Its goal is DT2 reversal.
- **Nutritional Governance BC:** Encapsulates the **erMedDiet** diet rules and **AESAN 2022** rations. Here resides the "Traffic Light" and the "Occult Sugar" logic.
- **Planetary Sustainability BC:** Manages the `environmentalScore`, water and carbon footprints. It does not care about glucose, but about ecosystem impact.
- **Behavioral BC (Nudge Engine):** Manages adherence, alerts, and user "engagement" through AI rules.

---

## 2. Polysemy Detection and Linguistic Conflicts

I have detected critical terms that mean different things depending on the context. Ignoring this will cause the code to fail in its medical purpose:

| Term               | Meaning in Medical/Nutritional Context                                         | Meaning in Technical/Software Context                                      |
| :----------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Validation**     | Legal and clinical act where a **nutricionista colegiado** approves a plan.    | Type validation with **Zod** or data schemas at runtime.                   |
| **Ración**         | Exact quantity in grams according to the AESAN matrix (e.g. 4 of cereals/day). | An instance or entry in an array within the `RecipeEngine`.                |
| **Alert**          | Imminent metabolic risk (glycemic spike).                                      | A UI component, a system `SafetyAlert` or an `ErrorBoundary`.              |
| **Sugar**          | Macro-nutritional carbohydrate naturally present.                              | **Hidden ingredient** (sucrose, syrup) that should trigger a system block. |
| **Sustainability** | The planet's capacity to support food production (EAT-Lancet).                 | Code maintainability through **Screaming Architecture** and tests.         |

---

## 3. Analysis of Raw Requirements and Ambiguities

When analyzing the sources, "gray areas" emerge that must be resolved before programming the domain services:

1. **The "Priority" of Bacalao:** The sources mark it as "high-priority protein". **Ambiguity:** Is this priority nutritional (appears more times) or logistical (the first thing the `Substitution Service` suggests)?
2. **The Weight of the Traffic Light:** If a food is nutritionally "Green" (AOVE) but its `environmentalScore` is low (<30), what color should the traffic light be? According to "Dual Ranking" logic, the traffic light is medical, but the ranking penalizes sustainability. Confusing this would send contradictory messages to the patient.
3. **Conditional Deficit:** A 600 kcal reduction is imposed if BMI > 25. **Ambiguity:** Is it a fixed or dynamic cut? The sources say glucose recording should "recalibrate the engine" in real time, implying complex reactive logic, not just a static calculation.

---

## 4. Scenario Simulation (Semantic Untangling)

Before writing `SubstitutionService.ts`, we must resolve these mental scenarios:

- **Scenario A: "The Fruit Error":** A piece of fruit has a high glycemic load. The system fires a `SafetyAlert`. If the developer treats it as a generic "system notification", the user might ignore it. It must be a **Domain Block**, since it is a biological restriction.
- **Scenario B: "The Invisible Sugar":** A yogurt has 0% fat (looks healthy) but has glucose syrup in the ingredients. The nutritional context must "win" over the macro-label context. The domain model must have an `IngredientAnalyzer` that is independent from the `MacroCalculator`.

**Architect's Conclusion:** For this system to be a "high-precision medical engineering tool", the code must speak the language of **erMedDiet**. The **Screaming Architecture** detected in the sources is the primary defense against these semantic knots, forcing each feature folder (`features/`) to be a silo of coherent meaning.
