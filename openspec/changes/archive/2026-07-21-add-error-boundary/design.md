# Design: Add ErrorBoundary

## Technical Approach

Hybrid strategy: one global `ErrorBoundary` in `main.tsx` + seven per-tab `ErrorBoundary` wrappers in `App.tsx`. React class component (React 19 has no hook-based alternative — `getDerivedStateFromError` + `componentDidCatch` remain the only error boundary API). i18n strings passed as props since class components cannot call `useT()`.

## Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Component type | Class | N/A | React error boundaries require `getDerivedStateFromError` + `componentDidCatch`; no hook or function-component equivalent exists in React 19 |
| Placement | `shared/ui/` | `shared/components/` | `shared/ui/` houses all presentational output according to existing project convention |
| i18n strategy | Props injection | Wrapper FC that calls `useT()` | Simpler — avoids extra wrapper component. Caller (`App.tsx`/`mainEntry`) already has `useT()` in scope |
| Global boundary location | `main.tsx` (inline) | Separate file | Single use, 5 lines — inline keeps context visible |

## Data Flow

```
main.tsx entry (inline global ErrorBoundary)
  │
  ├── header, nav, footer (shell) ← protected by global boundary
  │
  └── App.tsx ← inside global boundary, contains per-tab boundaries
        │
        ├── ErrorBoundary → scanner tab (NutritionalTrafficLightContainer)
        ├── ErrorBoundary → log tab (MedDietValidatorContainer)
        ├── ErrorBoundary → metabolic tab (MetabolicTrackerContainer)
        ├── ErrorBoundary → plan tab (RecipeEngineContainer)
        ├── ErrorBoundary → activity tab (ActivityTrackerContainer)
        ├── ErrorBoundary → nudges tab (NudgeEngineContainer)
        └── ErrorBoundary → sustainability tab (SustainabilityContainer)
```

Error propagation (per-tab):
```
child throws → getDerivedStateFromError(error) → state = { hasError: true, error }
  → render() returns fallback UI
  → user clicks Retry → handleRetry() → setState({ hasError: false }) → re-render children
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/ui/ErrorBoundary.tsx` | Create | Class component: `getDerivedStateFromError`, `componentDidCatch`, `handleRetry`, renders `fallback` prop or `DefaultFallback` |
| `src/shared/ui/ErrorBoundary.test.tsx` | Create | TDD: render children that throw, assert fallback, click retry, assert re-render |
| `src/shared/ui/index.ts` | Modify | Add `export { ErrorBoundary } from './ErrorBoundary'` |
| `src/shared/i18n/types.ts` | Modify | Add keys: `error.boundary.title`, `error.boundary.description`, `error.boundary.retry`, `error.boundary.globalReload` |
| `src/shared/i18n/en.ts` | Modify | English values for error boundary keys |
| `src/shared/i18n/es.ts` | Modify | Spanish values for error boundary keys |
| `src/App.tsx` | Modify | Import `ErrorBoundary` + `useT`; wrap each `{tab === 'x' && <Container />}` with `<ErrorBoundary fallback={...}>` |
| `src/main.tsx` | Modify | Import `ErrorBoundary` + inline translations object; wrap `<I18nProvider><App /></I18nProvider>` with `<ErrorBoundary fallback={...}>` |

## Interfaces

```tsx
// ErrorBoundary props
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode          // custom fallback UI; defaults to DefaultFallback
  onError?: (error: Error, info: ErrorInfo) => void  // optional callback (testing, logging)
  onRetry?: () => void          // optional custom retry handler
}

// ErrorBoundary state
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// Translation keys added (shared/i18n/types.ts)
'error.boundary.title': string
'error.boundary.description': string
'error.boundary.retry': string
'error.boundary.globalReload': string
```

Global entry in `main.tsx` — inline global boundary pattern:
```tsx
// Static translations object (no hooks in module scope)
const errorBoundaryStrings = {
  title: 'Algo salió mal',
  description: 'La aplicación encontró un error inesperado.',
  retry: 'Reintentar',
  globalReload: 'Recargar aplicación',
}

// Inline global ErrorBoundary
<ErrorBoundary
  fallback={<GlobalErrorFallback strings={errorBoundaryStrings} />}
>
  <I18nProvider><App /></I18nProvider>
</ErrorBoundary>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | ErrorBoundary catches render error | Render a child that throws; assert fallback text appears |
| Unit | Retry resets error state | Simulate click on retry button; assert children re-render |
| Unit | Dev console logging | Mock `console.error`; assert called with `[ErrorBoundary]` prefix when `import.meta.env.DEV` |
| Unit | Normal render passes through | Render ErrorBoundary with non-throwing children; assert children output visible |
| E2E | N/A | Not applicable — error simulation in E2E is fragile and provides low value vs unit coverage |

## Migration / Rollout

No migration required. The change is purely additive — components wrapped in ErrorBoundary behave identically when no error occurs. Zero data migration, zero feature flags.

## Open Questions

None.
