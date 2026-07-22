# Design: Add Coverage Threshold Enforcement

## Technical Approach

Add a `coverage` configuration block to the existing `test` section in `vite.config.ts` using Vitest's native `thresholds` API. The `@vitest/coverage-v8` provider is already installed, so only configuration is needed.

## Architecture Decisions

### Decision: Use Vitest native thresholds

| Option | Tradeoff | Verdict |
|--------|----------|---------|
| Vitest `thresholds` in config | Native, zero-dependency, enforced at runtime | ✅ Chosen |
| Custom post-coverage script | Extra maintenance, redundant with vitest API | ❌ Rejected |

**Rationale**: Vitest's built-in `coverage.thresholds` is the standard approach — it fails the test run when coverage drops below configured values. No scripts, no CI config changes.

## Data Flow

```
pnpm test:coverage
  → vitest reads vite.config.ts
  → vitest runs tests with v8 coverage
  → vitest compares coverage against thresholds
  → If below threshold: exit 1 with error message
  → If at/above threshold: exit 0 with report
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Modify | Add `coverage` block with provider and thresholds to `test` section |

## Interfaces / Contracts

```typescript
// New config in vite.config.ts test section:
test: {
  coverage: {
    provider: 'v8',
    thresholds: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | N/A | Config change only — no code to unit test |
| Integration | Threshold enforcement | Run `pnpm test:coverage` — must exit 0 (current coverage > 80%) |
| E2E | N/A | Not applicable |

## Migration / Rollout

No migration required. Single config change, immediate effect on next `pnpm test:coverage` run.

## Open Questions

None.
