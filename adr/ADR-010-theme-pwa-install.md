# ADR-010: Dark Theme & PWA Install Strategy

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The application needs light/dark/system theme toggling and a PWA install prompt. Two design questions arise:

1. **Theme strategy**: Tailwind v4 removed `darkMode: 'class'` from config. The v4 approach uses `@custom-variant dark`. We must decide how to apply `.dark` and how to prevent a flash of light mode on cold load.
2. **PWA install**: The `beforeinstallprompt` event is non-standard and fires only in Chromium-based browsers. We must capture it, defer it, and provide a UI affordance without blocking the user.

## Decision

### Dark Theme: CSS Class Strategy with `@custom-variant dark`

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| `prefers-color-scheme` media only | Ignores user override; cannot toggle independently of OS | ❌ Rejected |
| CSS class `.dark` on `<html>` | Enables user choice; matches Tailwind v4's recommended `@custom-variant` approach | ✅ **Adopted** |
| Zustand store for theme state | Adds dependency for a single boolean; existing codebase uses Context for i18n | ✅ **React Context** (mirrors I18nProvider pattern) |

The theme system mirrors `I18nProvider`:
- `ThemeContextValue.ts` — `createContext<ThemeContextValue | null>(null)`
- `ThemeContext.tsx` — provider: reads `localStorage('nutrefitdia-theme')`, listens to `matchMedia('prefers-color-scheme: dark')`, toggles `.dark` on `<html>`
- `useTheme.ts` — guarded hook with descriptive error

**3-state cycle**: `light → dark → system → light`. The `NEXT` map is a `Record<Theme, Theme>` inline constant. `'system'` resolves the effective mode via `matchMedia`, so the user's OS setting is respected as the middle-ground state.

**Dark flash prevention**: An inline `<script>` before `<div id="root">` reads localStorage synchronously and applies `.dark` before React hydrates. The script is exempted from CSP via a SHA-256 hash, not `'unsafe-inline'`.

### Separate ThemeProvider (NOT merged with I18nProvider)

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Combine ThemeProvider into I18nProvider | Couples theme to i18n; violates Scope Rule — theme is used by UI, i18n is used by everything | ❌ Rejected |
| Separate ThemeProvider wrapping I18nProvider | Clean separation; theme does not need i18n and vice versa | ✅ **Adopted** |

The component tree becomes:
```
<ThemeProvider>
  <I18nProvider>
    <App>...</App>
  </I18nProvider>
</ThemeProvider>
```

### PWA Install: `beforeinstallprompt` Event Capture

The `useInstallPrompt` hook:
1. Listens for `beforeinstallprompt` on `window` (once, in useEffect)
2. Stores the deferred `BeforeInstallPromptEvent` in a ref
3. Returns `{ isInstallable: boolean, install: () => Promise<void>, dismiss: () => void }`
4. `install()` calls `deferredEvent.prompt()` and awaits `userChoice`
5. `dismiss()` sets a 7-day cooldown in localStorage (`nutrefitdia-install-dismissed`)
6. Cleanup removes the event listener on unmount

The cooldown is read on mount — if 7 days have not passed since dismissal, `isInstallable` stays `false` even if the event fires again.

### CSP Hash Exemption

The current CSP has `script-src 'self'` — no `'unsafe-inline'`. Adding an inline `<script>` for dark flash prevention requires a SHA-256 hash exemption:

```html
<meta http-equiv="Content-Security-Policy"
  content="... script-src 'self' 'sha256-<COMPUTED>'; ..." />
```

The hash is computed at implementation time from the minified script body.

## Consequences

- ✅ User can override OS theme preference with an explicit light or dark choice
- ✅ `'system'` mode respects OS setting and reacts to live changes via `matchMedia` listener
- ✅ `localStorage` persistence means theme survives page reloads without network
- ✅ No flash of light theme on cold load when user prefers dark (inline script runs before React)
- ✅ CSP remains secure — no `'unsafe-inline'`, only a specific hash for the known inline script
- ✅ PWA install is deferred, non-blocking, and respects user dismissal for 7 days
- ❌ Theme context adds a second provider wrapper (minor nesting increase)
- ❌ `beforeinstallprompt` only works in Chromium — other browsers never show the install button

## Traceability

| Requirement | Covered by |
|---|---|
| Spec: ThemeProvider renders children | ThemeContext.tsx wraps children |
| Spec: Missing provider guard | useTheme throws descriptive error |
| Spec: Theme resolution 3-state | NEXT map: light→dark→system→light |
| Spec: Persistence to localStorage | Read on mount, write on setTheme |
| Spec: Cold start defaults to system | Default `'system'` if no localStorage key |
| Spec: Dark flash prevention | Inline script + CSP SHA-256 hash |
| Spec: ThemeToggle 3-state cycle | Presentational component, parent calls setTheme |
| Spec: Manifest dark_theme_color | manifest.json `dark_theme_color: "#0c0a09"` |
| Design: React Context | Mirror of I18nProvider pattern |
| Design: Tailwind v4 @custom-variant dark | `src/index.css` line after `@import "tailwindcss"` |
