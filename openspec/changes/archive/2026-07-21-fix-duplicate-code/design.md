# Design: Fix Duplicate Code

## Technical Approach

Pure structural refactor: extract duplicated data (sugar aliases) and duplicated test utilities into shared modules. No logic changes, no new types, no behavior changes.

## Architecture Decisions

### Decision: Union list for sugar aliases

**Choice**: Export a `SUGAR_ALIASES` const array containing the union of both existing lists (19 unique items).
**Alternatives considered**: Minimal overlap list (only shared items) — would leave duplicates in each consumer; keeping per-file lists — defeats DRY purpose.
**Rationale**: Union ensures no detection capability is lost. Each consumer applies its own matching semantics (`includes` for substring match, `Set.has` for exact match). Tests prove no behavioral regression.

### Decision: Test helpers as named exports

**Choice**: Export `createLocalStorage` and `createMatchMedia` from `src/test/test-helpers.ts` as plain functions.
**Alternatives considered**: Class-based mock factory — overengineered for two functions.
**Rationale**: Matches existing `src/test/` patterns (`i18n-test-utils.tsx` uses named exports). Zero refactoring of the functions themselves — pure file move + import swap.

## Data Flow

```
Before:
  occultSugarDetector.ts ──→ OCCULT_SUGAR_PATTERNS (local const)
  MockScannerAdapter.ts ──→ sugarAliases (local Set)

After:
  shared/domain/sugarAliases.ts ──→ SUGAR_ALIASES (shared const)
       ↑                          ↑
  occultSugarDetector.ts    MockScannerAdapter.ts
       (imports, uses includes)   (imports, uses Set.has)

Before:
  App.test.tsx ──→ createLocalStorage() + createMatchMedia() (local)
  App.integration.test.tsx ──→ createLocalStorage() + createMatchMedia() (identical local)

After:
  test/test-helpers.ts ──→ createLocalStorage() + createMatchMedia() (shared)
       ↑                          ↑
  App.test.tsx              App.integration.test.tsx
       (imports)                 (imports)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/domain/sugarAliases.ts` | Create | Canonical `SUGAR_ALIASES` const array (union of both existing lists) |
| `src/test/test-helpers.ts` | Create | `createLocalStorage()` and `createMatchMedia()` exported functions |
| `src/features/nutritional-traffic-light/services/occultSugarDetector.ts` | Modify | Replace local `OCCULT_SUGAR_PATTERNS` with import from shared |
| `src/infrastructure/ml/MockScannerAdapter.ts` | Modify | Replace local `sugarAliases` Set with import from shared |
| `src/App.test.tsx` | Modify | Remove local `createLocalStorage`/`createMatchMedia`, import from test-helpers |
| `src/infrastructure/ml/MockScannerAdapter.ts` | Modify | Use `Set` from shared array for exact matching |
| `src/App.integration.test.tsx` | Modify | Remove local `createLocalStorage`/`createMatchMedia`, import from test-helpers |

## Interfaces / Contracts

```typescript
// src/shared/domain/sugarAliases.ts
export const SUGAR_ALIASES: readonly string[] = [
  'azúcar', 'azucar', 'sacarosa', 'sacarina', 'jarabe', 'glucosa',
  'fructosa', 'dextrosa', 'maltosa', 'sirope', 'melaza', 'miel',
  'maltodextrina', 'concentrado de zumo', 'néctar', 'nectar', 'panela',
  'zumo concentrado', 'zumo de fruta concentrado',
];

// src/test/test-helpers.ts
export function createLocalStorage(): Storage;
export function createMatchMedia(matches: boolean): MediaQueryList;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (safety net) | All 510 existing tests | `pnpm test:run` — must pass before and after |
| TypeCheck | All files | `pnpm typecheck` — must pass clean |
| Lint | All files | `pnpm lint` — must pass clean |

No new tests needed — this is a pure refactor. Existing tests are the behavioral contract.

## Migration / Rollout

No migration required. Single PR. Instant swap — imports are resolved at compile time.

## Open Questions

None.
