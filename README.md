# Nutre-Fit-Dia - Comprehensive Self-Care Ecosystem for DT2 and Sustainable Health

````html
<div id="english">
  ## Project Overview ### Scope and Framework This project is the **Master's Thesis (TFM) for the
  Master in AI Development at BIGSchool and Universidad Isabel I.** It is built on **Mediterranean
  Diet (MD)-based Nutrition and Daily Exercise**, creating a **Comprehensive Self-Care Ecosystem for
  Type 2 Diabetes (T2D) and Sustainable Health.** ## Project Presentation - [PowerPoint
  Presentation](docs/slides/Nutre-Fit-Dia_Metabolic_Architecture.pptx) - [Presentation
  Video](https://youtu.be/RSCQ3jXF96A) ## Tech Stack | Technology | Version | Purpose | |
  --------------------- | -------- | --------------------------------------------- | | React |
  19.2.7 | UI Components (Container/Presentational) | | TypeScript | 6.0.2 | Type safety,
  erasableSyntaxOnly | | Vite | 8.1.1 | Dev server and builds | | Tailwind CSS | 4.3.2 | CSS
  utility-first (Vite plugin) | | Zod | 4.4.3 | Runtime validation with type inference | | Zustand |
  5.0.8 | State management — one store per feature | | Vitest | 4.1.10 | Unit and component test
  runner | | Testing Library React | 16.3.2 | Behavioral component testing | | Oxlint | 1.71.0 |
  Rust-based linting | | Prettier | 3.9.5 | Code formatter | | jsdom | 29.1.1 | Browser environment
  for tests | | Playwright | 1.61.1 | E2E tests — full user flow (manual trigger) | | PWA | Manifest
  | Installable as mobile app (offline-ready) | | GitHub Actions | CI/CD | Quality
  (format+lint+typecheck+tests) → Build | | pnpm | — | Fast, disk-efficient package manager | ##
  Installation and Running ```bash # Install git clone
  <repo-url>
    cd nutre-fit-dia pnpm install # Development pnpm dev # HTTP on localhost (no cert needed) #
    Tests (TDD) pnpm test:run # Unit and component tests pnpm test:coverage # With coverage pnpm
    test:e2e # End-to-end tests with Playwright pnpm test:e2e:ui # E2E interactive mode # Quality
    pnpm quality # format:check + lint + typecheck + tests pnpm verify # quality + build</repo-url
  >
</div>
````

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
│   │   ├── NudgeEngineContainer.tsx       # Logic: pending nudges + history
│   │   ├── NudgePanelView.tsx            # UI: list + dismiss + counter badge
│   │   └── store/                        # Re-exports from shared/stores
│   └── sustainability/                  # Eco Dashboard + scoring (ADR-007) ✅
│       ├── SustainabilityContainer.tsx   # Logic: scoring + zero-waste + emissions
│       └── SustainabilityView.tsx        # UI: sustainability tabs
├── shared/
│   ├── constants/clinical.ts             # 14 clinical thresholds (AESAN/WHO/PREDIMED-Plus)
│   ├── data/foods.ts                     # 34-food AESAN catalog
│   ├── domain/                           # FoodCategory, Food (Zod), TrafficLight, Notification
│   ├── errors.ts                         # DomainError, ValidationError, NotFoundError
│   ├── hooks/                            # Cross-feature hooks
│   ├── i18n/                             # ES/EN (useT, I18nProvider, 80+ keys)
│   ├── nudge/                            # Nudge engine: rules, context, cooldowns
│   ├── services/rationValidator.ts       # Daily/weekly validation
│   ├── stores/                           # Zustand stores (log, tracker, activity, nudge)
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

The application is a **Progressive Web App (PWA)** with full offline support via service worker. It installs directly from the browser without app stores:

1. Open `https://nutrefitdia.dev` in Chrome/Safari mobile
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
              └ unit tests (580)
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

</div>
```
