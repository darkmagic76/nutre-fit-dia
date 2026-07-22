# Proposal: Theme & PWA Toggles

## Intent

Add dark mode (light/dark/system) and PWA install to the header. Both are missing UX baselines.

## Scope

### In Scope
- 3-state dark toggle via Tailwind v4 class strategy
- `ThemeProvider` + `useTheme` (mirrors `I18nProvider`)
- PWA: conditional `beforeinstallprompt` handler, 7-day cooldown
- `ThemeToggle` + `InstallPrompt` in `shared/ui/`
- i18n keys (6 theme + 2 install), manifest + meta updates
- ADR-010

### Out of Scope
- Theme-color transitions, PWA update prompt

## Capabilities

### New Capabilities
- `theme-management`: Theme state, context provider, useTheme hook
- `pwa-install`: Install prompt capture, conditional render, cooldown

### Modified Capabilities
- None.

## Approach

1. **Theme**: `@custom-variant dark` in CSS, `ThemeProvider` wraps `<App>`, `.dark` on `<html>`, `localStorage` persistence.
2. **PWA**: `useInstallPrompt` captures event, renders button conditionally, 7-day cooldown.
3. **Layout**: Toggles in header before locale button.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/index.css` | +1 line: `@custom-variant dark` |
| `src/main.tsx` | Wrap with `<ThemeProvider>` |
| `src/App.tsx` | Add toggles to header |
| `shared/theme/` | New (types, context, hook) |
| `shared/ui/ThemeToggle.tsx` | New (3-state) |
| `shared/ui/InstallPrompt.tsx` | New (install button) |
| `shared/hooks/useInstallPrompt.ts` | New |
| `shared/i18n/` | +8 keys |
| `shared/ui/index.ts` | +2 exports |
| `public/manifest.json` | +dark_theme_color |
| `index.html` | +dark theme-color meta |
| `adr/ADR-010-*.md` | New |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| iOS no beforeinstallprompt | High | Conditional render |
| Dark flash on reload | Low | Pre-read localStorage |
| Tailwind v4 custom-variant | Low | Stable in v4.3.2 |

## Rollback Plan

Revert `index.css`, `main.tsx`, `App.tsx`; delete `shared/theme/`, new UI + hook files; revert i18n/manifest/meta/exports; delete ADR-010.

## Dependencies

None external. Tailwind v4 + browser API.

## Success Criteria

- [ ] ThemeToggle cycles light→dark→system
- [ ] `.dark` class on `<html>` matches mode
- [ ] Preference survives reload
- [ ] InstallPrompt only shows on `beforeinstallprompt`
- [ ] Cooldown suppresses prompt 7 days
- [ ] ThemeProvider + I18nProvider compose cleanly
- [ ] `pnpm test:run` passes
