# PWA Install Specification

## Purpose

Capture the `beforeinstallprompt` event and expose a hook for conditional install UI, with a localStorage cooldown to avoid re-prompting dismissed users. Falls back gracefully on iOS/unsupported browsers.

## Requirements

### Requirement: useInstallPrompt

The system MUST expose a `useInstallPrompt` hook returning `{ isInstallable, install, dismiss }`.

#### Scenario: beforeinstallprompt fires

- GIVEN the browser fires `beforeinstallprompt`
- WHEN `useInstallPrompt` handles the event
- THEN `isInstallable` SHALL be `true`
- AND the deferred prompt SHALL be stored for later use

#### Scenario: Unsupported browser (iOS)

- GIVEN the browser does NOT fire `beforeinstallprompt` (e.g. iOS Safari)
- WHEN `useInstallPrompt` mounts
- THEN `isInstallable` SHALL remain `false`

#### Scenario: Event listener cleanup

- GIVEN `useInstallPrompt` is mounted
- WHEN the component unmounts
- THEN the `beforeinstallprompt` listener SHALL be removed
- AND no memory leaks SHALL remain

### Requirement: install()

The `install()` method SHALL invoke the deferred prompt and clean up after completion.

- GIVEN `isInstallable` is `true` and user clicks install
- WHEN `install()` is called
- THEN `deferredPrompt.prompt()` SHALL be invoked
- AND `deferredPrompt` SHALL be set to `null` after resolution (accept or dismiss)

### Requirement: dismiss()

The `dismiss()` method SHALL set a 7-day localStorage cooldown and hide the install prompt.

#### Scenario: Cooldown suppresses re-prompt

- GIVEN `dismiss()` was called on day 0
- WHEN `useInstallPrompt` checks localStorage 3 days later
- THEN `isInstallable` SHALL be `false`

#### Scenario: Cooldown expires

- GIVEN `dismiss()` was called with timestamp 8 days ago
- WHEN `useInstallPrompt` checks localStorage
- THEN the cooldown SHALL be considered expired
- AND the next `beforeinstallprompt` event SHALL set `isInstallable` to `true`

### Requirement: InstallPrompt component

The `InstallPrompt` component MUST conditionally render based on `isInstallable` and cooldown state.

| Scenario | isInstallable | dismissed (cooldown active) | Expected |
|----------|---------------|-----------------------------|----------|
| Prompt available | `true` | `false` | Rendered |
| Dismissed | `true` | `true` | Hidden |
| Not supported | `false` | any | Hidden |

### Non-functional Requirements

| Area | Constraint |
|------|------------|
| Cooldown accuracy | Timestamps SHALL use `Date.now()`; expiry MUST check `now - stored >= 7 * 86400000` ms |
| Accessibility | Install button SHALL have `aria-label` via i18n key `install.title` |
| Cleanup | Event listener SHALL be removed on unmount (no leaks) |
| Post-install | After `install()` resolves, `isInstallable` SHALL become `false` |
| i18n | InstallPrompt MUST consume 2 keys: `install.title`, `install.dismiss` |
