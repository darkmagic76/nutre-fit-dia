# AGENTS.md — NutreFitDia

Contexto de alta señal para agentes trabajando en este repo. Cada línea existe para evitar un error real.

---

## ⛔ REGLA CERO — Skills (leer ANTES de tocar una sola línea de código)

Todo agente DEBE leer los skills en este orden lógico antes de cualquier acción. Son la constitución del proyecto. **NUNCA se incumplen.**

| #   | Skill                                                                      | Cuándo aplica                                          | Scope          |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| 1   | [`skills/scope-rule.md`](skills/scope-rule.md)                             | SIEMPRE — define dónde vive cada cosa                  | Proyecto       |
| 2   | [`skills/container-presentational.md`](skills/container-presentational.md) | Crear o modificar componentes React                    | Proyecto       |
| 3   | [`skills/tdd-strict.md`](skills/tdd-strict.md)                             | Escribir tests o implementar features                  | Semi-universal |
| 4   | [`skills/architecture-decisions.md`](skills/architecture-decisions.md)     | Decisiones de arquitectura, diseño de módulos          | Universal      |
| 5   | [`skills/ddd-analysis.md`](skills/ddd-analysis.md)                         | Analizar requisitos, desambiguar lenguaje              | Universal      |
| 6   | [`skills/code-smells.md`](skills/code-smells.md)                           | Detectar y corregir malas prácticas                    | Universal      |
| 7   | [`skills/work-methodology.md`](skills/work-methodology.md)                 | Roles, ciclo RED→GREEN→REFACTOR, verification pipeline | Proyecto       |
| 8   | [`skills/clean-architecture-audit.md`](skills/clean-architecture-audit.md) | Auditar dependencias, capas, puertos y antipatrones    | Proyecto       |

**El índice completo de skills está en [`skills/README.md`](skills/README.md).**

Si una decisión contradice un skill, el skill tiene razón. Siempre.

---

## Setup & toolchain

- **pnpm obligatorio**. No usar npm ni yarn. El pre-commit hook hardcodea `$HOME/.local/share/pnpm:$PATH`.
- Node: `.nvmrc` dice `22` (autoritativo para dev local). CI usa 22.
- `pnpm install --frozen-lockfile` en CI; localmente `pnpm install`.
- Si después de un `git pull` ves blank screen, corré `pnpm install` — seguro `pnpm-lock.yaml` cambió.

## Comandos esenciales

```bash
pnpm dev              # http://localhost:5173
pnpm test:run         # unit + component (vitest)
pnpm test:watch       # watch mode (TDD)
pnpm test:e2e         # playwright — necesita dev server en :5173
pnpm test:e2e:ui      # playwright interactivo
pnpm quality          # format:check → lint → typecheck → test:run  (en ese orden)
pnpm verify           # quality + build
pnpm build            # tsc -b && vite build  (NO es solo vite build)
```

- `pnpm build` hace `tsc -b` (project references) **antes** de `vite build`. Correr solo `vite build` skipea el typecheck.
- Husky corre `pnpm quality` en **pre-commit** y **pre-push**. Un commit que no pasa no entra.

## Path aliases

Definidos en `tsconfig.app.json` y `vite.config.ts` (deben mantenerse sincronizados):

| Alias               | Path real              |
| ------------------- | ---------------------- |
| `@/*`               | `src/*`                |
| `@features/*`       | `src/features/*`       |
| `@shared/*`         | `src/shared/*`         |
| `@infrastructure/*` | `src/infrastructure/*` |

## Arquitectura de features

**Screaming Architecture**: los directorios gritan dominio de negocio, no tecnología.

```text
src/features/<feature>/
  <Feature>Container.tsx   # lógica, estado, stores — NUNCA JSX directo
  <Feature>View.tsx        # UI puro, recibe props — NUNCA accede a stores
  components/              # sub-componentes específicos de esta feature
  services/                # servicios usados solo por esta feature
  hooks/                   # hooks locales
  store/                   # Zustand store de la feature (si aplica)
  types.ts                 # tipos locales
```

**Scope Rule**: 1 feature usa algo → queda local en esa feature. 2+ features lo usan → va a `shared/`. No mover a shared "por si acaso".

## Testing

