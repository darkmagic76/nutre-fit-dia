# Tasks: Add Formatter

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500-3000 (100+ files reformatted, mostly whitespace/quotes) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | size:exception (mechanical formatting, no logic change) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Install Prettier, config, scripts, update config.yaml | PR 1 | Config-only, no source changes |
| 2 | Run format on all source files, verify tests pass | PR 2 | Mechanical reformat, no logic change |

## Phase 1: Foundation (Config + Tools)

- [x] 1.1 Install `prettier` as devDependency: `pnpm install -D prettier`
- [x] 1.2 Create `.prettierrc` with: singleQuote, trailingComma all, tabWidth 2, printWidth 100, semi true
- [x] 1.3 Create `.prettierignore` excluding: node_modules, dist, coverage, openspec, pnpm-lock.yaml
- [x] 1.4 Add `format` and `format:check` scripts to `package.json`
- [x] 1.5 Update `quality` script to prepend `format:check &&`
- [x] 1.6 Update `openspec/config.yaml` formatter field from `null` to `prettier`

## Phase 2: Apply Formatting

- [x] 2.1 Run `pnpm format` to format all source files

## Phase 3: Verification

- [x] 3.1 Run `pnpm format:check` — must exit 0 (no unformatted files)
- [x] 3.2 Run `pnpm test:run` — all 510 tests must pass
- [x] 3.3 Run `pnpm quality` — all gates pass (format → lint → typecheck → test)
