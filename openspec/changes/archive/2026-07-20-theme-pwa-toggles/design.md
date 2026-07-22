# Design: Theme & PWA Toggles

## Technical Approach

Add dark-mode (light/dark/system 3-state cycle) and PWA install prompt to the header. Theme mirrors the existing `I18nProvider` pattern: `ThemeContextValue.ts` → `ThemeContext.tsx` → `useTheme.ts`. PWA install uses a `useInstallPrompt` hook capturing `beforeinstallprompt` with localStorage 7-day cooldown. Both controls are presentational `shared/ui` components. Tailwind v4 `@custom-variant dark` enables `dark:` utility classes.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| CSS class vs `prefers-color-scheme` media | Class allows user override; media ignores user choice | **Class strategy** (`.dark` on `<html>`) |
| Single context for theme + i18n | Couples concerns; breaks Scope Rule | **Separate `ThemeProvider`** (mirrors `I18nProvider`) |
| Zustand vs React Context for theme | Zustand overkill for 1 scalar; Context + localStorage is sufficient | **React Context** (proven pattern in codebase) |
| Inline anti-flash script | Must be sync before React; CSP `'unsafe-inline'` already present | **`<script>` in `index.html`** before `#root` |
| 3-state cycle order | Light→Dark→System minimizes cognitive surprise | **light → dark → system → light** |
| Cooldown: cookie vs localStorage | Cookie sent to server for no reason | **localStorage** (same pattern as theme) |

## Data Flow

```
Theme:
  localStorage 'nutrefitdia-theme'
       │
       ▼
  ThemeContext.tsx ── reads on mount, falls back to 'system'
       │
       ├── matchMedia('prefers-color-scheme: dark')
       │        │
       │        ▼
       │   resolved = system ? media.matches : theme
       │        │
       │        ▼
       │   document.documentElement.classList.toggle('dark', resolved==='dark')
       │
       └── setTheme(t) → localStorage.setItem + update state

PWA:
  window.addEventListener('beforeinstallprompt', handler)
       │
       ▼
  useInstallPrompt → { isInstallable, install, dismiss }
       │
       ├── install() → deferredPrompt.prompt(), clear
       └── dismiss() → localStorage.setItem('nutrefitdia-install-dismissed', Date.now())
```

## Component Tree (after change)

```
<ThemeProvider>                          ← NEW
  <I18nProvider>
    <App>
      <header>
        <div class="flex gap-2 justify-center">  ← controls bar (NEW)
          <button onClick={toggleLocale}>        ← inline locale toggle (existing, moved into controls bar)
          <ThemeToggle />                ← NEW: 3-state cycle
          <InstallPrompt />             ← NEW: conditional render
        </div>
        <nav role="tablist">...</nav>
      </header>
      <main>...</main>
    </App>
  </I18nProvider>
</ThemeProvider>
```

## Interfaces / Contracts

