# Design: Fix Audit-Docs

## Technical Approach

Pure docs/config remediation — zero source code changes. Four items: fix README CI diagram to match reality, verify coverage threshold, confirm session-file gitignore, and evaluate TASKS.md staleness. All changes are trivially revertible via `git revert`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CI diagram strategy | Fix README to match actual `ci.yml` + add "Future CI" note | Approach 9C (exploration). `ci.yml` runs `pnpm quality` + `pnpm build`; README claimed gitleaks, audit, E2E, deploy (none exist in CI). Deploy is a *separate* workflow (`deploy.yml`, main-only). Not expanding CI per scope constraint. |
| Coverage threshold | Keep `functions: 100` — verified at 260/260 (100%) | `pnpm test:coverage` exits 0. All 580 tests pass. Threshold was already met by pre-SDD fix #5 coverage regeneration. |
| TASKS.md disposition | Keep as historical artifact | 110 lines, all tasks ✅ completed. Last updated 2026-07-24. Academic TFM project — value as implementation log. Stale numbers (578→580 tests) are cosmetic; test count references are informational, not functional. |
| Session-file handling | Verify `.gitignore` pattern; no file deletion | Pattern `session-ses_*` already on line 21 of `.gitignore`. Files are untracked (~960 KB total). No file modification needed. |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `README.md` | Modify | Replace CI/CD diagram (both EN §10 and ES §10): `Push/PR → Quality (format:check + lint + typecheck + test:run) → Build (vite)`. Add "Future CI" note listing gitleaks, pnpm audit, E2E, deploy trigger. Remove false "Protected branches: staging" claim — ci.yml only triggers on `develop`/`main`. |
| `.gitignore` | Verify | Pattern `session-ses_*` already present (line 21). No change needed. |
| `TASKS.md` | None | Evidence-based disposition: keep. |

### README Diff (English §10)

Replace lines 173-183:

```markdown
## 10. CI/CD — Continuous Integration and Delivery

Automated pipeline in **GitHub Actions** (`.github/workflows/ci.yml`):

```
Push/PR → ✅ Quality Gate → 📦 Build
               │
               ├ format:check + lint
               ├ typecheck
               ├ unit tests (580)
               └ build (vite)
```

**Deployment**: separate workflow (`deploy.yml`) deploys to GitHub Pages on push to `main`.

> **Future CI enhancements** (planned, not yet implemented): gitleaks secret scanning, `pnpm audit` dependency check, Playwright E2E tests, deploy-on-tag trigger.
```

Same structure for ES §10 (Spanish translation).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Coverage verification | `pnpm test:coverage` exits 0 with `functions: 100` | Already confirmed (260/260, 580 tests, 60 files). `vite.config.ts` threshold unchanged. |
| Quality gate | `pnpm verify` passes | `pnpm quality` (format:check + lint + typecheck + test:run) + `pnpm build` — already green |

No new tests needed — coverage already at 100%.

## Migration / Rollout

No migration required. All changes are docs/config. Rollback: `git revert`.

---

## Guía de Usuario: Primeros Pasos

### ¿Qué es Nutre-Fit-Dia?

Nutre-Fit-Dia es una aplicación web gratuita que te ayuda a gestionar tu salud si vivís con Diabetes Tipo 2 (DT2). Combina el poder de la **Dieta Mediterránea** con el seguimiento de **actividad física** para crear un ecosistema completo de autocuidado. Además, integra métricas de **sostenibilidad planetaria** — porque cuidar tu salud y cuidar el planeta van de la mano.

No es un sustituto médico. Es una herramienta de acompañamiento basada en evidencia científica (estudios PREDIMED-Plus y ProDiGY, guías AESAN 2022 y OMS).

### 1. Cómo acceder

Abrí `https://nutrefitdia.dev` desde Chrome o Safari en tu móvil. La aplicación es una **PWA** — funciona como una app nativa.

**Para instalarla en tu móvil:**
- **Chrome**: tocá "Añadir a pantalla de inicio" en el menú
- **Safari**: tocá "Compartir → Añadir a inicio"

Una vez instalada, se abre sin barra del navegador y funciona incluso sin conexión.

### 2. Primeros pasos: tu perfil metabólico

Al abrir la app por primera vez, registrá tu perfil:

