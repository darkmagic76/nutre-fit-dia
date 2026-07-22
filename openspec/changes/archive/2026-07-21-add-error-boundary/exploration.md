## Exploration: Add ErrorBoundary

### Current State

**No ErrorBoundary exists anywhere in the codebase.** The app mounts via `main.tsx`:

```
StrictMode → I18nProvider → App
```

`App.tsx` renders 7 feature containers inside a tabbed dashboard pattern. If **any** container throws during render — e.g., a zustand store that hasn't initialized, a missing `foodsById.get()`, a null pointer in a view — the **entire SPA crashes**. The user sees a white screen with no recovery path.

The project already has domain-level error classes (`shared/errors.ts`: `DomainError`, `ValidationError`, `NotFoundError`), but these are used via `throw` in service logic — **never caught at the UI boundary**. No `try/catch` patterns exist in any container `.tsx` file. The 0 error-resilience is confirmed by:

- `grep ErrorBoundary` → 0 results
- `grep try {` in `src/features/**/*.tsx` → 0 results
- All 7 containers are thin wrappers that assume stores/services will always return valid data

**React 19 has no built-in ErrorBoundary component.** The official pattern remains a class component using `getDerivedStateFromError` + `componentDidCatch`. This is confirmed by React 19 docs on Context7.

### Affected Areas

| File | Impact |
|------|--------|
| `src/shared/ui/ErrorBoundary.tsx` | **CREATE** — class component with `getDerivedStateFromError`/`componentDidCatch` + retry |
| `src/shared/ui/ErrorBoundaryFallback.tsx` | **CREATE** — presentational fallback UI (or inline in ErrorBoundary) |
| `src/shared/ui/index.ts` | **MODIFY** — export `ErrorBoundary` |
| `src/App.tsx` | **MODIFY** — wrap each tab container in per-tab `<ErrorBoundary>` |
| `src/main.tsx` | **MODIFY** — add global `<ErrorBoundary>` as outermost wrapper |
| `src/shared/i18n/types.ts` | **MODIFY** — add error boundary translation keys |
| `src/shared/i18n/en.ts` | **MODIFY** — English error boundary messages |
| `src/shared/i18n/es.ts` | **MODIFY** — Spanish error boundary messages |

### Approaches

#### 1. Global-only ErrorBoundary (single boundary in main.tsx)

Wrap `<I18nProvider><App /></I18nProvider>` with one `<ErrorBoundary>`.

- **Pros**: Minimal change — 1 file modified, 1 file created
- **Cons**: ANY error (header, footer, OR any tab) kills the entire SPA. The 7-tab isolation requirement is NOT met.
- **Effort**: Low

#### 2. Per-tab ErrorBoundary (wrap each container in App.tsx)

Wrap each `{tab === 'x' && <Container />}` with its own `<ErrorBoundary>`.

- **Pros**: One tab's render error does NOT affect the other 6. Tab nav stays functional. User can retry a single tab.
- **Cons**: No protection for the app shell (header/nav/footer). If the shell itself throws, the whole app dies. No catch-all.
- **Effort**: Medium

#### 3. Global + Per-tab (hybrid — RECOMMENDED)

Add a global `<ErrorBoundary>` in `main.tsx` + per-tab boundaries in `App.tsx`.

- **Pros**: Full protection. Shell errors caught globally, tab errors isolated per-tab. Retry per-tab preserves dashboard UX.
- **Cons**: Slightly more code (2 insertion points). Still low complexity.
- **Effort**: Low

### Recommendation

**Approach 3 — Global + Per-tab hybrid.** This is the correct granularity for a 7-tab dashboard:

1. A **global ErrorBoundary in `main.tsx`** protects the app shell (header, navigation, footer, i18n context). If the shell itself breaks, the global fallback shows a full-screen "App crashed — reload" message.
2. **Per-tab ErrorBoundary in `App.tsx`** wrapping each of the 7 containers. If the metabolic tracker tab crashes, the other 6 tabs remain fully interactive.

**Fallback UI design (minimal):**

```
╔══════════════════════════════════╗
║  ⚠️  Something went wrong        ║
║                                  ║
║  This section encountered an     ║
║  unexpected error. We've logged  ║
║  it for review.                  ║
║                                  ║
║  [ 🔄 Try again ]               ║
╚══════════════════════════════════╝
```

- Variant A (per-tab): Card-style, inline, `role="alert"`. Retry resets `hasError` state → re-renders children.
- Variant B (global): Centered full-screen overlay with `role="alert"`. Only "Reload app" button (calls `window.location.reload()`).
- Both: Log `error` + `componentStack` to `console.error` for debugging. No sensitive info leaks.
- i18n keys: `error.boundary.title`, `error.boundary.description`, `error.boundary.retry`, `error.boundary.globalReload`.

**Technical design for the ErrorBoundary component:**

```tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
```

**Scope Rule** justifies `shared/ui/ErrorBoundary.tsx`: Error boundaries are inherently cross-cutting — they protect ALL features, so they must live in shared. The boundary has lifecycle logic (class component) AND renders fallback UI. Put it in `shared/ui/` since it ultimately renders a React node and follows the existing pattern of `shared/ui/` housing all render-outputting shared code.

### Risks

1. **Console leak**: `componentDidCatch` logs the full error + stack. In production, ensure `console.error` is acceptable or gate behind `import.meta.env.DEV`.
2. **Retry false recovery**: If the error is persistent (e.g., missing data source), retry will immediately re-crash. The user needs a way to escape — the fallback should be dismissable by navigating to another tab. Per-tab boundaries naturally handle this since the user can just click a different tab.
3. **Memory**: Class component pattern is fine for a single instance. With 8 instances (1 global + 7 per-tab), each maintains `hasError` state — negligible overhead (< 1KB total).
4. **Test coverage**: The ErrorBoundary needs a test that renders children that throw, verifies the fallback appears, and verifies retry works.

### Ready for Proposal

**Yes.** The exploration is complete. All code paths have been read. The approach is clear. Tell the orchestrator to proceed with `sdd-propose`.
