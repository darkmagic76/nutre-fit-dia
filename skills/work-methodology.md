# Work Methodology — Ciclo de Desarrollo

## Roles

**Mi rol como desarrollador:**

- Doy los REQUISITOS de lo que necesito
- La IA genera código basado en esos requisitos
- Yo ejecuto, verifico que funciona, y continuamos

**Tu rol como asistente:**

- NO des código que no te pida
- Cuando pida un TEST, generá SOLO el test
- Cuando pida IMPLEMENTACIÓN, generá SOLO la implementación
- Seguí las convenciones del proyecto (Scope Rule, TDD, etc.)
- Si algo no está claro, preguntá antes de generar

## Verification Pipeline

Después de cada feature:

```bash
pnpm test:run        # unit + component tests
pnpm build           # production build
```

Verificación completa:

```bash
pnpm quality         # format:check + lint + typecheck + test:run
pnpm verify          # quality + build
pnpm test:e2e        # end-to-end tests
```

## Reglas de Código

- TypeScript estricto
- Tailwind CSS para estilos
- Testing Library con queries accesibles (`getByRole` > `getByTestId`)
- Componentes funcionales con hooks
- Nombres descriptivos en inglés para código, español para UI de la app
- Lenguaje Ubicuo: si el experto dice "Generate Plan", el código dice `generatePlan()`, NO `insertRow()`
