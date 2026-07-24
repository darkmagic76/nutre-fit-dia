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

## Technical and Architectural Specification: Comprehensive Self-Care Ecosystem (T2D and Sustainable Health)

### 1. Medical Foundations and Strategic System Vision

Clinical management of Type 2 Diabetes (T2D) demands a transition from passive monitoring to active metabolic intervention. This ecosystem is built on the **energy-reduced Mediterranean Diet (erMedDiet)**, a strategic pillar that uses caloric restriction and lipid quality to reverse insulin resistance. We do not accept a superficial digitization of nutritional guidelines; we implement a health engine based on evidence from the **PREDIMED-Plus and ProDiGY** studies.

The system **must enforce a 600 kcal reduction** from basal metabolic expenditure in overweight or obese patients, integrating physical activity not as a supplement but as an algorithmic requirement for insulin sensitivity. The software architecture is not a simple data container; it must be a **"Screaming Architecture"** that declares its medical purpose and ensures each module is an exact reflection of the patient's biological constraints.

## 2. Software Architecture: Screaming Architecture and the Scope Rule

As technical leaders, we reject generic structures. We adopt **Screaming Architecture** so that business intent (Metabolic Control) dominates project organization. We complement this with rigorous application of the **Scope Rule** to safeguard maintainability and prevent cross-coupling of medical logic.

### Structural Design Mandates

1. **`features/` directory**: Each folder must represent a single functional capability of the T2D ecosystem. It is **mandatory** that feature-specific `services`, `hooks`, and `logic-utils` be **colocated** within their respective feature folder. _**We prohibit the leakage of metabolic logic into global folders**_.
2. **`shared/` directory**: Reserved exclusively for cross-cutting components (primitive UI, network wrappers) used by **two or more** features. If metabolic logic repeats, it is not moved to `shared/` without prior refactoring into `shared/metabolic-utils` under architecture approval.

### Feature Rationale

- `nutritional-traffic-light`: Encapsulates the metabolic risk classification engine.
- `metabolic-tracker`: Manages glucose, weight, and BMI tracking — critical variables for dynamic adjustment.
- `recipe-engine`: Implements erMedDiet planning logic and sustainability filtering.

### Container/Presentational Pattern

Every feature-level component must follow the Container/Presentational pattern. The container (e.g. `NutritionalTrafficLightContainer.tsx`) **must exclusively handle** business logic and state, injecting clean data into the UI component. This separation is non-negotiable to enable system scalability without compromising source code integrity.

## 3. Algorithmic Logic: Intake and Nutritional Distribution

Translating the **AESAN 2022** guidelines into code requires mathematical precision in portion management to ensure glycemic stability. The planning algorithm must strictly apply the following constraints:

### Intake Constraints (Ground Truth AESAN 2022)

- **Whole Grains**: The system **must limit consumption to a maximum of 4 daily servings** for users under caloric restriction (erMedDiet). Refined flours are prohibited.
- **Legumes**: The engine must prioritize **at least 4 weekly servings**, scalable up to daily consumption.
- **Dairy**: The maximum ceiling is **3 daily servings**. The algorithm must trigger a dairy reduction suggestion if other animal protein intake is detected to optimize sustainability.
- **Proteins**: **3 to 4 weekly servings of fish** are required (alternating fatty and lean fish). **Cod** must be tagged as "high-priority protein" due to its minimal fat profile (0.7%).
- **AOVE**: Mandatory lipid source (3-6 servings/day).
- **Fruits and Vegetables**: Minimum 2 servings of vegetables and 2-3 of whole fruit (juice is prohibited as a substitute).

### Glycemic Stability

The planning engine must enforce **meal splitting into 3 to 6 daily intakes**. This technical requirement is vital to prevent postprandial hyperglycemic spikes and is the foundation of the data that feeds the nutritional traffic light display.

## 4. Personalization Engine and Nutritional Traffic Light System