```ts
// shared/theme/types.ts
type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void            // cycles light→dark→system→light
}

// Cycle logic (inline in ThemeContext.tsx):
// const NEXT: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
// toggleTheme = () => setTheme(NEXT[theme])

// shared/hooks/useInstallPrompt.ts
interface UseInstallPromptReturn {
  isInstallable: boolean
  install: () => Promise<void>
  dismiss: () => void
}

// shared/ui/ThemeToggle.tsx
interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void          // parent calls setTheme(next)
  t: Translations               // for aria-label
}

// shared/ui/InstallPrompt.tsx
interface InstallPromptProps {
  isInstallable: boolean
  onInstall: () => void
  onDismiss: () => void
  t: Translations
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/theme/types.ts` | Create | `Theme`, `ResolvedTheme`, `ThemeContextValue` types |
| `src/shared/theme/ThemeContextValue.ts` | Create | `createContext<ThemeContextValue \| null>(null)` — mirrors `I18nContextValue` |
| `src/shared/theme/ThemeContext.tsx` | Create | Provider: reads localStorage, `matchMedia`, applies `.dark` class, system listener |
| `src/shared/theme/useTheme.ts` | Create | Guarded hook: `useContext(ThemeContext)` with error if missing |
| `src/shared/theme/index.ts` | Create | Barrel exports |
| `src/shared/ui/ThemeToggle.tsx` | Create | Presentational button cycling `light→dark→system` |
| `src/shared/ui/InstallPrompt.tsx` | Create | Conditional install button with dismiss |
| `src/shared/hooks/useInstallPrompt.ts` | Create | `beforeinstallprompt` listener + cooldown check |
| `src/index.css` | Modify | Add `@custom-variant dark (&:where(.dark, .dark *));` |
| `src/main.tsx` | Modify | Wrap `<ThemeProvider>` around `<I18nProvider>` |
| `src/App.tsx` | Modify | Add controls bar, `ThemeToggle`, `InstallPrompt` — refactor locale button into controls div |
| `src/shared/i18n/types.ts` | Modify | Add 6 keys: `theme.system`, `theme.light`, `theme.dark`, `theme.toggle`, `install.title`, `install.dismiss` |
| `src/shared/i18n/es.ts` | Modify | ES: Sistema, Claro, Oscuro, Cambiar tema, Instalar app, Cerrar |
| `src/shared/i18n/en.ts` | Modify | EN: System, Light, Dark, Toggle theme, Install app, Dismiss |
| `src/shared/ui/index.ts` | Modify | Add `ThemeToggle`, `InstallPrompt` exports |
| `public/manifest.json` | Modify | Add `"dark_theme_color": "#0c0a09"` (stone-950) |
| `index.html` | Modify | Anti-flash `<script>` + SHA-256 hash in CSP + dual `theme-color` metas + `dark` class on `<html>` during system-dark |
| `adr/ADR-010-theme-pwa-install.md` | Create | Document dark-mode class strategy, PWA install approach |

## CSS Integration (Tailwind v4)

```css
/* src/index.css — single line addition */
@custom-variant dark (&:where(.dark, .dark *));

/* Usage in components: */
<div className="dark:bg-gray-900 dark:text-stone-100 bg-stone-100 text-stone-900">
```

## Dark Flash Prevention

### CSP Constraint (CRITICAL)

The current CSP has `script-src 'self'` — **no `'unsafe-inline'`**. An inline `<script>` would be blocked. The OWASP-compliant solution is a **hash-based CSP exemption**:

```html
<!-- index.html: add 'sha256-<HASH>' to script-src -->
<meta http-equiv="Content-Security-Policy"
  content="... script-src 'self' 'sha256-<COMPUTED>'; ..." />
```

The SHA-256 hash MUST be computed at implementation time from the exact minified script content.

### Inline script (placed BEFORE `<div id="root">`)

```html
<script>
(function(){try{var t=JSON.parse(localStorage.getItem('nutrefitdia-theme'));if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()
</script>
```

Implementation step: after writing the script, compute `echo -n '<script-content>' | openssl dgst -sha256 -binary | openssl base64` and add to CSP.

### Meta theme-color (both modes)

```html
<meta name="theme-color" content="#f5f5f4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c0a09" media="(prefers-color-scheme: dark)">
```

Replaces the single `<meta name="theme-color" content="#065f46">` on line 8.

## Testing Strategy (Strict TDD)

| Layer | What | Approach |
|-------|------|----------|
| **useTheme.test.ts** (5) | Default system, cycle light→dark→system→light, localStorage persist, matchMedia reactive, missing provider guard | Mock `localStorage` and `matchMedia` via `vi.spyOn`. Render test component inside/outside provider |
| **ThemeContext.test.tsx** (2) | Renders children, applies `.dark` class | `render(<ThemeProvider><div /></>)`, assert `document.documentElement.classList` |
| **ThemeToggle.test.tsx** (3) | Renders current icon, click triggers onToggle, aria-label reflects mode | RTL `fireEvent.click`, assert onToggle called with next theme |
| **useInstallPrompt.test.ts** (4) | Captures event, install() calls prompt, dismiss() sets cooldown, cleanup on unmount | Mock `window.addEventListener`/`removeEventListener`, mock `localStorage` |
| **InstallPrompt.test.tsx** (3) | Shows when installable, hidden when dismissed, hidden when unsupported | Render with different props, assert presence/absence via `toBeInTheDocument` |

## Migration / Rollout

No migration required. Feature is additive — new toggles appear in header on next deploy. `localStorage` key `nutrefitdia-theme` is new; absence defaults to `'system'`. PWA cooldown key `nutrefitdia-install-dismissed` is new; absence means no cooldown.

## Open Questions

- None. All design decisions resolved in specs and ADR-010.
