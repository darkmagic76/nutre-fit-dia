# Scope Rule — Law of Scope

## Unbreakable Rule

**"Scope determines structure"** — the scope determines the structure.

1. Code used by **2+ features** → `shared/` (global)
2. Code used by **1 feature** → local in that feature
3. **No exceptions** — this rule is absolute and non-negotiable

## Screaming Architecture

The structure must immediately COMMUNICATE what the application does:

- Feature names describe business functionality, not technical implementation
- The directory structure tells the app's story at a glance
- Container components must have the same name as their feature

## Decision Framework

When analyzing where to place a component:

1. **Count usages**: identify exactly how many features use the component
2. **Apply the rule**: 1 feature = local, 2+ features = shared
3. **Validate**: the structure must scream functionality
4. **Document**: explain WHY that location was chosen

## Edge Cases

- If in doubt about future use: start local, refactor to shared when needed
- Borderline utilities: analyze real imports, not hypothetical use
- If domain logic repeats, do not move to shared without refactoring into `shared/domain-utils` under architecture approval
