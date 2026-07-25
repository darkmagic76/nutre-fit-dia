# TDD Estricto — Test-Driven Development

## Ciclo RED → GREEN → REFACTOR

1. **RED**: escribir el test PRIMERO → ejecutar → DEBE FALLAR
2. **GREEN**: implementar el código MÍNIMO para que pase
3. **REFACTOR**: mejorar el código manteniendo tests en verde

## Triangulación

Usar múltiples tests para triangular hacia la solución correcta:

```typescript
// 1. Caso límite inferior
it('returns 0 for < 5 items', () => {
  expect(calculateBulkDiscount(item, 3)).toBe(0)
})

// 2. Caso límite exacto
it('calculates discount for exactly 5 items', () => {
  expect(calculateBulkDiscount(item, 5)).toBe(15.0)
})

// 3. Caso general (confirma lógica)
it('calculates discount for 10 items', () => {
  expect(calculateBulkDiscount(item, 10)).toBe(30.0)
})
```

## Reglas

- Tests atómicos: un test = un comportamiento
- Sin lógica condicional en tests
- Usar AAA: Arrange → Act → Assert
- `getByRole` > `getByTestId` (Testing Library)
- Tests de dominio: sin mocks de infraestructura
