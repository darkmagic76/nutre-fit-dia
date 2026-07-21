## Exploration: Fix P0 Semantic Knot — RED_MEAT, strict mode, store architecture

### Current State

Three interconnected P0 issues were identified during a comprehensive audit of the codebase. Each has known or latent defects that must be resolved before the application can be considered architecturally sound.

---

### Issue 1: RED_MEAT Semantic Knot

**Root Cause**: The domain model has a semantic inconsistency where multiple specifications and ADRs reference "red meat" as a distinct concept, but the canonical `FoodCategory` enum (ADR-005, `foodCategory.ts`) only defines `WHITE_MEAT`. This was a **known deferral** from the M1-substitution-service change (archived proposal explicitly states "RED_MEAT category creation (domain model stays as-is)" with a `carbonFootprint >= 4.0` heuristic as mitigation).

**Evidence of the knot**:

1. **SPECS_TECH §4** requires: *"IF Scan_Result == 'Red Meat' THEN Suggest(Alternative_Legume || Alternative_BlueFish)"*
2. **INFORME_ADR FR-5.2** mandates: *"Reduction of red meats and dairy products for ODS 2030 and planetary health (EAT-Lancet)"*
3. **ADR-005** (10-group canonical model) only has `WHITE_MEAT` with no `RED_MEAT`
4. **`foodCategory.ts`**: The actual TypeScript export is exactly the 10 groups from ADR-005 — no `RED_MEAT`
5. **`substitutionService.ts`**: `isTriggerFood()` checks `FoodCategory.WHITE_MEAT` — semantically wrong per SPECS_TECH §4
6. **`rules.ts` (EGGS_RED_MEAT_ALT)**: Title says "carnes rojas" but condition checks `FoodCategory.WHITE_MEAT` — copy-paste bug
7. **`engine.test.ts` line 71**: References `FoodCategory.RED_MEAT` which doesn't exist — latent error, not caught because test files are excluded from `tsc` typecheck
8. **`foods-data.ts`**: No red meat entries. Chorizo (pork) is incorrectly classified as `WHITE_MEAT` — clinically inaccurate

**Clinical distinction matters**: WHITE_MEAT (pollo, pavo, conejo) has Máx 3/semana and is high-protein-low-fat. RED_MEAT (beef, pork, lamb) triggers substitution per EAT-Lancet and has different emission ratios (beef: 50× legumes, pork: 11× legumes).

#### Affected Areas
- `src/shared/domain/foodCategory.ts` — enum missing RED_MEAT
- `src/shared/data/foods-data.ts` — no red meats, chorizo misclassified
- `src/shared/sustainability/substitutionService.ts` — checks WHITE_MEAT instead of RED_MEAT
- `src/features/nudge-engine/rules.ts` — EGGS_RED_MEAT_ALT checks WHITE_MEAT
- `src/features/nudge-engine/rules.test.ts` — test matches buggy code
- `src/features/nudge-engine/engine.test.ts` — references non-existent enum value
- `adr/ADR-005-food-category-canonical-model.md` — needs update from 10→11 groups
- `openspec/specs/nudge-engine/spec.md` — may reference RED_MEAT semantics
- `src/shared/services/rationValidator.ts` — may need RED_MEAT limits

#### Approaches

1. **Add RED_MEAT to FoodCategory** (recommended)
   - Pros: Clinically accurate, aligns with INFORME_ADR / SPECS_TECH, resolves all contradictions permanently, follows ADR-005's model (which notes it's not exhaustive)
   - Cons: Changes canonical model (requires ADR amendment), reclassification work in data files, `rationValidator` needs new limits for RED_MEAT
   - Effort: **Medium** (new food data, enum change, spec updates, 5+ file changes)

2. **Keep current model, rename/reclassify all references to WHITE_MEAT**
   - Pros: Fewer code changes, enum size stays at 10
   - Cons: Clinically wrong (white meat ≠ red meat), substitution behavior would trigger on chicken which is not the intent, EGGS_RED_MEAT_ALT rule body says "carnes rojas" which would be wrong as WHITE_MEAT, perpetuates the conceptual confusion
   - Effort: **Low** (docs/specs changes only, no enum change)

