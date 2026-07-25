[🇪🇸 Español](#español) | [🇬🇧 English](#english)

---

<div id="english">

# Nutre-Fit-Dia — Comprehensive Self-Care Ecosystem for Type 2 Diabetes and Sustainable Health

## Project Overview

### Scope and Framework

This project is the **Master's Thesis (TFM) for the Master in AI Development at BIGSchool and Universidad Isabel I.**

It is built on **Mediterranean Diet (MD)-based Nutrition and Daily Exercise**, creating a **Comprehensive Self-Care Ecosystem for Type 2 Diabetes (T2D) and Sustainable Health.**

## Project Presentation

- [PowerPoint Presentation](docs/slides/Nutre-Fit-Dia_Metabolic_Architecture.pptx)
- [Presentation Video](https://youtu.be/RSCQ3jXF96A)

## Tech Stack

| Technology            | Version  | Purpose                                         |
| --------------------- | -------- | ----------------------------------------------- |
| React                 | 19.2.7   | UI Components (Container/Presentational)        |
| TypeScript            | 6.0.2    | Type safety, erasableSyntaxOnly                 |
| Vite                  | 8.1.1    | Dev server and builds                           |
| Tailwind CSS          | 4.3.2    | CSS utility-first (Vite plugin)                 |
| Zod                   | 4.4.3    | Runtime validation with type inference          |
| Zustand               | 5.0.8    | State management — one store per feature        |
| Supabase JS           | 2.87.3   | BaaS: PostgreSQL, Auth, Storage (V1)            |
| Vitest                | 4.1.10   | Unit and component test runner                  |
| Testing Library React | 16.3.2   | Behavioral component testing                    |
| Oxlint                | 1.71.0   | Rust-based linting                              |
| Prettier              | 3.7.4    | Code formatter                                  |
| jsdom                 | 29.1.1   | Browser environment for tests                   |
| Playwright            | 1.61.1   | E2E tests — full user flow                      |
| PWA                   | Manifest | Installable as mobile app (offline-ready)       |
| GitHub Actions        | CI/CD    | Lint → Typecheck → Tests → Build → E2E → Deploy |
| pnpm                  | —        | Fast, disk-efficient package manager            |

## Installation and Running

```bash
# Install
git clone <repo-url>
cd nutre-fit-dia
pnpm install

# Development
pnpm dev              # HTTPS (self-signed cert via @vitejs/plugin-basic-ssl)
pnpm dev:http          # HTTP without cert (debug only)

# Tests (TDD)
pnpm test:run        # Unit and component tests
pnpm test:coverage   # With coverage
pnpm test:e2e        # End-to-end tests with Playwright
pnpm test:e2e:ui     # E2E interactive mode

# Quality
pnpm quality         # format:check + lint + typecheck + tests
pnpm verify          # quality + build
```

## Project Structure

```text
src/
├── features/
│   ├── nutritional-traffic-light/       # Nutritional Traffic Light + Dual Scan (H4)
│   │   ├── ScannerContainer.tsx          # Logic: state, store, handlers
│   │   ├── ScannerView.tsx               # Pure UI: props, no store
│   │   ├── store/scannerStore.ts         # Scan history (Zustand)
│   │   └── services/                     # classificationService, occultSugarDetector, safetyCheck
│   ├── metabolic-tracker/               # Phenotypic profile + biomarkers
│   │   ├── MetabolicTrackerContainer.tsx # Logic: metabolic profile
│   │   ├── MetabolicTrackerView.tsx      # UI: form + results
│   │   ├── components/                   # ProfileForm, ProfileResults, ProfileError
│   │   ├── store/trackerStore.ts         # Profile + caloric target (Zustand)
│   │   └── services/                     # caloricTargetService, biomarkerTrackingService
│   ├── med-diet-validator/              # AESAN 2022 validation
│   │   ├── DailyLogContainer.tsx         # Logic: daily log
│   │   ├── DailyLogView.tsx              # UI: food list + validation
│   │   ├── components/                   # FoodList, DailyViolations, CaloricSummary
│   │   └── store/logStore.ts             # todayLog + validation (Zustand)
│   ├── recipe-engine/                   # Weekly erMedDiet plan + M7 meal splitting
│   │   ├── PlanContainer.tsx             # Logic: weekly plan
│   │   ├── PlanView.tsx                  # UI: checkbox + generated plan
│   │   ├── store/planStore.ts            # weeklyPlan (Zustand)
│   │   └── services/                     # planGenerator
│   ├── activity-tracker/                # WHO 150-300 min + strength (ADR-006) ✅
│   │   ├── ActivityTrackerContainer.tsx  # Logic: compliance + streak
│   │   ├── ActivityTrackerView.tsx       # UI: WHO goals + form
│   │   ├── hooks/useActivityTracker.ts   # Hook: compliance %, streak, weeklyGoal
│   │   ├── store/activityStore.ts        # weeklyMinutes + entries (Zustand)
│   │   └── types.ts                      # ActivityEntry, WeeklyGoal, ComplianceReport
│   ├── nudge-engine/                    # 15 rules + panel UI (ADR-008) ✅
│   │   ├── NudgePanelContainer.tsx       # Logic: pending nudges + history
│   │   ├── NudgePanelView.tsx            # UI: list + dismiss + counter badge
│   │   ├── engine.ts                     # buildNudgeContext + evaluateRules (pure)
│   │   ├── rules.ts                      # SafetyAlert + BehavioralNudge + SystemAction
│   │   ├── cooldownTracker.ts            # CooldownTracker (in-memory)
│   │   ├── store/nudgeStore.ts           # pending + history (Zustand)
│   │   └── types.ts                      # NudgeRule, NudgeContext, SafetyRule
│   └── sustainability/                  # Eco Dashboard + scoring (ADR-007) ✅
│       ├── SustainabilityContainer.tsx   # Logic: scoring + zero-waste + emissions
│       └── SustainabilityView.tsx        # UI: sustainability tabs
├── shared/
│   ├── data/foods.ts                     # 34-food AESAN catalog
│   ├── domain/                           # FoodCategory, Food (Zod), TrafficLight, Notification
│   ├── errors.ts                         # DomainError, ValidationError, NotFoundError
│   ├── hooks/                            # Cross-feature hooks
│   ├── i18n/                             # ES/EN (useT, I18nProvider, 80+ keys)
│   ├── services/rationValidator.ts       # Daily/weekly validation
│   ├── sustainability/                   # EnvironmentalScore, substitutionService, constants
│   ├── ui/                               # Card, SelectField, TabButton, StatCard, LegalDisclaimer, etc.
│   └── utils/                            # sanitize, imc, enum helpers
├── infrastructure/
│   └── ml/                               # ScannerAdapter + MockScannerAdapter (ADR-003)
└── test/
    ├── setup.ts                          # Testing Library + jsdom
    └── fixtures.ts                       # makeFood factory
```

## Key Features

- **Nutritional Traffic Light**: Classifies foods as Green/Orange/Red. Detects hidden sugars. SafetyAlert for high-glycemic-load fruits. **Dual Rating** (health + sustainability) integrated.
- **Metabolic Tracker**: Calculates caloric target with conditional deficit (BMI > 25). Phenotypic profile. Glucose and biomarker tracking.
- **Mediterranean Diet Validator**: Validates daily/weekly frequencies per AESAN 2022 matrix. Exact gram-portion control.
- **Recipe Engine**: Weekly plans with caloric restriction. Dual health+sustainability ranking. **3-6 daily meal split** with kcal per meal. UNESCO cultural badges (🏺👥🌿). AOVE mandatory in every main meal.
- **Activity Goal Tracker**: WHO 150-300 min/week tracking. Compliance % and streak. Dashboard tab.
- **Nudge Engine**: 15 rules (SafetyAlert + BehavioralNudge + SystemAction). Panel UI with counter badge + engagement history. Smart substitution (M2): sustainable alternatives when environmentalScore < 30.
- **Sustainability Scoring**: `computeEnvironmentalScore()` with AESAN/EAT-Lancet constants. Configurable 50/30/20 weights. Integrated into RecipeEngine (dual ranking).
- **Substitution Service**: `suggestAlternative(food)` — WHITE_MEAT → LEGUMES + blue FISH (AESAN 2.4.2.1). Environmental score ranking. Top 3 alternatives.
- **Conviviality**: UNESCO textual suggestions in PlanView: "Ideal for sharing meals" + cooking techniques (stew, steam, boil, grill, raw).
- **Zero-Waste**: `isUglyProduce` + `isZeroWaste` in FoodSchema. Badges ♻️🥕 in PlanView. 7 foods tagged as zero-waste.
- **Sustainability Dashboard**: 🌍 Eco tab with environmental score (50/30/20), comparative EAT-Lancet emissions, and Zero-Waste counter. Responsive layout.

## Architecture & Development Rules

Core principles and development rules live in dedicated, modular files — loaded per-context to save tokens and keep focus:

| Resource                             | Content                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [`skills/`](skills/)                 | Development rules: Scope Rule, TDD, DDD, architecture decisions, code smells, work methodology |
| [`adr/`](adr/)                       | 11 Architecture Decision Records with traceability matrix                                      |
| [`openspec/specs/`](openspec/specs/) | 24 domain specifications (spec-driven development)                                             |
| [`docs/domain/`](docs/domain/)       | DDD analysis: bounded contexts, polysemy detection, semantic untangling                        |

### Implementation Phases (Complete ✅)

1. **Domain Modeling** — Strict types: metabolic profiles, AESAN portions, food types, notifications
2. **Domain Services & Containers** — erMedDiet logic, Container/Presentational split, Zustand stores
3. **ADR Scaffolding** — ScannerAdapter, Activity Tracker, Sustainability, Nudge Engine
4. **Tests & Error Handling** — 580 tests (60 files), 100% lines coverage, i18n ES/EN, ErrorBoundary
5. **E2E & Accessibility** — Playwright smoke tests, WCAG 2.1 AA compliance

### Clinical Foundation

Built on **erMedDiet** (energy-reduced Mediterranean Diet) with evidence from **PREDIMED-Plus** and **ProDiGY** studies. Enforces 600 kcal conditional deficit (BMI > 25) with phenotypic filtering by diagnosis age. All clinical thresholds centralized in `src/shared/constants/clinical.ts` with AESAN/WHO citations.

## PWA — Mobile Device Installation

The application is a **Progressive Web App (PWA)**. It installs directly from the browser without app stores:

1. Open `https://nutrefitdia.dev` in Chrome/Safari mobile
2. Tap **"Add to Home Screen"** (Chrome) or **"Share → Add to Home Screen"** (Safari)
3. The app opens in standalone mode (no browser chrome)

**PWA files:** `public/manifest.json` | `public/favicon.svg` | `index.html` (theme-color + apple-touch-icon)

## 10. CI/CD — Continuous Integration and Delivery

Automated pipeline in **GitHub Actions** (`.github/workflows/ci.yml`):

```
Push/PR → 🔒 Security Audit → ✅ Quality Gate → 🎭 E2E → 🚀 Deploy
              │                    │
                ├ pnpm audit         ├ format:check + lint + typecheck
                └ gitleaks           ├ unit tests (578)
                                    └ build (vite)
```

**Protected branches:** `staging` (pre-production) ← `develop` ← features

## 11. OWASP 2025 Security

| Control                       | Implementation                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| CSP (Content-Security-Policy) | `default-src 'self'`, no inline scripts, frame-ancestors 'none'                                                                 |
| X-Content-Type-Options        | `nosniff` — prevents MIME sniffing                                                                                              |
| Referrer-Policy               | `strict-origin-when-cross-origin`                                                                                               |
| Permissions-Policy            | Camera, geolocation, microphone disabled                                                                                        |
| Base-uri                      | `'self'` — prevents <base> injection                                                                                            |
| Form-action                   | `'self'` — prevents form hijacking                                                                                              |
| Dependency audit              | `pnpm audit --audit-level=high` in CI                                                                                           |
| Secret scanning               | Gitleaks in CI                                                                                                                  |
| Security.txt                  | `/.well-known/security.txt` (RFC 9116)                                                                                          |
| Runtime validation            | Zod schemas on all inputs                                                                                                       |
| HTML sanitation               | No `dangerouslySetInnerHTML`, no `eval()`                                                                                       |
| HTTPS                         | `@vitejs/plugin-basic-ssl` (default, via `pnpm dev`) + `pnpm dev:http` (fallback without TLS) + CSP `upgrade-insecure-requests` |

</div>

<div id="español">

# Nutre-Fit-Dia — Ecosistema de Autocuidado Integral para Diabetes Tipo 2 y Salud Sostenible

## Descripción general del proyecto

### Marco y descripción general del proyecto

El marco de este proyecto, es el **TFM del Máster en Desarrollo con IA de BIGSchool y la Universidad Isabel I.**

Este proyecto se basa en **la Nutrición mediante la Dieta Mediterránea (DM) y el Ejercicio diario** creando un **Ecosistema de Autocuidado Integral para la Diabetes Tipo 2 (DT2) y la Salud Sostenible.**

## Presentación del Proyecto

- [Presentación en PowerPoint](docs/slides/Nutre-Fit-Dia_Metabolic_Architecture.pptx)
- [Video de presentación](https://youtu.be/RSCQ3jXF96A)

## Stack tecnológico utilizado

| Tecnología            | Versión  | Propósito                                       |
| --------------------- | -------- | ----------------------------------------------- |
| React                 | 19.2.7   | Componentes de UI (Container/Presentational)    |
| TypeScript            | 6.0.2    | Type safety, erasableSyntaxOnly                 |
| Vite                  | 8.1.1    | Servidor de desarrollo y builds                 |
| Tailwind CSS          | 4.3.2    | CSS utility-first (Vite plugin)                 |
| Zod                   | 4.4.3    | Validación runtime con inferencia de tipos      |
| Zustand               | 5.0.8    | State management — una store por feature        |
| Supabase JS           | 2.87.3   | BaaS: PostgreSQL, Auth, Storage (V1)            |
| Vitest                | 4.1.10   | Test runner unitario y de componentes           |
| Testing Library React | 16.3.2   | Testing conductual de componentes               |
| Oxlint                | 1.71.0   | Linting basado en Rust                          |
| Prettier              | 3.7.4    | Formateador de código                           |
| jsdom                 | 29.1.1   | Entorno browser para tests                      |
| Playwright            | 1.61.1   | Tests E2E — flujo completo de usuario           |
| PWA                   | Manifest | Instalable como app en móvil (offline-ready)    |
| GitHub Actions        | CI/CD    | Lint → Typecheck → Tests → Build → E2E → Deploy |
| pnpm                  | —        | Gestor de paquetes rápido y eficiente en disco  |

## Información sobre su instalación y ejecución

```bash
# Instalacion
git clone <repo-url>
cd nutre-fit-dia
pnpm install

# Desarrollo
pnpm dev              # HTTPS (certificado auto-generado vía @vitejs/plugin-basic-ssl)
pnpm dev:http          # HTTP sin certificado (solo para debug)

# Tests (TDD)
pnpm test:run        # Tests unitarios y de componentes
pnpm test:coverage   # Con cobertura
pnpm test:e2e        # Tests end-to-end con Playwright
pnpm test:e2e:ui     # E2E en modo interactivo

# Calidad
pnpm quality         # format:check + lint + typecheck + tests
pnpm verify          # quality + build
```

## Estructura del proyecto

```text
src/
├── features/
│   ├── nutritional-traffic-light/       # Semáforo Nutricional + Dual Scan (H4)
│   │   ├── ScannerContainer.tsx          # Lógica: estado, store, handlers
│   │   ├── ScannerView.tsx               # UI puro: props, sin store
│   │   ├── store/scannerStore.ts         # Historial de escaneos (Zustand)
│   │   └── services/                     # classificationService, occultSugarDetector, safetyCheck
│   ├── metabolic-tracker/               # Perfil fenotípico + biomarcadores
│   │   ├── MetabolicTrackerContainer.tsx # Lógica: perfil metabólico
│   │   ├── MetabolicTrackerView.tsx      # UI: formulario + resultados
│   │   ├── components/                   # ProfileForm, ProfileResults, ProfileError
│   │   ├── store/trackerStore.ts         # Perfil + objetivo calórico (Zustand)
│   │   └── services/                     # caloricTargetService, biomarkerTrackingService
│   ├── med-diet-validator/              # Validación AESAN 2022
│   │   ├── DailyLogContainer.tsx         # Lógica: registro diario
│   │   ├── DailyLogView.tsx              # UI: lista alimentos + validación
│   │   ├── components/                   # FoodList, DailyViolations, CaloricSummary
│   │   └── store/logStore.ts             # todayLog + validación (Zustand)
│   ├── recipe-engine/                   # Plan semanal erMedDiet + fraccionamiento M7
│   │   ├── PlanContainer.tsx             # Lógica: plan semanal
│   │   ├── PlanView.tsx                  # UI: checkbox + plan generado
│   │   ├── store/planStore.ts            # weeklyPlan (Zustand)
│   │   └── services/                     # planGenerator
│   ├── activity-tracker/                # WHO/OMS 150-300 min + fuerza (ADR-006) ✅
│   │   ├── ActivityTrackerContainer.tsx  # Lógica: compliance + streak
│   │   ├── ActivityTrackerView.tsx       # UI: metas OMS + formulario
│   │   ├── hooks/useActivityTracker.ts   # Hook: compliance %, streak, weeklyGoal
│   │   ├── store/activityStore.ts        # weeklyMinutes + entries (Zustand)
│   │   └── types.ts                      # ActivityEntry, WeeklyGoal, ComplianceReport
│   ├── nudge-engine/                    # 15 reglas + panel UI (ADR-008) ✅
│   │   ├── NudgePanelContainer.tsx       # Lógica: nudges pendientes + historial
│   │   ├── NudgePanelView.tsx            # UI: lista + dismiss + badge contador
│   │   ├── engine.ts                     # buildNudgeContext + evaluateRules (puro)
│   │   ├── rules.ts                      # SafetyAlert + BehavioralNudge + SystemAction
│   │   ├── cooldownTracker.ts            # CooldownTracker (in-memory)
│   │   ├── store/nudgeStore.ts           # pending + history (Zustand)
│   │   └── types.ts                      # NudgeRule, NudgeContext, SafetyRule
│   └── sustainability/                  # Dashboard Eco + scoring (ADR-007) ✅
│       ├── SustainabilityContainer.tsx   # Lógica: scoring + zero-waste + emisiones
│       └── SustainabilityView.tsx        # UI: tabs de sostenibilidad
├── shared/
│   ├── data/foods.ts                     # Catálogo 34 alimentos AESAN
│   ├── domain/                           # FoodCategory, Food (Zod), TrafficLight, Notification
│   ├── errors.ts                         # DomainError, ValidationError, NotFoundError
│   ├── hooks/                            # Hooks cross-feature
│   ├── i18n/                             # ES/EN (useT, I18nProvider, 80+ keys)
│   ├── services/rationValidator.ts       # Validación diaria/semanal
│   ├── sustainability/                   # EnvironmentalScore, substitutionService, constants
│   ├── ui/                               # Card, SelectField, TabButton, StatCard, LegalDisclaimer, etc.
│   └── utils/                            # sanitize, imc, enum helpers
├── infrastructure/
│   └── ml/                               # ScannerAdapter + MockScannerAdapter (ADR-003)
└── test/
    ├── setup.ts                          # Testing Library + jsdom
    └── fixtures.ts                       # makeFood factory
```

## Funcionalidades principales

- **Semáforo Nutricional**: Clasifica alimentos en Verde/Naranja/Rojo. Detecta azúcares ocultos. SafetyAlert en frutas de alta carga glucémica. **Calificación Dual** (salud + sostenibilidad) integrada.
- **Metabolic Tracker**: Calcula objetivo calórico con déficit condicional (IMC > 25). Perfil fenotípico. Registro de glucosa y biomarcadores.
- **Validador Dieta Mediterránea**: Valida frecuencias diarias/semanales según matriz AESAN 2022. Control de gramajes exactos por ración.
- **Recipe Engine**: Planes semanales con restricción calórica. Ranking dual salud+sostenibilidad. **Fraccionamiento 3-6 tomas diarias** con kcal por comida. Badges culturales UNESCO (🏺👥🌿). AOVE obligatorio en cada comida principal.
- **Activity Goal Tracker**: Seguimiento WHO/OMS 150-300 min/semana. Compliance % y streak. Tab en dashboard.
- **Nudge Engine**: 15 reglas (SafetyAlert + BehavioralNudge + SystemAction). Panel UI con badge contador + historial de engagement. Sustitución inteligente (M2): alternativas sostenibles cuando environmentalScore < 30.
- **Sustainability Scoring**: `computeEnvironmentalScore()` con constantes AESAN/EAT-Lancet. Pesos configurables 50/30/20. Integrado en RecipeEngine (ranking dual).
- **Substitution Service**: `suggestAlternative(food)` — WHITE_MEAT → LEGUMES + blue FISH (AESAN 2.4.2.1). Ranking por environmental score. Top 3 alternativas.
- **Convivialidad**: Sugerencias textuales UNESCO en PlanView: "Ideal para comer en compañía" + técnicas culinarias (guiso, vapor, hervido, plancha, crudo).
- **Zero-Waste**: `isUglyProduce` + `isZeroWaste` en FoodSchema. Badges ♻️🥕 en PlanView. 7 alimentos etiquetados como zero-waste.
- **Dashboard de Sostenibilidad**: Tab 🌍 Eco con puntuación ambiental (50/30/20), emisiones comparativas EAT-Lancet, y contador Zero-Waste. Layout responsive.

## Arquitectura y Reglas de Desarrollo

Los principios y reglas de desarrollo viven en archivos modulares dedicados — se cargan por contexto para ahorrar tokens y mantener el foco:

| Recurso                              | Contenido                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [`skills/`](skills/)                 | Reglas de desarrollo: Scope Rule, TDD, DDD, decisiones arquitectónicas, code smells, metodología |
| [`adr/`](adr/)                       | 11 Decisiones de Arquitectura con matriz de trazabilidad                                         |
| [`openspec/specs/`](openspec/specs/) | 24 especificaciones de dominio (spec-driven development)                                         |
| [`docs/domain/`](docs/domain/)       | Análisis DDD: bounded contexts, detección de polisemia, desanudado semántico                     |

### Fases de Implementación (Completadas ✅)

1. **Domain Modeling** — Tipos estrictos: perfiles metabólicos, raciones AESAN, alimentos, notificaciones
2. **Domain Services & Containers** — Lógica erMedDiet, patrón Contenedor/Presentacional, stores Zustand
3. **ADR Scaffolding** — ScannerAdapter, Activity Tracker, Sustainability, Nudge Engine
4. **Tests & Error Handling** — 580 tests (60 archivos), 100% cobertura de líneas, i18n ES/EN, ErrorBoundary
5. **E2E & Accesibilidad** — Playwright smoke tests, cumplimiento WCAG 2.1 AA

### Fundamento Clínico

Construido sobre la **erMedDiet** (Dieta Mediterránea con reducción de energía) con evidencia de los estudios **PREDIMED-Plus** y **ProDiGY**. Impone déficit condicional de 600 kcal (IMC > 25) con filtrado fenotípico por edad de diagnóstico. Todos los umbrales clínicos centralizados en `src/shared/constants/clinical.ts` con citas AESAN/WHO.

## 9. PWA — Instalación en Dispositivos Móviles

La aplicación es una **Progressive Web App (PWA)**. Se instala directamente desde el navegador sin necesidad de stores:

1. Abrí `https://nutrefitdia.dev` en Chrome/Safari móvil
2. Tocá **"Añadir a pantalla de inicio"** (Chrome) o **"Compartir → Añadir a inicio"** (Safari)
3. La app se abre en modo standalone (sin barra del navegador)

**Archivos PWA:** `public/manifest.json` | `public/favicon.svg` | `index.html` (theme-color + apple-touch-icon)

## 10. CI/CD — Integración y Entrega Continua

Pipeline automático en **GitHub Actions** (`.github/workflows/ci.yml`):

```
Push/PR → 🔒 Security Audit → ✅ Quality Gate → 🎭 E2E → 🚀 Deploy
              │                    │
                ├ pnpm audit         ├ format:check + lint + typecheck
                └ gitleaks           ├ unit tests (578)
                                    └ build (vite)
```

**Ramas protegidas:** `staging` (pre-producción) ← `develop` ← features

## 11. Seguridad OWASP 2025

| Control                       | Implementación                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| CSP (Content-Security-Policy) | `default-src 'self'`, sin inline scripts, frame-ancestors 'none'                                                            |
| X-Content-Type-Options        | `nosniff` — previene MIME sniffing                                                                                          |
| Referrer-Policy               | `strict-origin-when-cross-origin`                                                                                           |
| Permissions-Policy            | Cámara, geolocalización, micrófono deshabilitados                                                                           |
| Base-uri                      | `'self'` — previene <base> injection                                                                                        |
| Form-action                   | `'self'` — previene form hijacking                                                                                          |
| Dependency audit              | `pnpm audit --audit-level=high` en CI                                                                                       |
| Secret scanning               | Gitleaks en CI                                                                                                              |
| Security.txt                  | `/.well-known/security.txt` (RFC 9116)                                                                                      |
| Runtime validation            | Zod schemas en todas las entradas                                                                                           |
| HTML sanitation               | Sin `dangerouslySetInnerHTML`, sin `eval()`                                                                                 |
| HTTPS                         | `@vitejs/plugin-basic-ssl` (default, vía `pnpm dev`) + `pnpm dev:http` (fallback sin TLS) + CSP `upgrade-insecure-requests` |

</div>
