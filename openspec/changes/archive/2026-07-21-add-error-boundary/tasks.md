# Tasks: Add ErrorBoundary

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150–200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: ErrorBoundary Component (TDD)

- [x] 1.1 RED — Write `src/shared/ui/ErrorBoundary.test.tsx`:
  Catch render errors (spec: Child throws, Nested child), display fallback with role="alert", retry button resets and re-renders, normal render passes through, no catch on event handler/setTimeout/Promise/useEffect throws, dev console logs `[ErrorBoundary]` prefix with component stack, production gate (no log)
- [x] 1.2 GREEN — Implement `src/shared/ui/ErrorBoundary.tsx`: class component with `getDerivedStateFromError`, `componentDidCatch`, `handleRetry()`, renders `fallback` prop or children, gates `console.error` behind `import.meta.env.DEV`
- [x] 1.3 Create `src/shared/ui/ErrorFallback.tsx`: presentational component, props: `title`, `description`, `buttonLabel`, `onRetry`; renders `role="alert"` container with message and retry button

## Phase 2: Integration

- [x] 2.1 Add i18n keys to `src/shared/i18n/types.ts`: `error.boundary.title`, `error.boundary.description`, `error.boundary.retry`, `error.boundary.globalReload`; add values to `en.ts` and `es.ts`
- [x] 2.2 Export `ErrorBoundary` and `ErrorFallback` from `src/shared/ui/index.ts`
- [x] 2.3 Wrap all 7 tab panels in `src/App.tsx` with per-tab `<ErrorBoundary fallback={<ErrorFallback ... />}>`, using `useT()` for i18n strings
- [x] 2.4 Add global `<ErrorBoundary>` in `src/main.tsx` wrapping `<I18nProvider><App /></I18nProvider>` with full-viewport fallback that offers `window.location.reload()`

## Phase 3: Verification

- [x] 3.1 Run `pnpm test:run` — all ErrorBoundary tests pass + existing suite green
- [x] 3.2 Run `pnpm typecheck` — zero type errors across all modified files
- [x] 3.3 Verify per-tab isolation: render test confirms one tab error shows only that tab's fallback; other tabs remain interactive (spec: Single tab crash, Two tabs crash, Retry recovery, Global boundary does not interfere)
- [x] 3.4 Run `pnpm verify` — full quality gate (lint + typecheck + test:run + build)
