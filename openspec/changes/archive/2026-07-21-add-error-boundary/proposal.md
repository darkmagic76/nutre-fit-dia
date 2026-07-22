# Proposal: Add ErrorBoundary

## Intent

Prevent a single component render error from crashing the entire SPA. Currently, zero UI-level error handling exists — any throw in a feature container kills all 7 tabs. Users see a white screen with no recovery.

## Scope

### In Scope
- Class-based `ErrorBoundary` component in `shared/ui/` (Scope Rule: used by 2+ features)
- Per-tab boundaries in `App.tsx` wrapping all 7 feature containers
- Global boundary in `main.tsx` protecting the app shell (header, nav, i18n)
- Fallback UI with error message + retry button (per-tab) / reload button (global)
- i18n keys for error boundary strings (en + es)
- Console error logging in dev mode

### Out of Scope
- Error reporting service (Sentry, Datadog)
- Async/event-handler error catching (React limitation)
- Error recovery strategies beyond retry/reload
- Monitoring/metrics

## Capabilities

### New Capabilities
- `error-boundary`: Catch render errors, display fallback UI, support per-tab isolation and global shell protection with retry/reload

### Modified Capabilities
None — purely additive. No existing spec requirements change.

## Approach

Hybrid global + per-tab strategy (Approach 3 from exploration). React class component with `getDerivedStateFromError` + `componentDidCatch`. Per-tab boundaries isolate failures to individual tabs. Global boundary catches shell-level errors. i18n strings passed as props (class components cannot consume hooks).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/ui/ErrorBoundary.tsx` | New | Class component with error lifecycle |
| `src/shared/ui/ErrorBoundary.test.tsx` | New | Unit tests for catch/fallback/retry |
| `src/shared/ui/index.ts` | Modified | Export `ErrorBoundary` |
| `src/shared/i18n/types.ts` | Modified | Add `error.boundary.*` keys |
| `src/shared/i18n/en.ts` | Modified | English error boundary strings |
| `src/shared/i18n/es.ts` | Modified | Spanish error boundary strings |
| `src/App.tsx` | Modified | Wrap 7 tab panels in per-tab `ErrorBoundary` |
| `src/main.tsx` | Modified | Add global `ErrorBoundary` wrapper |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Retry loops on persistent errors | Low | Per-tab isolation — user navigates to other tabs; no forced retry |
| Console log in production | Low | Gate `console.error` behind `import.meta.env.DEV` |
| Class component maintenance | Low | Single instance per boundary; React officially supports this API |

## Rollback Plan

Remove `<ErrorBoundary>` wrappers from `App.tsx` and `main.tsx`. Delete `ErrorBoundary.tsx` and its test. Remove i18n keys. Components revert to unprotected rendering — zero behavioral dependency on the boundary.

## Dependencies

- React 19 confirmed via Context7 to still require class-based error boundaries (no hook equivalent)

## Success Criteria

- [ ] Render error in one tab shows fallback UI for that tab only; other 6 tabs remain interactive
- [ ] Retry button resets error state and re-renders children correctly
- [ ] Global boundary catches shell-level errors and shows full-screen fallback
- [ ] Console logs error + componentStack in dev mode only
- [ ] Unit tests: error caught → fallback rendered → retry resets → children render again