1. **Edad de diagnóstico de DT2** — filtra las recomendaciones según tu fenotipo clínico
2. **Peso, altura, IMC** — la app calcula automáticamente tu Índice de Masa Corporal
3. **Nivel de glucosa en ayunas** — referencia para los nudges de hiperglucemia

Si tu IMC es mayor a 25, la app aplica un **déficit calórico condicional de 600 kcal** sobre tu objetivo diario, siguiendo el protocolo erMedDiet.

### 3. Escanear alimentos — el semáforo nutricional

El escáner clasifica cada alimento con un semáforo de tres colores:

- 🟢 **Verde**: consumo libre (verduras, legumbres, pescado azul)
- 🟠 **Naranja**: consumo moderado (cereales integrales, frutas, lácteos)
- 🔴 **Rojo**: consumo limitado (carnes rojas, embutidos, bollería)

Cada escaneo también muestra:
- **Azúcares ocultos**: la app detecta azúcares añadidos incluso en productos que no los declaran como tales
- **SafetyAlert**: alertas para frutas de alta carga glucémica
- **Puntuación ambiental**: qué tan sostenible es el alimento (escala 0-100)

### 4. El plan de comidas diario

El **Plan Diario** te organiza las comidas en **3 a 6 tomas** (desayuno, media mañana, almuerzo, merienda, cena, y opcionalmente una colación). Cada comida muestra:
- Las kcal asignadas y el % de tu objetivo diario
- El Aceite de Oliva Virgen Extra (AOVE) es obligatorio en cada comida principal
- Badges culturales UNESCO (🏺 tradición, 👥 convivialidad, 🌿 sostenibilidad)

La app valida que tu consumo cumpla con las frecuencias semanales de la Dieta Mediterránea según la matriz AESAN 2022.

### 5. Actividad física — metas OMS

El **Activity Tracker** te ayuda a cumplir la recomendación de la OMS: **150-300 minutos semanales** de actividad aeróbica moderada, más **2 sesiones de fortalecimiento muscular**.

La app muestra:
- Tu % de cumplimiento semanal
- Racha de semanas consecutivas cumpliendo el objetivo
- Si no llegás a 150 min, los nudges te avisan para ajustar

### 6. Nudges y alertas

El sistema tiene **15 reglas de nudge** que te avisan proactivamente:

- **SafetyAlert**: glucosa fuera de rango, combinaciones riesgosas
- **BehavioralNudge**: te sugiere cambios pequeños — "llevás 3 días sin verduras en la cena, ¿probamos con una ensalada?"
- **SystemAction**: recordatorios de registro, sustituciones inteligentes

Los nudges aparecen en el panel 🔔 con un badge contador. Los podés descartar o marcar como vistos.

Cuando un alimento tiene baja puntuación ambiental (< 30), la app te sugiere automáticamente **3 alternativas más sostenibles** (ej: carne blanca → legumbres + pescado azul).

### 7. Aviso legal

El banner de aviso legal aparece en la parte superior del Dashboard y del Plan. Es un `role="alert"` persistente que dice:

> "Esta aplicación es una herramienta de acompañamiento. No sustituye el diagnóstico, tratamiento ni seguimiento de un profesional de la salud."

Este aviso está visible en todo momento mientras usás la app.

### 8. Sostenibilidad planetaria

La pestaña 🌍 **Eco** te muestra:
- Tu **puntuación ambiental** (escala 0-100, basada en constantes AESAN/EAT-Lancet)
- **Emisiones comparativas** de CO₂ equivalente de tu dieta vs. referencia EAT-Lancet
- **Contador Zero-Waste**: cuántos alimentos feos/imperfectos y de mínimo desperdicio consumiste esta semana (7 alimentos etiquetados ♻️🥕)

La app clasifica los alimentos con una **calificación dual**: salud metabólica + sostenibilidad ambiental. Ambos criterios pesan en las recomendaciones.

---

## Open Questions

- [ ] **OWASP §11 in README** lists `pnpm audit` and `gitleaks` as implemented CI controls — same false claim as §10. Should this be corrected too, or left for a separate change? (Proposal scope only covers CI/CD section explicitly.)
- [ ] **TASKS.md** has stale numbers (578 tests vs actual 580). If keeping as artifact, should we update the header counts or leave as historical snapshot?
