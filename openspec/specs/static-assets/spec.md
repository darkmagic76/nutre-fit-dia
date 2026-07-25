# static-assets Specification

## Purpose

Static asset configuration for GitHub Pages deployment under the `/nutre-fit-dia/` subpath. Covers Vite base path, PWA manifest URL correction, and relative links.

## Requirements

### Requirement: BASE-PATH

`vite.config.ts` MUST include `base: '/nutre-fit-dia/'` so all asset references in production builds are prefixed correctly for the GitHub Pages subpath.

#### Scenario: Built index.html uses correct asset paths

- GIVEN `base: '/nutre-fit-dia/'` is set in `vite.config.ts`
- WHEN `pnpm build` runs
- THEN `<script>` and `<link>` tags in `dist/index.html` SHALL reference `/nutre-fit-dia/assets/...`

### Requirement: MANIFEST-PATHS

`public/manifest.json` MUST use `/nutre-fit-dia/` prefix for `start_url`, `scope`, and icon `src` paths.

#### Scenario: Manifest URLs are subpath-aware

- GIVEN `base` is set to `/nutre-fit-dia/`
- WHEN `manifest.json` is served from the deployed site
- THEN `start_url` SHALL be `"/nutre-fit-dia/"`
- AND `scope` SHALL be `"/nutre-fit-dia/"`
- AND icon `src` SHALL be `"/nutre-fit-dia/favicon.svg"`

### Requirement: SECURITY-TXT

The security.txt link in `src/App.tsx` MUST use a relative path so it resolves correctly on the subpath deployment.

#### Scenario: Footer link uses relative path

- GIVEN the footer renders the security link
- WHEN the `<a>` element is inspected
- THEN its `href` attribute SHALL be `".well-known/security.txt"` (relative, no leading slash)
