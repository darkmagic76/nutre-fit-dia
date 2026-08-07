# Nutre-Fit-Dia - Comprehensive Self-Care Ecosystem for DT2 and Sustainable Health

## Project Overview

### Scope and Framework

This project is the **Master's Thesis (TFM) for the Master in AI Development at BIGSchool and Universidad Isabel I.**
It is built on **Mediterranean Diet (MD)-based Nutrition and Daily Exercise**, creating a **Comprehensive Self-Care Ecosystem for Type 2 Diabetes (T2D) and Sustainable Health.**

## Project Presentation

- [PowerPoint Presentation](docs/slides/Nutre-Fit-Dia_Metabolic_Architecture.pptx)
- [Presentation Video](https://youtu.be/RSCQ3jXF96A)

## Tech Stack

| Technology            | Version  | Purpose                                       |
| --------------------- | -------- | --------------------------------------------- |
| React                 | 19.2.7   | UI Components (Container/Presentational)      |
| TypeScript            | 6.0.2    | Type safety, erasableSyntaxOnly               |
| Vite                  | 8.1.1    | Dev server and builds                         |
| Tailwind CSS          | 4.3.2    | CSS utility-first (Vite plugin)               |
| Zod                   | 4.4.3    | Runtime validation with type inference        |
| Zustand               | 5.0.8    | State management — one store per feature      |
| Vitest                | 4.1.10   | Unit and component test runner                |
| Testing Library React | 16.3.2   | Behavioral component testing                  |
| Oxlint                | 1.71.0   | Rust-based linting                            |
| Prettier              | 3.9.5    | Code formatter                                |
| jsdom                 | 29.1.1   | Browser environment for tests                 |
| Playwright            | 1.61.1   | E2E tests — full user flow (manual trigger)   |
| PWA                   | Manifest | Installable as mobile app (offline-ready)     |
| GitHub Actions        | CI/CD    | Quality (format+lint+typecheck+tests) → Build |
| pnpm                  | —        | Fast, disk-efficient package manager          |

## Installation and Running

```bash
# Install
git clone <repo-url>
cd nutre-fit-dia
pnpm install

# Development
pnpm dev            # HTTP on localhost (no cert needed)

# Tests (TDD)
pnpm test:run       # Unit and component tests
pnpm test:coverage  # With coverage
pnpm test:e2e       # End-to-end tests with Playwright
pnpm test:e2e:ui    # E2E interactive mode

# Quality
pnpm quality        # format:check + lint + typecheck + tests
pnpm verify         # quality + build</repo-url>
```

## Project Structure

```text
src/
├── domain/                              # Pure TypeScript + zod — entities, value objects, domain services
│   ├── index.ts                         # Barrel: re-exports everything
│   ├── enum.ts                          # defineEnum, ValuesOf (moved from shared/utils)
│   ├── food.ts + foodCategory.ts        # Food entity, FoodCategory enum (11 AESAN groups), Zod schemas
│   ├── metrics.ts                       # UserMetrics, UserProfile, UserMetricsFormState
│   ├── activity.ts                      # ActivityEntry, WeeklyGoal (WHO 150-300 min)
│   ├── notification.ts                  # NotificationType, NotificationSeverity, SystemNotification
│   ├── trafficLight.ts                  # TrafficLightColor (green/orange/red)
│   ├── glucoseInput.ts                  # Branded type for glucose (mg/dL)
│   ├── glycemicFruits.ts                # High-glycemic fruit names (Set)
│   ├── clinical.ts                      # 14 clinical thresholds (AESAN/WHO/PREDIMED-Plus)
│   ├── imc.ts                           # computeIMC, isRestrictionCandidate
│   ├── caloricTargetService.ts          # Mifflin-St Jeor + PREDIMED-Plus deficit (ADR-004)
│   ├── profileService.ts                # Profile validation
│   ├── rationValidator.ts               # AESAN 2022 ration limits + validation (ADR-005)
│   ├── biomarkerTypes.ts                # GlucoseReading, WeightReading, BiomarkerTrend, computeBiomarkerTrend
│   ├── cooldownTracker.ts               # CooldownTracker class (DI ops)
│   ├── cooldownDurations.ts             # Cooldown constants (24h, 12h, 6h, etc.)
│   ├── nudgeContext.ts + nudgeTypes.ts  # ContextInput, NudgeContext, SafetyRule types
│   ├── nudgeContextBuilder.ts           # buildNudgeContext() — pure function
│   ├── nudgeEvaluator.ts                # evaluateRules() — pure function
│   ├── plan.ts                          # MealType, WeeklyPlan, MealEntry, TemplateSlot, WeekPlanContext
│   └── sustainability/                  # Environmental scoring (ADR-007)
│       ├── constants.ts                 # CARBON_THRESHOLDS, SCORING_WEIGHTS, PROTEIN_EMISSION_RATIOS
│       ├── scoringService.ts            # computeEnvironmentalScore()
│       ├── substitutionService.ts       # suggestAlternative() — RED_MEAT → LEGUMES + blue FISH
│       └── types.ts                     # Seasonality, Proximity, PackagingLevel, EnvironmentalScore
│
├── application/                         # Use cases + ports — zero framework imports
│   ├── ports/
│   │   ├── notificationRepository.ts    # NotificationRepository interface
│   │   ├── activityRepository.ts        # ActivityRepository interface
│   │   ├── logRepository.ts             # LogRepository interface
│   │   ├── planRepository.ts            # PlanRepository interface
│   │   └── biomarkerRepository.ts       # BiomarkerRepository interface
│   ├── use-cases/
│   │   ├── calculateTarget.ts           # Pure use case — caloric target (ADR-004)
│   │   ├── evaluateNudges.ts            # Pure use case — nudge pipeline (ADR-008)
│   │   └── exportData.ts                # Pure use case — data export
│   ├── services/
│   │   └── planGenerator.ts             # Weekly erMedDiet plan generation (moved from features)
│   └── dtos/                            # (reserved for future DTOs)
│
├── infrastructure/                      # Adaptadores + persistencia — conoce frameworks
│   ├── compositionRoot.ts               # createContainer() — wiring factory (ADR-012)
│   ├── env.ts                           # VITE_ env validation (Zod)
│   ├── storage.ts                       # AES-256-GCM encrypted Zustand persist
│   ├── ml/                              # ScannerAdapter + MockScannerAdapter (ADR-003)
│   ├── stores/                          # Zustand stores (6)
│   │   ├── trackerStore.ts + logStore.ts + nudgeStore.ts
│   │   ├── activityStore.ts + biomarkerStore.ts + planStore.ts
│   │   └── index.ts                     # Barrel
│   ├── nudge/
│   │   └── rules.ts                     # NUDGE_RULES — 19 data-driven rules
│   └── adapters/                        # Zustand-backed port implementations (ADR-012)
│       ├── zustandNotificationRepository.ts
│       ├── zustandActivityRepository.ts
│       ├── zustandLogRepository.ts
│       ├── zustandBiomarkerRepository.ts
│       ├── zustandPlanRepository.ts
│       └── contract.test.ts             # 5 structural compatibility tests
│
├── features/                            # Screaming Architecture (7 bounded contexts)
│   ├── nutritional-traffic-light/       # Scanner + Traffic Light + Dual Scan (H4)
│   ├── metabolic-tracker/               # Phenotypic profile + biomarkers
│   ├── med-diet-validator/              # AESAN 2022 daily log + ration validation
│   ├── recipe-engine/                   # Weekly erMedDiet plan + M7 meal splitting
│   ├── activity-tracker/                # WHO 150-300 min + strength (ADR-006)
│   ├── nudge-engine/                    # 19 rules + NudgePanel UI (ADR-008)
│   └── sustainability/                  # Eco Dashboard + scoring (ADR-007)
│
├── shared/                              # Presentation layer — UI + i18n + hooks
│   ├── ui/                              # Card, SelectField, TabButton, StatCard, LegalDisclaimer, etc.
│   ├── i18n/                            # ES/EN (useT, I18nProvider, 150+ keys)
│   ├── hooks/                           # Cross-feature hooks (useExportData, useFoodName, useInstallPrompt, useNudgeTrigger)
│   ├── context/
│   │   └── ContainerContext.tsx         # React Context for DI (useContainer hook)
│   ├── data/
│   │   ├── foods.ts                     # 39-food AESAN catalog
│   │   └── sugarAliases.ts              # Canonical sugar alias list (moved from features)
│   ├── errors.ts                        # DomainError, ValidationError, NotFoundError
│   ├── sustainability/                  # Barrel re-exporting from domain/sustainability
│   └── utils/                           # sanitize, barrel re-exports for backward compat
│
├── test/
│   ├── setup.ts                         # jsdom + localStorage shim + Web Crypto mock
│   └── fixtures.ts                      # makeFood, makeEntries, makeCaloricTargetOutput, etc.
│
├── App.tsx                              # Root component — 7 tabs via Container/Presentational
└── main.tsx                             # Entry point — wires ErrorBoundary → ContainerProvider → I18nProvider → App
```

## Key Features

- **Nutritional Traffic Light**: Classifies foods as Green/Orange/Red. Detects hidden sugars. SafetyAlert for high-glycemic-load fruits. **Dual Rating** (health + sustainability) integrated.
- **Metabolic Tracker**: Calculates caloric target with conditional deficit (BMI > 25). Phenotypic profile. Glucose and biomarker tracking.
- **Mediterranean Diet Validator**: Validates daily/weekly frequencies per AESAN 2022 matrix. Exact gram-portion control.
- **Recipe Engine**: Weekly plans with caloric restriction. Dual health+sustainability ranking. **3-6 daily meal split** with kcal per meal. UNESCO cultural badges (🏺👥🌿). AOVE mandatory in every main meal.
- **Activity Goal Tracker**: WHO 150-300 min/week tracking. Compliance % and streak. Dashboard tab.
- **Nudge Engine**: 19 rules (SafetyAlert + BehavioralNudge + SystemAction). Panel UI with counter badge + engagement history. Smart substitution (M2): sustainable alternatives when environmentalScore < 30.
- **Sustainability Scoring**: `computeEnvironmentalScore()` with AESAN/EAT-Lancet constants. Configurable 50/30/20 weights. Integrated into RecipeEngine (dual ranking).
- **Substitution Service**: `suggestAlternative(food)` — WHITE_MEAT → LEGUMES + blue FISH (AESAN 2.4.2.1). Environmental score ranking. Top 3 alternatives.
- **Conviviality**: UNESCO textual suggestions in PlanView: "Ideal for sharing meals" + cooking techniques (stew, steam, boil, grill, raw).
- **Zero-Waste**: `isUglyProduce` + `isZeroWaste` in FoodSchema. Badges ♻️🥕 in PlanView. 7 foods tagged as zero-waste.
- **Sustainability Dashboard**: 🌍 Eco tab with environmental score (50/30/20), comparative EAT-Lancet emissions, and Zero-Waste counter. Responsive layout.

## Architecture & Development Rules

Core principles and development rules live in dedicated, modular files — loaded per-context to save tokens and keep focus:

| Resource                             | Content                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| [`skills/`](skills/)                 | Development rules: Scope Rule, TDD, DDD, Clean Architecture, architecture decisions, code smells, work methodology |
| [`adr/`](adr/)                       | 11 Architecture Decision Records with traceability matrix                                                          |
| [`openspec/specs/`](openspec/specs/) | 37 domain specifications (spec-driven development)                                                                 |

### Implementation Phases (Complete ✅)

1. **Domain Modeling** — Strict types: metabolic profiles, AESAN portions, food types, notifications
2. **Domain Services & Containers** — erMedDiet logic, Container/Presentational split, Zustand stores
3. **ADR Scaffolding** — ScannerAdapter, Activity Tracker, Sustainability, Nudge Engine
4. **Tests & Error Handling** — 735 tests (72 files), 80%+ coverage, i18n ES/EN, ErrorBoundary
5. **E2E & Accessibility** — Playwright smoke tests, WCAG 2.1 AA compliance

### Clinical Foundation

Built on **erMedDiet** (energy-reduced Mediterranean Diet) with evidence from **PREDIMED-Plus** and **ProDiGY** studies. Enforces 600 kcal conditional deficit (BMI > 25) with phenotypic filtering by diagnosis age. All clinical thresholds centralized in `src/shared/constants/clinical.ts` with AESAN/WHO citations.

## PWA — Mobile Device Installation

The application is a **Progressive Web App (PWA)** with full offline support via service worker. It installs directly from the browser without app stores:

1. Open `https://darkmagic76.github.io/nutre-fit-dia/` in Chrome/Safari mobile
2. Tap **"Add to Home Screen"** (Chrome) or **"Share → Add to Home Screen"** (Safari)
3. The app opens in standalone mode (no browser chrome)

**PWA files:** `public/manifest.json` | `public/favicon.svg` | `index.html` (theme-color + apple-touch-icon)

## 10. CI/CD — Continuous Integration and Delivery

Automated pipeline in **GitHub Actions** (`.github/workflows/ci.yml`):

```text
Push/PR → ✅ Quality Gate → 🏗️ Build
              │                    │
              ├ format:check       ├ vite build
              ├ lint (oxlint)      └ dist/ artifact
              ├ typecheck
              └ unit tests (731)
```

**Deployment**: separate workflow (`deploy.yml`) deploys to GitHub Pages on push to `main`.

## 11. OWASP 2025 Security

| Control                       | Implementation                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| CSP (Content-Security-Policy) | `default-src 'self'`, no inline scripts, frame-ancestors 'none'                       |
| X-Content-Type-Options        | `nosniff` — prevents MIME sniffing                                                    |
| Referrer-Policy               | `strict-origin-when-cross-origin`                                                     |
| Permissions-Policy            | Camera, geolocation, microphone disabled                                              |
| Base-uri                      | `'self'` — prevents < base > injection                                                |
| Form-action                   | `'self'` — prevents form hijacking                                                    |
| Security.txt                  | `/.well-known/security.txt` (RFC 9116)                                                |
| Runtime validation            | Zod schemas on all inputs                                                             |
| HTML sanitation               | No `dangerouslySetInnerHTML`, no `eval()`                                             |
| HTTPS                         | HTTP on localhost (dev) + GitHub Pages HTTPS (prod) + CSP `upgrade-insecure-requests` |
