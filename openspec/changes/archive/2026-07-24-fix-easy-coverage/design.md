# Design: Fix Remaining Statement Coverage Gaps

## Technical Approach

Add 5 targeted unit tests across 3 existing test files. Zero production code changes. Each test exercises a single uncovered defensive branch. Two tests require runtime type bypasses (`as any`) to simulate edge cases unreachable through the typed public API.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test placement | Append to existing test files | Co-located with implementation; no new files |
| Type bypass (gaps 2, 3) | `as any` cast on category key | Closed type sets; branches exist for defensive fallback |
| Empty catalog (gap 5) | Mutate `foods` array in-place with try/finally | Avoids `vi.mock` hoisting side effects on sibling tests |
| isHighPriority (gap 4) | Call `generateWeeklyPlan(false)` | `pickSustainableFood` is module-private; test via public API |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/hooks/useInstallPrompt.test.ts` | Modify | +1 test: install() before event |
| `src/shared/services/rationValidator.test.ts` | Modify | +2 tests: category fallback, missing AESAN standard |
| `src/features/recipe-engine/services/planGenerator.test.ts` | Modify | +2 tests: isHighPriority sort, enforceAOVE empty catalog |

## Test Strategy Per File

### useInstallPrompt.test.ts — Gap 1 (line 44)

- **Branch**: `if (!deferredPrompt) return;` — null guard early return
- **Approach**: `renderHook` → call `install()` without dispatching `beforeinstallprompt`
- **Assert**: no throw, `isInstallable` stays `false`
- **Pattern**: `act(() => result.current.install())` — same pattern as existing "install() calls prompt()" test

### rationValidator.test.ts — Gap 2 (line 140)

- **Branch**: `CATEGORY_DISPLAY_NAMES[category] ?? category` — nullish coalescing fallback
- **Approach**: Inject unknown category into `RATION_LIMITS` at runtime via `(RATION_LIMITS as Record<string, any>)['fake-cat'] = {...}`; call `validateRations`
- **Assert**: no throw; the fallback branch executes
- **Cleanup**: `delete (RATION_LIMITS as any)['fake-cat']` in try/finally

### rationValidator.test.ts — Gap 3 (line 266)

- **Branch**: `if (!standard) continue;` — skip food without AESAN standard
- **Approach**: Create food with `category: 'nonexistent' as any` via `makeFood`; call `validateFoodPortions([food])`
- **Assert**: returns `[]`, no throw
- **Pattern**: `makeFood({ category: 'nonexistent' as any })` — bypasses FoodCategory type

### planGenerator.test.ts — Gap 4 (line 240)

- **Branch**: `if (a.isHighPriority && !b.isHighPriority) return -1;` — sort comparator priority branch
- **Approach**: Call `generateWeeklyPlan(false)`; verify Bacalao (`isHighPriority: true`) appears in FISH selections
- **Assert**: Bacalao present in plan FISH entries, `isHighPriority` flag is set
- **Pattern**: FlatMap days → filter FISH → find Bacalao

### planGenerator.test.ts — Gap 5 (line 269)

- **Branch**: `if (aoveFood)` falsy — no OLIVE_OIL in catalog
- **Approach**: Mutate `foods` array: save original, replace with OLIVE_OIL-free copy, call `enforceAOVE(entries, 1)`, restore original
- **Cleanup**: try/finally with `foods.length = 0; foods.push(...original)`
- **Assert**: returns original entries only, no OLIVE_OIL added, no throw

## Open Questions

None.
