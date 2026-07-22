# Theme Management Specification

## Purpose

Light/dark/system theme state via React context with localStorage persistence and Tailwind v4 `.dark` class strategy. Mirrors the existing `I18nProvider` pattern: separate context value, provider, and hook files under `shared/theme/`.

## Requirements

### Requirement: ThemeProvider

The system MUST expose a `<ThemeProvider>` component wrapping the application tree and a `useTheme` hook returning `{ theme, resolved, setTheme }`.

- `theme`: user choice — `'light' | 'dark' | 'system'`
- `resolved`: effective mode after resolving `'system'` — `'light' | 'dark'`

#### Scenario: Provider renders children

- GIVEN `ThemeProvider` wraps `<App />`
- WHEN the tree renders
- THEN children render without error

#### Scenario: Missing provider guard

- GIVEN a component calls `useTheme()` outside `ThemeProvider`
- THEN it SHALL throw a descriptive error

### Requirement: Theme resolution

The `resolved` value MUST reflect the effective mode after `prefers-color-scheme` media query resolution when `theme === 'system'`.

| Scenario | theme | prefers-color-scheme | resolved | `.dark` on `<html>` |
|----------|-------|---------------------|----------|---------------------|
| Explicit light | `'light'` | any | `'light'` | absent |
| Explicit dark | `'dark'` | any | `'dark'` | present |
| Follows system dark | `'system'` | dark | `'dark'` | present |
| Follows system light | `'system'` | light | `'light'` | absent |
| Reactive switch | `'system'` | dark→light | updates | toggled |

### Requirement: Persistence

The system MUST persist `theme` to `localStorage` key `nutrefitdia-theme`.

#### Scenario: Theme survives reload

- GIVEN user selected `'dark'`
- WHEN the page reloads
- THEN `ThemeProvider` SHALL read `localStorage` and restore `theme: 'dark'`

#### Scenario: Cold start defaults to system

- GIVEN no `nutrefitdia-theme` in `localStorage`
- WHEN `ThemeProvider` mounts
- THEN `theme` SHALL default to `'system'`

#### Scenario: localStorage unavailable

- GIVEN `localStorage` throws (private browsing, quota exceeded)
- WHEN `ThemeProvider` mounts
- THEN `theme` SHALL default to `'system'` and no error SHALL propagate

### Requirement: Dark flash prevention

The system MUST prevent a flash of light theme when the persisted preference is dark.

- GIVEN `localStorage` key `nutrefitdia-theme` is `'dark'`
- WHEN the page loads
- THEN an inline `<script>` in `index.html` SHALL read localStorage and toggle `.dark` on `<html>` synchronously before React hydration

### Requirement: ThemeToggle component

The system MUST expose a `ThemeToggle` presentational component cycling light → dark → system on each click.

#### Scenario: Three-state cycle

- GIVEN theme is `'light'`
- WHEN user clicks ThemeToggle
- THEN theme SHALL change to `'dark'`
- WHEN user clicks again
- THEN theme SHALL change to `'system'`
- WHEN user clicks again
- THEN theme SHALL change to `'light'`

#### Scenario: Icon reflects current theme

| theme | Icon (aria-label) |
|-------|-------------------|
| `'light'` | ☀️ (`'theme.light'`) |
| `'dark'` | 🌑 (`'theme.dark'`) |
| `'system'` | 🌙 (`'theme.system'`) |

### Requirement: Manifest & Meta theme-color

The system MUST declare both light and dark theme-color for PWA browser chrome.

- `manifest.json` SHALL include `dark_theme_color: "#0c0a09"` (stone-950)
- `index.html` SHALL include both `<meta name="theme-color">` variants using `media="(prefers-color-scheme: ...)"`

### Non-functional Requirements

| Area | Constraint |
|------|------------|
| Bundle size | Theme logic MUST NOT exceed 3 kB gzipped |
| Accessibility | ThemeToggle SHALL include `aria-label` reflecting current mode |
| DOM writes | Each `setTheme()` call SHALL produce exactly one DOM classList write |
| i18n | Theme MUST register 6 keys: `theme.system`, `theme.light`, `theme.dark`, `theme.toggle`, plus 2 for InstallPrompt |