#### Recommendation

**Add RED_MEAT to FoodCategory**. The current heuristic-based workaround (`carbonFootprint >= 4.0`) was a valid interim measure during M1, but it conflates high-carbon white meats (chicken: 5.0) with red meats which have different clinical profiles. A proper RED_MEAT category enables:
- Correct EGGS_RED_MEAT_ALT trigger on actual red meat
- Correct substitution trigger per SPECS_TECH §4
- Accurate `ANIMAL_PROTEIN_CATEGORIES` accounting
- Clinically meaningful limits via `rationValidator`
- Correct food classification in the catalog

#### Blockers
- ADR-005 must be updated (new ADR or amendment) to add the 11th group
- `rationValidator` currently has no limits for a RED_MEAT category — clinical review needed
- `ANIMAL_PROTEIN_CATEGORIES` must include RED_MEAT

#### Estimated Effort: **Medium**

---

### Issue 2: TypeScript Strict Mode

#### Current Settings
```json
{
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "erasableSyntaxOnly": true,
  "noFallthroughCasesInSwitch": true
  // MISSING: strict: true, strictNullChecks, noImplicitAny,
  //          strictFunctionTypes, strictBindCallApply,
  //          strictPropertyInitialization, noImplicitReturns,
  //          noImplicitOverride
}
```

#### Typecheck Result
`pnpm typecheck` **passes** with current settings (zero errors).

#### Why It Matters
- `strictNullChecks` alone would catch the largest class of runtime bugs (null/undefined access)
- `noImplicitAny` prevents accidentally untyped parameters from propagating
- TypeScript 6.0.2 supports `strict: true` as a single flag — best practice for any production codebase
- Test files are excluded from typecheck (`"exclude": ["src/**/*.test.ts"]`) — latent errors like `FoodCategory.RED_MEAT` go undetected

#### Breaking Scope Estimation
Without running with `strict: true`, based on codebase analysis:

| Pattern | Estimated occurrences | Risk |
|---------|---------------------|------|
| Implicit `any` on callback params (`.filter()`, `.map()`) | ~5-10 | Low |
| Optional properties without null check | ~3-5 | Medium |
| Function params without explicit type | ~2-5 | Medium |
| `strictPropertyInitialization` (class fields) | ~0 (codebase is function-based) | None |

Total estimated errors: **~15-30** across ~55 source files (excluding tests).

#### Approaches

1. **Enable `strict: true` in one shot** (recommended)
   - Pros: Single config change, fix all errors in one pass, TypeScript 6.0.2 fully supports it
   - Cons: May touch many files at once (review workload)
   - Effort: **Medium** (15-30 fixes across the codebase)

2. **Incremental: enable flags one by one**
   - Pros: Smaller PRs, easier review
   - Cons: More PRs, more churn, staging issues, each flag change creates a noisy diff
   - Effort: **Medium** (but spread over more PRs)

#### Recommendation
Enable `strict: true` in one shot. The codebase is already well-typed with Zod schemas and explicit interfaces. The estimated ~15-30 errors are manageable in a single pass. Include test files in typecheck (`exclude` only test helpers, not all test files) to catch latent errors like `FoodCategory.RED_MEAT`.

#### Estimated Effort: **Medium**

---

### Issue 3: Store Architecture vs ADR-009

#### Current Store Inventory

| Store | Location | Imports from | Imported by | Verdict |
|-------|----------|-------------|-------------|---------|
| `trackerStore` | `shared/stores/` | `@shared/*` only | nudge-engine (engine.ts), planStore, logStore, tests | ✅ **Correct** — 2+ feature consumers |
| `logStore` | `shared/stores/` | `@shared/*` + `trackerStore` | nudge-engine (engine.ts), tests | ✅ **Correct** — 2+ feature consumers |
| `activityStore` | `shared/stores/` | **`@features/activity-tracker/types`** ⚠️ | nudge-engine, activity-tracker feature, tests | ❌ **VIOLATION** — shared imports from feature |
| `planStore` | `shared/stores/` | **`@features/recipe-engine/services/planGenerator`** ⚠️ | only its own test (effectively dead code) | ❌ **VIOLATION** — shared imports from feature, no cross-feature consumers |
| `nudgeStore` | `features/nudge-engine/store/` | `@shared/*` only | engine.ts (in same feature) | ✅ **Correct** — feature-scoped per ADR-009 |