- **Vitest config está en `vite.config.ts`** (campo `test`). No hay `vitest.config.ts` separado.
- **Vitest globals**: `describe`, `it`, `expect` sin imports (config: `globals: true`).
- **jsdom + setup.ts**: el setup en `src/test/setup.ts` provee localStorage shim y mock de Web Crypto (AES-GCM con XOR+checksum). Tests que usan `src/infrastructure/storage.ts` (AES-GCM) dependen de este mock exacto.
- **Fixtures**: `makeFood(overrides)`, `makeEntries(category, n)`, `makeCaloricTargetOutput()`, `makeMetricsFormState()`, `makeViolation()`, `makeValidationResult()` en `src/test/fixtures.ts`.
- **Coverage thresholds**: statements 80%, branches 80%, functions 100%, lines 80%. Romper cualquiera = CI rojo.
- **VITE_STORAGE_PREFIX**: el config de tests setea `VITE_STORAGE_PREFIX=nutrefitdia`. Tests de stores que persisten en localStorage necesitan este prefijo.
- **Playwright**: el config arranca `pnpm dev` automáticamente (`webServer`). E2E tests en `e2e/`.

## TypeScript & linting

- `erasableSyntaxOnly: true` — no se permiten enums ni namespaces. Usar `const` objects + tipos derivados.
- `noUnusedLocals: true`, `noUnusedParameters: true` — el compilador rechaza código muerto.
- **Oxlint es mínimo a propósito**: solo `react/rules-of-hooks` (error) y `react/only-export-components` (warn). La disciplina de tipos viene de TS, no del linter.
- Prettier: single quotes, trailing commas, printWidth 100.

## CI/CD

- Push a `develop` → CI (`pnpm quality` + `pnpm build`) → deploy automático al subdirectorio `staging/` de GitHub Pages.
- Push a `main` → CI → deploy producción a GitHub Pages raíz.
- PR a `main` → CI sin deploy.

## UI & i18n

- **UI en español, código en inglés**. Nombres de variables/funciones en inglés, labels y mensajes de error en español.
- i18n es obligatorio: `I18nProvider` wrappea la app, usar `useT()` para cualquier texto visible.
- Testing Library: preferir `getByRole` sobre `getByTestId`.

## Convenciones de dominio

- **Ubiquitous Language**: si el experto dice "Generate Plan", el código es `generatePlan()`, NO `insertRow()`.
- **14 clinical thresholds** en `src/shared/constants/clinical.ts` — fuente única de verdad para valores AESAN/WHO/PREDIMED-Plus.
- **39-food catalog** en `src/shared/data/foods.ts` — catálogo canónico de alimentos AESAN.

## Archivos ignorados (no tocar)

- `.atl/`, `sdd/`, `openspec/` — generados por tooling SDD, en `.gitignore`.
- `sw.js`, `dev-sw.js` — service workers auto-generados por `vite-plugin-pwa`.
- `session-ses_*` — logs de sesión, en `.gitignore`.
- `.env` — nunca commitear; usar `.env.example` como template.

---

## Documentación del proyecto

Cada documento tiene un propósito específico. No duplicar — leer el que aplica.

| Documento                                                                        | Propósito                                                                                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`README.md`](README.md)                                                         | Visión general, features, stack, PWA, CI/CD, OWASP                                                                                     |
| [`SETUP.md`](SETUP.md)                                                           | Instalación paso a paso, troubleshooting                                                                                               |
| [`SPECS_RF.md`](SPECS_RF.md)                                                     | Requisitos funcionales del TFM                                                                                                         |
| [`SPECS_TECH.md`](SPECS_TECH.md)                                                 | Especificaciones técnicas                                                                                                              |
| [`TASKS.md`](TASKS.md)                                                           | Lista de tareas del proyecto                                                                                                           |
| [`INFORME_ADR.md`](INFORME_ADR.md)                                               | Informe completo de Architecture Decision Records                                                                                      |
| [`INFORME_RECOMENDACIONES_DIETETICAS.md`](INFORME_RECOMENDACIONES_DIETETICAS.md) | Informe oficial AESAN 2022 — fuente primaria de recomendaciones dietéticas                                                             |
| [`adr/`](adr/)                                                                   | 11 ADRs individuales + [`FR-MATRIX-trazabilidad.md`](adr/FR-MATRIX-trazabilidad.md) + [`reconciliation.json`](adr/reconciliation.json) |
| [`docs/domain/DDD-INTRO.md`](docs/domain/DDD-INTRO.md)                           | Análisis DDD: bounded contexts, polisemia, desambiguación                                                                              |
| [`openspec/specs/`](openspec/specs/)                                             | 37 especificaciones de dominio (spec-driven development)                                                                               |
| [`docs/slides/`](docs/slides/)                                                   | Presentación PowerPoint del TFM                                                                                                        |
| [`docs/fuentes/`](docs/fuentes/)                                                 | Fuentes y referencias científicas                                                                                                      |