Personalization is not an aesthetic option; it is a phenotypic necessity. The system must adjust energy load based on the user's **diagnosis age** and current **BMI**.

### Nutritional Traffic Light Algorithm (Hospital Rey Juan Carlos Model)

| Color      | Food Criteria (Input)                                  | System Action (Output)                     |
| ---------- | ------------------------------------------------------ | ------------------------------------------ |
| **Green**  | Whole grains, legumes, fish (Cod), AOVE.               | Active promotion in meal plans.            |
| **Orange** | White rice/pasta, potatoes, lean meats.                | Portion restriction and frequency warning. |
| **Red**    | Added sugars, refined flours, trans fats, soft drinks. | Block alert and substitution suggestion.   |

### "Hidden" Detection

The scanning engine **must prioritize ingredient list analysis (**`ingredient_list`**)** over macro-nutritional labeling. If added sugars are detected in processed foods or preserves (sucrose, syrups, etc.), the product must be automatically classified as **Red**, regardless of its total caloric contribution.

## 5. Adherence Dynamics (Nudges) and Safety Protocols

The system uses an **AI Nudge Engine** to monitor physical activity and lifestyle. The technical goal is the quantifiable improvement of **HbA1c (Glycated Hemoglobin)** and blood pressure.

### Safety Protocols and Planetary Sustainability

- **Professional Validation Notice**: This is a critical safety requirement. No generated nutritional plan is definitive until **validated by a registered dietitian-nutritionist**.
- **Systemic Impact**: Adherence to this dietary pattern has the potential to **prevent 80,000 annual deaths in Spain** and reduce greenhouse gas emissions by **70%**, according to AESAN 2022 data.
- **Monitoring**: Glucose, weight, and BMI tracking must recalibrate the 600 kcal reduction engine in real time.
- **Sustainability**: The food search engine must prioritize seasonal and local products (km 0) to reduce water and CO2 footprints, aligning with the UNESCO SDGs.

## 6. Recipe Metadata and Planetary Sustainability

Each `Recipe` object in our database must comply with an enriched metadata schema to align with planetary health.

**Mandatory Attributes per Recipe:**

- **Protein Biological Value**: Essential amino acid score.
- **Carbon/Water Footprint**: Environmental impact metrics per serving.
- **erMedDiet Flag**: Boolean validation for caloric restriction and fat quality.
- **Geographic Origin**: Proximity indicator of the main ingredient.

## 7. Development Implementation Plan

### Technical Execution Phases

1. **Phase 1: Domain Modeling** ✅ — Strict type definitions for metabolic profiles, AESAN portions, food types, notification taxonomy.
2. **Phase 2: Domain Services & Containers** ✅ — erMedDiet logic implementation, Container/Presentational split, per-feature Zustand stores.
3. **Phase 3: ADR Scaffolding** ✅ — ScannerAdapter (ADR-003), Activity Tracker (ADR-006), Sustainability (ADR-007), Nudge Engine (ADR-008).
4. **Phase 4: Tests & Error Handling** ✅ — 578 tests (59 test files). 99.76% stmt / 100% lines / 100% functions coverage. `ErrorBoundary` with per-tab isolation. Typed `ValidationError` and `NotFoundError`. Full ES/EN i18n.
5. **Phase 5: E2E & Accessibility** ✅ — Playwright smoke tests (scan→classify→plan). WCAG 2.1 AA: ARIA roles, aria-labels, keyboard nav, skip links.

### Example: Container/Presentational Pattern

```typescript
import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from './services/classificationService'
import { useLogStore } from '@features/med-diet-validator/store'
import { ScannerView } from './ScannerView'

export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const addFoodToLog = useLogStore(s => s.addFoodToLog)

  const options = Array.from(foodsById.entries()).map(([id, food]) => ({
    value: id,
    label: `${food.name} ${food.isProcessed ? '⚠️' : ''}`,
  }))

  const selected = selectedId ? foodsById.get(selectedId) ?? null : null

  const handleClassify = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  const handleAddToLog = () => {
    if (!selected) return
    addFoodToLog(selected)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setResult(null)
  }

  return (
    <ScannerView
      selectedId={selectedId}
      options={options}
      selected={selected}
      result={result}
      onSelect={handleSelect}
      onClassify={handleClassify}
      onAddToLog={handleAddToLog}
    />
  )
}
```

