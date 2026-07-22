# ADR-002: Domain Model with Zod + TypeScript 6 Const Objects

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The project requires strict type safety for medical domain data (food nutritional values, glucose readings, caloric targets). Runtime validation is necessary because external data sources (scanner, user input) cannot be trusted at compile time.

TypeScript 6 with `erasableSyntaxOnly` forbids `enum` declarations.

## Decision

1. **Use Zod 4** for runtime schema validation and type inference (`z.infer<typeof Schema>`).
2. **Replace enums with const objects** for group constants (FoodCategory, TrafficLightColor, etc.) using `as const` + union type export.
3. **Use factory functions** (e.g., `food()`) to fill Zod `.default()` fields in data arrays, avoiding `as const` type narrowing issues.

## Consequences

- ✅ Single source of truth: Zod schema → TypeScript type
- ✅ Runtime validation for scanner inference, localStorage reads, and form inputs
- ✅ Zero enum-related TS6 errors
- ✅ Clean data declarations without repeating `false` defaults
- ❌ Zod 4 API differs from Zod 3 (z.enum() syntax, no generic enum helper)

## Example

```ts
export const TrafficLightColor = { GREEN: 'green', ORANGE: 'orange', RED: 'red' } as const;
export type TrafficLightColor = (typeof TrafficLightColor)[keyof typeof TrafficLightColor];
export const TrafficLightColorSchema = z.enum(['green', 'orange', 'red']);
```
