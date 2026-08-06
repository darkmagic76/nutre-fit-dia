# Strict TDD — Test-Driven Development

## RED → GREEN → REFACTOR Cycle

1. **RED**: write the test FIRST → run → it MUST FAIL
2. **GREEN**: implement the MINIMUM code to make it pass
3. **REFACTOR**: improve the code while keeping tests green

## Triangulation

Use multiple tests to triangulate toward the correct solution:

```typescript
// 1. Lower bound case
it('returns 0 for < 5 items', () => {
  expect(calculateBulkDiscount(item, 3)).toBe(0);
});

// 2. Exact bound case
it('calculates discount for exactly 5 items', () => {
  expect(calculateBulkDiscount(item, 5)).toBe(15.0);
});

// 3. General case (confirms logic)
it('calculates discount for 10 items', () => {
  expect(calculateBulkDiscount(item, 10)).toBe(30.0);
});
```

## Rules

- Atomic tests: one test = one behavior
- No conditional logic in tests
- Use AAA: Arrange → Act → Assert
- `getByRole` > `getByTestId` (Testing Library)
- Domain tests: no infrastructure mocks
