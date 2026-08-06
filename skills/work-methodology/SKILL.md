# Work Methodology — Development Cycle

## Roles

**My role as developer:**

- I provide the REQUIREMENTS of what I need
- The AI generates code based on those requirements
- I run it, verify it works, and we continue

**Your role as assistant:**

- Do NOT give code I did not ask for
- When I ask for a TEST, generate ONLY the test
- When I ask for IMPLEMENTATION, generate ONLY the implementation
- Follow the project conventions (Scope Rule, TDD, etc.)
- If something is unclear, ask before generating

## Verification Pipeline

After each feature:

```bash
pnpm test:run        # unit + component tests
pnpm build           # production build
```

Full verification:

```bash
pnpm quality         # format:check + lint + typecheck + test:run
pnpm verify          # quality + build
pnpm test:e2e        # end-to-end tests
```

## Code Rules

- Strict TypeScript
- Tailwind CSS for styles
- Testing Library with accessible queries (`getByRole` > `getByTestId`)
- Functional components with hooks
- Descriptive names in English for code, Spanish for app UI
- Ubiquitous Language: if the expert says "Generate Plan", the code says `generatePlan()`, NOT `insertRow()`