## 8. Technical Conclusion and App Sustainability

This _**Comprehensive Self-Care Ecosystem for T2D and Sustainable Health**_ is NOT a simple wellness application; **it is a high-precision medical engineering tool**. The adoption of **Screaming Architecture** and the **Scope Rule** ensures that _**the Mediterranean Diet logic and AESAN 2022 constraints are immutable and maintainable**_.

By implementing **an engine that penalizes hidden sugars and restricts whole grains to 4 servings under the erMedDiet regimen**, we ensure _**absolute fidelity to scientific evidence**_. This architecture not only optimizes development efficiency but **positions the system as a standard in HbA1c reduction and the promotion of sustainable health for both the patient and the planet**.

## 9. PWA — Mobile Device Installation

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

## Especificación Técnica y Arquitectónica: Ecosistema de Autocuidado Integral (DT2 y Salud Sostenible)

### 1. Fundamentos Médicos y Visión Estratégica del Sistema

La gestión clínica de la Diabetes Tipo 2 (DT2) exige una transición del seguimiento pasivo a la intervención metabólica activa. Este ecosistema se construye sobre la **Dieta Mediterránea con reducción de energía (erMedDiet)**, un pilar estratégico que utiliza la restricción calórica y la calidad lipídica para revertir la resistencia a la insulina. No aceptamos una digitalización superficial de guías nutricionales; implementamos un motor de salud basado en la evidencia de los estudios **PREDIMED-Plus y ProDiGY**.

El sistema **debe imponer una reducción de 600 kcal** respecto al gasto metabólico basal en pacientes con sobrepeso u obesidad, integrando la actividad física no como un complemento, sino como un requisito algorítmico para la sensibilidad insulínica. La arquitectura de software no es un simple contenedor de datos; debe ser una **"Screaming Architecture"** que declare su propósito médico y garantice que cada módulo sea un reflejo exacto de las restricciones biológicas del paciente.

## 2. Arquitectura de Software: Screaming Architecture y la Ley del Alcance

Como líderes técnicos, rechazamos las estructuras genéricas. Adoptamos **Screaming Architecture** para que la intención de negocio (Control Metabólico) domine la organización del proyecto. Complementamos esto con una aplicación rigurosa de la **Regla del Alcance (Scope Rule)** para blindar la mantenibilidad y evitar el acoplamiento cruzado de lógica médica.

### Mandatos de Diseño Estructural

1. **Directorio** `features/`: Cada carpeta debe representar una capacidad funcional única del ecosistema DT2. Es **obligatorio** que los `services`, `hooks` y `logic-utils` específicos de una funcionalidad estén **colocados (colocation)** dentro de su respectiva carpeta de funcionalidad. _**Prohibimos la fuga de lógica metabólica a carpetas globales**_.
2. **Directorio** `shared/`: Reservado exclusivamente para componentes transversales (UI primitiva, wrappers de red) que sean utilizados por **dos o más** funcionalidades. Si una lógica metabólica se repite, no se mueve a `shared/` sin una refactorización previa en un `shared/metabolic-utils` bajo aprobación de arquitectura.

### Justificación de Funcionalidades

- `nutritional-traffic-light`: Encapsula el motor de clasificación de riesgo metabólico.
- `metabolic-tracker`: Gestiona el registro de glucosa, peso e IMC, variables críticas para el ajuste dinámico.
- `recipe-engine`: Implementa la lógica de planificación erMedDiet y el filtrado de sostenibilidad.

### Patrón Contenedor/Presentativo

