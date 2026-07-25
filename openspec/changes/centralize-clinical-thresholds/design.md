# Design: Centralize Clinical Thresholds & Feature Barrels

## Technical Approach

Two mechanical refactorings with zero behavioral change. No new architecture — just import graph cleanup and Screaming Architecture barrel creation.

1. **Threshold centralization**: Move 13 module-scoped `const` declarations from `rules.ts` → `clinical.ts`. `clinical.ts` becomes the single source of truth for all 14 clinical/behavioral thresholds (13 new + 1 existing `CEREAL_RESTRICTED_MAX`). All consumers import from `@shared/constants/clinical`. Preserve `VEGETABLE_NUDGE_HOUR_THRESHOLD` re-export through `@shared/nudge` for the `vegetable-nudge-timegate` spec contract.
2. **Feature barrels**: Create 5 new `index.ts` barrels + extend 1 existing. All export only the Container component. Update `App.tsx` deep imports to barrel imports.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Clinical thresholds location | `src/shared/constants/clinical.ts` | Already exists for this purpose. Consumed by 2+ features (nudge-engine, daily-violations). Scope Rule: shared. |
| Import strategy for DailyViolations | Import directly from `@shared/constants/clinical`, NOT through `@shared/nudge` barrel | Canonical source. The `@shared/nudge` re-export exists for backward compat, not as preferred path. Consumer of threshold data, not nudge internals. |
| Re-export contract for VEGETABLE_NUDGE_HOUR_THRESHOLD | Preserve via `export { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/constants/clinical'` in `nudge/index.ts` | `REQ-VEGETABLE-NUDGE-TIMEGATE-CONSTANT` from `vegetable-nudge-timegate` spec requires it importable from `@shared/nudge`. |
| Constant naming | Keep existing names unchanged (e.g. `CEREAL_MIN_RATIONS`, not `CEREAL_DEFICIT_MIN`) | Mechanical refactoring — renaming increases risk at 13 usage sites in `rules.ts`. |
| Barrel export scope | Container only — no hooks, services, or components | Screaming Architecture: barrel is the feature's public API. Internal components stay private to the feature. |

## File Structure: Before / After

```
Before:
  src/shared/constants/clinical.ts         → 1 const (CEREAL_RESTRICTED_MAX)
  src/shared/nudge/rules.ts                → 13 module-scoped consts + NUDGE_RULES
  src/shared/nudge/index.ts                → re-exports from rules.ts
  src/features/nutritional-traffic-light/  → no barrel
  src/features/med-diet-validator/         → no barrel
  src/features/metabolic-tracker/          → no barrel
  src/features/recipe-engine/              → no barrel
  src/features/sustainability/             → no barrel
  src/features/nudge-engine/index.ts       → hooks/services only (no Container)

After:
  src/shared/constants/clinical.ts         → 14 exported consts (source of truth)
  src/shared/nudge/rules.ts                → 0 module-scoped consts, imports from clinical.ts
  src/shared/nudge/index.ts                → re-exports VEGETABLE_NUDGE_HOUR_THRESHOLD from clinical.ts
  src/features/{5 dirs}/index.ts           → NEW: barrel exporting Container
  src/features/nudge-engine/index.ts       → ADD: Container export
```

## Import Strategy Per File

| File | Change | New Import |
|------|--------|------------|
| `src/shared/constants/clinical.ts` | ADD 13 `export const` | — (source of truth) |
| `src/shared/nudge/rules.ts` | REMOVE 13 consts, ADD named import | `import { CEREAL_MIN_RATIONS, VEGETABLE_MIN_RATIONS, ... } from '@shared/constants/clinical'` |
| `src/shared/nudge/index.ts` | REPLACE re-export source | `export { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/constants/clinical'` |
| `DailyViolations.tsx` | CHANGE import path | `import { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/constants/clinical'` |
| `DailyViolations.test.tsx` | CHANGE import path | same as above |
| 5 new feature barrels | CREATE file | `export { XxxContainer } from './XxxContainer'` |
| `nudge-engine/index.ts` | ADD line | `export { NudgeEngineContainer } from './NudgeEngineContainer'` |
| `App.tsx` (6 lines) | SHORTEN import paths | Drop `/ContainerName` suffix from import path |

## Re-export Contract Preservation

```
@shared/constants/clinical          @shared/nudge/index.ts
──────────────────────────          ──────────────────────
export const                        export { VEGETABLE_NUDGE_HOUR_THRESHOLD }
  VEGETABLE_NUDGE_HOUR_THRESHOLD    from '@shared/constants/clinical';
  = 14;
                                        ↓
                                   consumers importing from @shared/nudge
                                   continue to work (backward compat)
```

`pnpm typecheck` verifies the contract. No test changes needed — the export path resolves identically.

## Rollback

```bash
git revert <commit-hash>
```

Zero data migration, zero persistence, zero API changes. Single commit revert restores all files. TypeScript compiler catches any missed references.

## Verification Checklist

- [ ] `pnpm typecheck` — zero errors (import graph intact)
- [ ] `pnpm test:run` — all 578 tests green (no behavioral change)
- [ ] `pnpm lint` — zero warnings
- [ ] `App.tsx` uses barrel imports for all 7 Containers
- [ ] `VEGETABLE_NUDGE_HOUR_THRESHOLD` importable from `@shared/nudge`
- [ ] `CEREAL_RESTRICTED_MAX` value unchanged in clinical.ts
