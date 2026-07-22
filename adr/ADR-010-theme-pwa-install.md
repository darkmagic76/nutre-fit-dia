# ADR-010: PWA Install Strategy

**Status:** Superseded — Dark theme removed 2026-07-20 (no clinical value for DT2 app)
**Date:** 2026-07-20
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The `beforeinstallprompt` event allows PWA installation on Chromium-based browsers. We must capture it, defer it, and provide a UI affordance without blocking the user.

**Dark theme decision (removed)**: A manual light/dark/system toggle was implemented initially but later removed. The toggle provided no clinical value for a Type 2 Diabetes management application. Tailwind v4 respects `prefers-color-scheme` natively via media query — no JavaScript needed.

## Decision

### PWA Install: `beforeinstallprompt` Event Capture

The `useInstallPrompt` hook:

1. Listens for `beforeinstallprompt` on `window` (once, in useEffect)
2. Stores the deferred `BeforeInstallPromptEvent` in a ref
3. Returns `{ isInstallable: boolean, install: () => Promise<void>, dismiss: () => void }`
4. `install()` calls `deferredEvent.prompt()` and awaits `userChoice`
5. `dismiss()` sets a 7-day cooldown in localStorage (`nutrefitdia-install-dismissed`)
6. Cleanup removes the event listener on unmount

The cooldown is read on mount — if 7 days have not passed since dismissal, `isInstallable` stays `false` even if the event fires again.

## Consequences

- ✅ PWA install is deferred, non-blocking, and respects user dismissal for 7 days
- ✅ `manifest.json` includes `dark_theme_color: "#0c0a09"` for browser chrome
- ✅ `prefers-color-scheme` media query handles dark mode automatically — no JS, no toggle
- ❌ `beforeinstallprompt` only works in Chromium — other browsers never show the install button

## Traceability

| Requirement                            | Covered by                                 |
| -------------------------------------- | ------------------------------------------ |
| Spec: beforeinstallprompt capture      | useInstallPrompt hook                      |
| Spec: InstallPrompt conditional render | App.tsx renders when isInstallable=true    |
| Spec: 7-day dismiss cooldown           | localStorage nutrefitdia-install-dismissed |
| Design: Non-blocking install           | Deferred prompt, user initiates            |