#### Violations Detail

1. **`activityStore.ts` in `shared/stores/`**:
   - Imports `ActivityEntry` type from `@features/activity-tracker/types`
   - **Architecture violation**: `shared/` must NOT import from `features/` (ADR-001 § Scope Rule, ADR-009 § store architecture)
   - Per ADR-009 ideal layout, should live in `src/features/activity-tracker/activityStore.ts`
   - Motion: move to feature directory. Nudge-engine already imports it cross-feature, which is permitted ("Cross-feature reads are done via store imports")

2. **`planStore.ts` in `shared/stores/`**:
   - Imports `generateWeeklyPlan` from `@features/recipe-engine/services/planGenerator`
   - **Architecture violation**: same as above — wrong dependency direction
   - Per ADR-009 ideal layout, should live in `src/features/recipe-engine/planStore.ts`
   - Only referenced by its own test — effectively unused by any feature; candidate for simplification

#### Files Violating Scope Rule
- `src/shared/stores/activityStore.ts` — imports from `@features/activity-tracker/types`
- `src/shared/stores/planStore.ts` — imports from `@features/recipe-engine/services/planGenerator`

#### Recommended Moves

| Store | From | To | Reason |
|-------|------|----|--------|
| `activityStore` | `shared/stores/` | `features/activity-tracker/` | Owned by activity-tracker; nudge-engine imports cross-feature |
| `planStore` | `shared/stores/` | `features/recipe-engine/` | Owned by recipe-engine; no cross-feature consumers |
| `trackerStore` | `shared/stores/` | (stay) | Correct: 2+ feature consumers |
| `logStore` | `shared/stores/` | (stay) | Correct: 2+ feature consumers |

#### Post-Move Import Flow
```
features/activity-tracker/activityStore.ts
  → exported via features/activity-tracker/index.ts (its own barrel)
  → imported cross-feature by features/nudge-engine/engine.ts ✅

features/recipe-engine/planStore.ts
  → exported via features/recipe-engine/index.ts (its own barrel)
  → planStore imports trackerStore (shared → shared) ✅
  → planStore generates plan via own feature's planGenerator ✅

shared/stores/index.ts
  → exports only trackerStore and logStore ✅
```

#### Estimated Effort: **Medium** (2 file moves, 3-5 import path updates, barrel export changes)

---

### Overall Recommendation

**Single change or split?**

Recommend **splitting into 3-4 separate changes** because each issue has independent scope, risk profile, and review focus:

| Change | Scope | Risk | Recommended Order |
|--------|-------|------|-------------------|
| **A: RED_MEAT** | Enum + data + rule fixes + ADR update | Medium (domain model change) | 1st |
| **B: Strict mode** | tsconfig + ~15-30 type fixes | Low-Medium (strictness, no behavior change) | 2nd |
| **C: Store moves** | File moves + import updates | Low (refactor only, no behavior change) | 3rd |

**Why not one single change?**
- The RED_MEAT change touches the domain model (high visibility, needs ADR review)
- Strict mode touches every source file (noisy but mechanical)
- Store moves are mechanical refactors with zero behavioral change

Separating them keeps each PR focused, reviewable, and safe to roll back.

#### Risks
- **RED_MEAT**: Adding a category changes `rationValidator` expectations — all consuming code must handle the new category gracefully (default empty counts)
- **Strict mode**: Including test files in typecheck may reveal latent errors in tests that were previously invisible
- **Store moves**: If any feature currently imports via `@shared/stores` in a way we don't track, the move breaks the import — exhaustive grep coverage is required
- **ADR-005 update**: Must be formally documented (new ADR or amendment) to keep the ADR trail honest

### Ready for Proposal
**Yes** — exploration is complete. All three issues are well-understood with concrete recommendations. Proceed to `sdd-propose` with a recommendation to split into 3 separate changes (RED_MEAT, strict mode, store moves).
