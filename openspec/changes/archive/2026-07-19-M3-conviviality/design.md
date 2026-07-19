# Design: M3 — Convivialidad (Social Eating & Cooking Technique Labels)

## Technical Approach

Extend the existing `CulturalBadges` component inside `PlanView.tsx` to render textual Spanish suggestion spans below the emoji badge row. Add a `COOKING_LABELS` constant map for technique→label lookup. No new components, types, or imports needed — `CulturalMetadata` is already imported and used. Change is fully localized to the recipe-engine feature (Scope Rule compliant).

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `COOKING_LABELS` as a constant in `PlanView.tsx` | Only one component uses it → local; move to shared only if reused | Inline in `PlanView.tsx` |
| Extract `CulturalBadges` to `@shared/ui` | Badges are only used here; premature extraction violates Scope Rule | Keep in `PlanView.tsx` |
| English vs Spanish labels | UI is fully Spanish ("Plan Semanal erMedDiet", "Día 1"); labels must match | Spanish strings |
| New CSS classes vs existing Tailwind tokens | `text-xs` (subtle), `text-emerald-700` (social=positive), `text-stone-500` (technique=neutral) follow existing palette | Tailwind utility classes |
| Separate component file vs inline | 2 spans only; no state or lifecycle; existing pattern is inline | Inline spans in `CulturalBadges` |

## Data Flow

```
Food.culturalMetadata (from food data)
         │
         ▼
PlanView renders:
  day.entries.map(e →
    e.food.culturalMetadata
      ? <CulturalBadges meta={e.food.culturalMetadata} />
      : null
  )
         │
         ▼
CulturalBadges (component):
  ┌─────────────────────────────────────┐
  │ meta.traditionalCuisine → 🏺 span   │  ← existing emoji
  │ meta.socialEating       → 👥 span   │  ← existing emoji
  │ meta.erMedDiet          → 🌿 span   │  ← existing emoji
  │ meta.socialEating       → text span │  ← NEW: "Ideal para comer en compañía"
  │ meta.cookingTechnique   → text span │  ← NEW: "Preparación: guiso tradicional"
  └─────────────────────────────────────┘
```

No structural data flow changes — same prop injection path as H5.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/recipe-engine/PlanView.tsx` | Modify | Add `COOKING_LABELS` const; extend `CulturalBadges` JSX with conditional text spans |
| `src/features/recipe-engine/PlanView.test.tsx` | Modify | Add 2 tests: social eating text + cooking technique label |

## Interfaces / Contracts

No new interfaces. `CulturalMetadata` type already includes:

```typescript
// From @shared/domain
type CulturalMetadata = {
  traditionalCuisine: boolean
  socialEating: boolean
  cookingTechnique?: 'steam' | 'boiled' | 'grilled' | 'raw' | 'stew'
  geographicOrigin?: string
  proteinBiologicalValue?: number
  erMedDiet: boolean
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `socialEating=true` renders "Ideal para comer en compañía" | `screen.getByText(...)` on a `weeklyPlan` with `lentejas` (already has `socialEating: true`) |
| Unit | `cookingTechnique='stew'` renders "Preparación: guiso tradicional" | Same `lentejas` fixture — `getByText` for the full label string |
| Unit | Existing 7 tests remain green | No fixture changes; assertion additions only |

## Migration / Rollout

No migration required. Pure UI addition — existing data renders the same, new fields render new spans when present.

## Open Questions

None.
