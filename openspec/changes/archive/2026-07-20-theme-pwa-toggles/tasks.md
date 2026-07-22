# Tasks: Theme & PWA Toggles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~640 (+630 / -10) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation (ADR+CSS+Theme Core+i18n) → PR 2: PWA+UI+App Integration |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | ADR-010 + CSS + Theme Core + i18n keys + tests | PR 1 | base=main. Self-contained: theme types, context, hook, barrel, translations. All theme tests pass independently. |
| 2 | PWA hook + UI toggles + App integration + index.html/manifest | PR 2 | base=main (after PR 1 merges). Depends on ThemeProvider existing in main.tsx, theme i18n keys. |

## Phase 0: ADR

- [x] 0.1 Create `adr/ADR-010-theme-pwa-install.md` — document dark class strategy, separate ThemeProvider, PWA beforeinstallprompt approach, CSP hash exemption

## Phase 1: CSS Foundation

- [x] 1.1 Add `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css` (single line after `@import "tailwindcss"`)

## Phase 2: Theme Core (shared/theme/) — Strict TDD

- [x] 2.1 **RED** Write `src/shared/theme/useTheme.test.ts` — 5 tests: default system, cycle light→dark→system→light, localStorage persist, matchMedia reactive, missing provider guard
- [x] 2.2 **RED** Write `src/shared/theme/ThemeContext.test.tsx` — 2 tests: renders children, applies `.dark` class on `<html>`
- [x] 2.3 Create `src/shared/theme/types.ts` — `Theme`, `ResolvedTheme`, `ThemeContextValue` interfaces
- [x] 2.4 Create `src/shared/theme/ThemeContextValue.ts` — `createContext<ThemeContextValue | null>(null)` mirroring I18nContextValue pattern
- [x] 2.5 **GREEN** Implement `src/shared/theme/ThemeContext.tsx` — provider with localStorage read/write, matchMedia listener, `.dark` class toggle, 3-state cycle via `NEXT` map
- [x] 2.6 **GREEN** Implement `src/shared/theme/useTheme.ts` — guarded hook: `useContext(ThemeContext)` throws descriptive error if null
- [x] 2.7 Create `src/shared/theme/index.ts` — barrel exports (ThemeProvider, useTheme, types)
- [x] 2.8 Run `pnpm test:run` — confirm all 7 theme tests go RED→GREEN

## Phase 3: PWA Install Hook — Strict TDD

- [x] 3.1 **RED** Write `src/shared/hooks/useInstallPrompt.test.ts` — 6 tests (4 original + 2 cooldown spec scenarios) *(PR 2)*
- [x] 3.2 **GREEN** Implement `src/shared/hooks/useInstallPrompt.ts` *(PR 2)*
- [x] 3.3 Run `pnpm test:run` *(PR 2)*

## Phase 4: UI Components — Strict TDD

- [x] 4.1 **RED** Write `src/shared/ui/ThemeToggle.test.tsx` *(PR 2)*
- [x] 4.2 **GREEN** Implement `src/shared/ui/ThemeToggle.tsx` *(PR 2)*
- [x] 4.3 **RED** Write `src/shared/ui/InstallPrompt.test.tsx` *(PR 2)*
- [x] 4.4 **GREEN** Implement `src/shared/ui/InstallPrompt.tsx` *(PR 2)*
- [x] 4.5 Update `src/shared/ui/index.ts` *(PR 2)*
- [x] 4.6 Run `pnpm test:run` *(PR 2)*

## Phase 5: i18n Integration

- [x] 5.1 Add 6 keys to `src/shared/i18n/types.ts` — `theme.system`, `theme.light`, `theme.dark`, `theme.toggle`, `install.title`, `install.dismiss`
- [x] 5.2 Add ES translations `src/shared/i18n/es.ts` — Sistema, Claro, Oscuro, Cambiar tema, Instalar app, Cerrar
- [x] 5.3 Add EN translations `src/shared/i18n/en.ts` — System, Light, Dark, Toggle theme, Install app, Dismiss

## Phase 6: App Integration

- [x] 6.1 Update `index.html` — anti-flash script + SHA-256 CSP + dual theme-color metas *(PR 2)*
- [x] 6.2 Update `public/manifest.json` — add `dark_theme_color` *(PR 2)*
- [x] 6.3 Update `src/main.tsx` — wrap `<ThemeProvider>` around `<I18nProvider>` *(PR 2)*
- [x] 6.4 Update `src/App.tsx` — controls bar with ThemeToggle + InstallPrompt, update tests *(PR 2)*

## Phase 7: Quality Gate

- [x] 7.1 Run `pnpm quality` — lint + typecheck + test:run, fix any failures — **ALL GREEN** (PR 1: +393 tests, PR 2: +406 tests)
- [x] 7.2 Verify against all spec scenarios from theme-management/spec.md — **19/19 scenarios pass** (PR 1)
- [x] 7.3 Verify against all spec scenarios from pwa-install/spec.md — **all scenarios** (cooldown, install, dismiss, cleanup, i18n, accessibility) **COVERED** (PR 2)