Todo componente de nivel funcional debe seguir el patrón Contenedor/Presentacional. El contenedor (ej. `NutritionalTrafficLightContainer.tsx`) **debe manejar exclusivamente** la lógica de negocio y el estado, inyectando datos limpios al componente de UI. Esta separación es innegociable para permitir la escalabilidad del sistema sin comprometer la integridad del código fuente.

## 3. Lógica Algorítmica: Ingesta y Distribución Nutricional

La traducción de las guías **AESAN 2022** al código requiere una precisión matemática en la gestión de raciones para garantizar la estabilidad glucémica. El algoritmo de planificación debe aplicar las siguientes restricciones de forma estricta:

### Restricciones de Ingesta (Ground Truth AESAN 2022)

- **Cereales Integrales**: El sistema **debe limitar el consumo a un máximo de 4 raciones diarias** para usuarios en régimen de restricción calórica (erMedDiet). Se prohíben las harinas refinadas.
- **Legumbres**: El motor debe priorizar **al menos 4 raciones semanales**, con capacidad de escalado hasta un consumo diario.
- **Lácteos**: El techo máximo es de **3 raciones diarias**. El algoritmo debe disparar una sugerencia de reducción de lácteos si se detecta la ingesta de otras proteínas de origen animal para optimizar la sostenibilidad.
- **Proteínas**: Se exigen **3 a 4 raciones semanales de pescado** (alternando azul y blanco). El **Bacalao** debe etiquetarse como "proteína de alta prioridad" debido a su perfil de grasa mínima (0,7%).
- **AOVE**: Fuente lipídica obligatoria (3-6 raciones/día).
- **Frutas y Verduras**: Mínimo 2 raciones de verduras y 2-3 de frutas enteras (prohibición de zumos como sustitutos).

### Estabilidad Glucémica

El motor de planificación debe forzar el **fraccionamiento en 3 a 6 tomas diarias**. Este requisito técnico es vital para prevenir picos de hiperglucemia postprandial y es la base de los datos que alimentan la visualización del semáforo nutricional.

## 4. Motor de Personalización y Sistema de Semáforo Nutricional

La personalización no es una opción estética; es una necesidad fenotípica. El sistema debe ajustar la carga energética basándose en la **edad de diagnóstico** y el **IMC** actual del usuario.

### Algoritmo de Semáforo Nutricional (Modelo Hospital Rey Juan Carlos)

| Color       | Criterios de Alimento (Input)                                  | Acción del Sistema (Output)                         |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------- |
| **Verde**   | Cereales integrales, legumbres, pescado (Bacalao), AOVE.       | Promoción activa en planes de comida.               |
| **Naranja** | Arroz/pasta blanca, patatas, carnes magras.                    | Restricción de porción y advertencia de frecuencia. |
| **Rojo**    | Azúcares añadidos, harinas refinadas, grasas trans, refrescos. | Alerta de bloqueo y sugerencia de sustitución.      |

### Detección de "Ocultos"

El motor de escaneo **debe priorizar el análisis de la lista de ingredientes (**`ingredient_list`**)** sobre el etiquetado macro-nutricional. Si se detectan azúcares añadidos en procesados o conservas (sacarosa, jarabes, etc.), el producto debe clasificarse automáticamente como **Rojo**, independientemente de su aporte calórico total.

## 5. Dinámicas de Adherencia (Nudges) y Protocolos de Seguridad

El sistema utiliza un motor de **IA de Nudges** para monitorizar la actividad física y el estilo de vida. El objetivo técnico es la mejora cuantificable de la **HbA1c (Hemoglobina Glicosilada)** y la presión arterial.

### Protocolos de Seguridad y Sostenibilidad Planetaria

