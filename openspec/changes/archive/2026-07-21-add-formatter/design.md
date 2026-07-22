# Design: Add Formatter

## Technical Approach

Install Prettier as a devDependency, create a minimal `.prettierrc` matching the project's existing code style, add NPM scripts for format/format:check, integrate into the quality pipeline, and format all source files in a single pass.

## Architecture Decisions

### Decision: Prettier over oxlint formatter

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Prettier | + Industry standard, editor integrations, mature | ✅ **Chosen** |
| oxlint | − No formatter exists in oxlint for JS/TS | ❌ Not viable |

**Rationale**: oxlint is lint-only. Prettier is the de facto standard with zero-config setup.

### Decision: Config-only `.prettierrc` (no plugins)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Plain `.prettierrc` | + Zero dep, 5 fields, works immediately | ✅ **Chosen** |
| `@ianvs/prettier-config` or similar | − Adds dependency, overkill for this project | ❌ Not needed |

**Rationale**: The project needs only 5 config options. A shared config package is unnecessary complexity.

### Decision: `format:check` runs before `lint` in quality pipeline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| format → lint → typecheck → test | + Catches style issues first, fastest feedback | ✅ **Chosen** |
| lint → format → typecheck → test | − Formatting feedback delayed after lint | ❌ Slower feedback |

**Rationale**: Formatting check is fastest and most superficial — fail early, fail fast.

## Data Flow

```
User runs pnpm quality
  └── format:check (prettier --check .)
        ├── FAIL → exit 1 (report unformatted files)
        └── PASS → lint (oxlint)
                    └── PASS → typecheck (tsc -b --noEmit)
                                └── PASS → test:run (vitest run)
                                            └── PASS → exit 0
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.prettierrc` | Create | Root Prettier config (JSON) |
| `.prettierignore` | Create | Exclude node_modules, dist, coverage, openspec |
| `package.json` | Modify | Add devDep + scripts + update quality |
| `openspec/config.yaml` | Modify | Update formatter field to prettier |
| `src/` files | Modify | All reformatted (one-time) |

## Config Detail

### `.prettierrc`
```json
{
  "singleQuote": true,
  "trailingCommas": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

### `.prettierignore`
```
node_modules
dist
coverage
openspec
```

### `package.json` script changes
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "quality": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:run"
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | N/A | Prettier is config-only; no unit tests for configuration |
| Integration | format:check passes after format | Run `pnpm format && pnpm format:check` — must exit 0 |
| Integration | quality fails on unformatted | Introduce intentional format violation, run `pnpm quality` — must fail |
| Regression | All tests pass after format | Run `pnpm verify` — must exit 0 |

## Migration / Rollout

Formatting commit MUST be isolated (no logic changes in same commit). Commit order:

1. Install Prettier, create config files, add scripts
2. Run `pnpm format` and commit reformatted files
3. Run `pnpm verify` to confirm everything passes

## Open Questions

- None
