## Exploration: Add Formatter

### Current State
The project has **zero formatting tooling**. `package.json` scripts include `lint` (oxlint), `typecheck`, `test:run`, `quality` (lint + typecheck + test:run), and `verify` (quality + build). `openspec/config.yaml` explicitly lists `formatter: null`.

No `.prettierrc`, `prettier.config.*`, or `.prettierignore` exists anywhere. No format scripts in `package.json`. `.gitignore` has no format-related entries.

Codebase conventions detected: **single quotes**, **trailing commas**, **2-space indent**, **semicolons** — consistent across all source files.

### Affected Areas
- `package.json` — add `format` and `format:check` scripts; integrate `format:check` into `quality`
- `.prettierrc` — new file (root config)
- `.prettierignore` — new file (exclusions)
- `.gitignore` — optionally add `.prettierignore` if needed
- `openspec/config.yaml` — update `formatter` field to `prettier`
- All `src/` files — formatted once on first run

### Approaches
1. **Prettier** — industry-standard formatter, widest ecosystem support, zero-config options, integrates with every editor and CI tool
   - Pros: Universal, well-known, hooks into oxlint via `oxlint --deny-warnings` + `prettier --check`, 53M+ weekly downloads
   - Cons: One more devDependency; occasional formatting opinion mismatches with oxlint (resolved via `.prettierrc` alignment)
   - Effort: Low

2. **oxlint formatter (oxfmt)** — uses same binary as existing linter, fewer dependencies
   - Pros: No new dependency, consistent toolchain, faster execution
   - Cons: **oxlint does not include a formatter** — `oxlint` is lint-only. No stable oxfmt exists for JS/TS. Unknown ecosystem support, no editor integration
   - Effort: High (unsupported)

### Recommendation
**Prettier**. oxlint is lint-only — no formatter exists in the oxlint toolchain. Prettier is the de facto standard, has mature editor integrations, and the config is trivially simple for this project.

### Risks
- Prettier formatting may conflict with oxlint rules on first run. Mitigation: run `prettier --check` before `oxlint` in quality pipeline; Prettier formatting is purely stylistic, oxlint enforces logic rules — overlap is minimal with standard defaults
- One-time diff noise from formatting all existing files. Mitigation: commit formatting as its own commit to isolate from logic changes

### Ready for Proposal
Yes — simple, low-risk, well-understood configuration change.