- **Aviso de Validación Profesional**: Es un requisito de seguridad crítico. Ningún plan nutricional generado es definitivo hasta ser **validado por un dietista-nutricionista colegiado**.
- **Impacto Sistémico**: La adherencia a este patrón dietético tiene el potencial de **evitar 80,000 muertes anuales en España** y reducir las emisiones de gases de efecto invernadero en un **70%**, según datos de AESAN 2022.
- **Monitoreo**: El registro de glucosa, peso e IMC debe recalibrar el motor de 600 kcal de reducción en tiempo real.
- **Sostenibilidad**: El motor de búsqueda de alimentos debe priorizar productos de temporada y locales (km 0) para reducir la huella hídrica y de CO2, alineándose con los ODS de la UNESCO.

## 6. Metadata de Recetas y Sostenibilidad Planetaria

Cada objeto `Recipe` en nuestra base de datos debe cumplir con un esquema de metadata enriquecida para alinearse con la salud planetaria.

**Atributos Obligatorios por Receta:**

- **Valor Biológico Proteico**: Puntuación de aminoácidos esenciales.
- **Huella de Carbono/Hídrica**: Métricas de impacto ambiental por ración.
- **Flag erMedDiet**: Booleano de validación para restricción calórica y calidad de grasas.
- **Procedencia Geográfica**: Indicador de proximidad del ingrediente principal.

## 7. Plan de Implementación de Desarrollo

### Fases de Ejecución Técnica

1. **Fase 1: Domain Modeling** ✅ — Definición de tipos estrictos para perfiles metabólicos, raciones AESAN, tipos de alimentos, notification taxonomy.
2. **Fase 2: Domain Services & Containers** ✅ — Implementación de lógica erMedDiet, Container/Presentational split, per-feature Zustand stores.
3. **Fase 3: ADR Scaffolding** ✅ — ScannerAdapter (ADR-003), Activity Tracker (ADR-006), Sustainability (ADR-007), Nudge Engine (ADR-008).
4. **Fase 4: Tests & Error Handling** ✅ — 578 tests (59 test files). Cobertura 99.76% stmts / 100% líneas / 100% funciones. `ErrorBoundary` con aislamiento por pestaña. `ValidationError` y `NotFoundError` tipados. i18n ES/EN completo.
5. **Fase 5: E2E & Accesibilidad** ✅ — Playwright smoke tests (scan→classify→plan). WCAG 2.1 AA: roles ARIA, aria-labels, keyboard nav, skip links.

### Ejemplo: Patrón Contenedor/Presentacional

```typescript
import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from './services/classificationService'
import { useLogStore } from '@features/med-diet-validator/store'
import { ScannerView } from './ScannerView'

export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const addFoodToLog = useLogStore(s => s.addFoodToLog)

  const options = Array.from(foodsById.entries()).map(([id, food]) => ({
    value: id,
    label: `${food.name} ${food.isProcessed ? '⚠️' : ''}`,
  }))

  const selected = selectedId ? foodsById.get(selectedId) ?? null : null

  const handleClassify = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  const handleAddToLog = () => {
    if (!selected) return
    addFoodToLog(selected)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setResult(null)
  }

  return (
    <ScannerView
      selectedId={selectedId}
      options={options}
      selected={selected}
      result={result}
      onSelect={handleSelect}
      onClassify={handleClassify}
      onAddToLog={handleAddToLog}
    />
  )
}
```

## 8. Conclusión Técnica y Sostenibilidad de la App

Este _**Ecosistema de Autocuidado Integral para la DT2 y Salud Sostenible**_, NO es una simple aplicación de bienestar; **es una herramienta de ingeniería médica de alta precisión**. La adopción de **Screaming Architecture** y la **Regla del Alcance** garantiza que _**la lógica de la Dieta Mediterránea y las restricciones de la AESAN 2022 sean inalterables y mantenibles**_.

Al implementar **un motor que penaliza los azúcares ocultos y restringe los cereales integrales a 4 raciones bajo régimen erMedDiet**, aseguramos _**la fidelidad absoluta a la evidencia científica**_. Esta arquitectura no solo optimiza la eficiencia del desarrollo, sino que **posiciona al sistema como un estándar en la reducción de la HbA1c y la promoción de una salud sostenible tanto para el paciente como para el planeta**.

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
