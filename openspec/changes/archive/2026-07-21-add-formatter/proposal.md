# Proposal: Add Formatter

## Intent

The project has zero formatting tooling — no consistency enforcement despite SKILLS.md requiring it. Add Prettier as the project formatter with a shared config, format scripts, and CI integration.

## Scope

### In Scope
- Install `prettier` as devDependency
- Create `.prettierrc` at root with project conventions (single quotes, trailing commas, 2-space indent, 100 char width)
- Create `.prettierignore` excluding `node_modules/`, `dist/`, `coverage/`, `openspec/`
- Add `format` and `format:check` scripts to `package.json`
- Integrate `format:check` into `quality` pipeline (before lint)
- Run `prettier --write` on all source files once
- Update `openspec/config.yaml` `formatter` field to `prettier`

### Out of Scope
- Editor-specific configs (`.vscode/settings.json`)
- Pre-commit hooks for formatting (`lint-staged`, `husky` integration)
- Custom Prettier plugins
- Formatter for non-JS/TS files (markdown, yaml, css — defaults are fine)

## Capabilities

### New Capabilities
- `formatter`: Code formatting via Prettier with project-wide config, format/format:check scripts, and quality pipeline integration

### Modified Capabilities
- None

## Approach

Install Prettier, write a minimal `.prettierrc` matching existing codebase style, add NPM scripts, integrate into the quality pipeline, then format all files in one pass. Commit formatting changes separately.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add `prettier` dep, `format`/`format:check` scripts, update `quality` |
| `.prettierrc` | New | Root Prettier config |
| `.prettierignore` | New | Exclude build artifacts and generated files |
| `openspec/config.yaml` | Modified | Update `formatter` to `prettier` |
| `src/` | Modified | All files reformatted (one-time) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Formatting diff buries logic changes | Medium | Commit formatting as isolated commit |
| Prettier vs oxlint edge-case conflicts | Low | Run prettier --check before lint; standard configs are compatible |

## Rollback Plan

1. `git revert <format-commit>` to undo formatting changes
2. `pnpm remove prettier` to uninstall
3. Delete `.prettierrc` and `.prettierignore`
4. Revert `package.json` and `openspec/config.yaml` changes

## Dependencies

- None (Prettier is standalone, no peer deps)

## Success Criteria

- [ ] `pnpm format` formats all source files without errors
- [ ] `pnpm format:check` passes on formatted code, fails on unformatted
- [ ] `pnpm quality` includes format check before lint
- [ ] All existing tests pass after formatting
- [ ] `openspec/config.yaml` reflects `formatter: prettier`
