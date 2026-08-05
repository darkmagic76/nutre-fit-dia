# Setup Guide — NutreFitDia

## Prerequisites

| Tool        | Minimum Version | Check            |
| ----------- | --------------- | ---------------- |
| **Node.js** | 22+             | `node --version` |
| **pnpm**    | 10+             | `pnpm --version` |
| **Git**     | 2.40+           | `git --version`  |

### Install Node.js

```bash
# Option A: Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# Option B: Direct download
# https://nodejs.org → LTS 22.x
```

### Install pnpm

```bash
npm install -g pnpm@latest
```

---

## 1. Clone the Repository

```bash
git clone git@github.com:darkmagic76/nutre-fit-dia.git
cd nutre-fit-dia
```

Project branches:

| Branch    | Purpose                           |
| --------- | --------------------------------- |
| `main`    | Production                        |
| `staging` | Pre-production, integration tests |
| `develop` | Active development                |

```bash
git checkout develop  # working branch
```

---

## 2. Install Dependencies

```bash
pnpm install
```

Main dependencies installed:

| Category   | Packages                                |
| ---------- | --------------------------------------- |
| Frontend   | React 19, Vite 8, Tailwind 4, Zustand 5 |
| Validation | Zod 4                                   |
| Testing    | Vitest 4, Testing Library 16, jsdom 29  |
| Quality    | TypeScript 6, Oxlint                    |

---

## 3. Run in Development

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

The app has 7 tabs:

| Tab             | Feature                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| 🔍 **Scanner**  | Dual classification (health + sustainability) + hidden sugar detection                                         |
| 📝 **Today**    | Daily log with AESAN 2022 portion validation                                                                   |
| 📊 **Profile**  | erMedDiet caloric target + biomarkers + phenotypic profile                                                     |
| 📅 **Plan**     | Weekly plan with dual ranking, 3-6 meal split, kcal per meal, UNESCO badges 🏺👥🌿 + ZeroWaste ♻️🥕            |
| 🏃 **Activity** | WHO 150-300 min tracking + strength sessions                                                                   |
| 🔔 **Nudges**   | Notification panel with counter badge + engagement history                                                     |
| 🌍 **Eco**      | Environmental score (carbon 50%, seasonality 30%, proximity 20%), Zero-Waste, comparative EAT-Lancet emissions |

---

## 4. Run Tests

```bash
# Unit tests
pnpm test:run

# Watch mode (development)
pnpm test:watch

# With coverage
pnpm test:coverage
```

---

## 5. Verify Quality

```bash
# Lint + typecheck + tests
pnpm quality

# quality + build (for CI/CD)
pnpm verify
```

Quality pipeline:

```text
pnpm quality
  ├── pnpm format:check → Prettier
  ├── pnpm lint         → Oxlint (Rust, ultra-fast)
  ├── pnpm typecheck    → TypeScript 6 (erasableSyntaxOnly)
  └── pnpm test:run     → Vitest (731 tests)
```

---

## 6. Production Build

```bash
pnpm build
```

Generates `dist/` with optimized files:

```text
dist/
├── index.html
├── favicon.svg
└── assets/
    ├── index-*.css   (~14 KB)
    └── index-*.js    (~277 KB)
```

---

## 7. Deployment

### Option A: Local (for TFM demo/defense)

```bash
pnpm dev
# Access at: http://localhost:5173
```

### Option B: GitHub Pages (recommended, zero external dependencies)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

Configure on GitHub: `Settings → Pages → Source: GitHub Actions`.

URL: `https://darkmagic76.github.io/nutre-fit-dia`

### Option C: Vercel

```bash
npx vercel --prod
# Follow on-screen instructions
```

---

## 8. Project Structure

```text
nutre-fit-dia/
├── src/
│   ├── features/              ← Screaming Architecture (ADR-001)
│   │   ├── nutritional-traffic-light/  ← Scanner + dual classification (H4)
│   │   ├── metabolic-tracker/          ← Phenotypic profile + biomarkers
│   │   ├── med-diet-validator/         ← AESAN 2022 validation
│   │   ├── recipe-engine/              ← Weekly plan + UNESCO badges + ZeroWaste
│   │   ├── activity-tracker/           ← WHO 150-300 min + strength (H1, M6)
│   │   ├── nudge-engine/               ← 17 rules + panel UI (H2, H6, H7, M2)
│   │   └── sustainability/             ← Eco Dashboard + scoring (ADR-007)
│   ├── shared/
│   │   ├── constants/         ← 14 clinical thresholds (AESAN/WHO/PREDIMED-Plus)
│   │   ├── data/              ← 39-food AESAN catalog
│   │   ├── domain/            ← FoodCategory, Food (Zod), CulturalMetadata, Notification
│   │   ├── hooks/             ← useExportData, useInstallPrompt, useTabNavigation, useFoodName
│   │   ├── i18n/              ← ES/EN (useT, I18nProvider, 80+ keys)
│   │   ├── nudge/             ← Nudge engine: rules, context, cooldowns
│   │   ├── services/          ← rationValidator, caloricTargetService, biomarkerTracking
│   │   ├── stores/            ← Zustand stores (tracker, log, activity, nudge, biomarker)
│   │   ├── sustainability/    ← EnvironmentalScore, substitutionService, constants
│   │   ├── ui/                ← Atomic components (Card, TabButton, ErrorBoundary, etc.)
│   │   ├── utils/             ← sanitize, imc, enum helpers
│   │   └── errors.ts          ← DomainError, ValidationError, NotFoundError
│   ├── infrastructure/
│   │   ├── env.ts             ← Zod-validated env config (VITE_STORAGE_PREFIX, etc.)
│   │   ├── storage.ts         ← AES-GCM encryption + Zustand persist config
│   │   └── ml/                ← ScannerAdapter (ADR-003), MockScannerAdapter
│   └── test/
│       ├── fixtures.ts        ← makeFood factory
│       └── setup.ts           ← Testing Library + jsdom
├── adr/                       ← 11 ADRs + traceability matrix + reconciliation
├── docs/                      ← Specifications (INFORME_ADR, SPECS_RF, SPECS_TECH)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .oxlintrc.json
```

---

## 9. Tech Stack

| Layer          | Technology                                         | Decision |
| -------------- | -------------------------------------------------- | -------- |
| UI             | React 19 + Tailwind 4                              | ADR-009  |
| Build          | Vite 8                                             | ADR-009  |
| Types          | TypeScript 6 (erasableSyntaxOnly)                  | ADR-002  |
| Validation     | Zod 4                                              | ADR-002  |
| State          | Zustand 5                                          | ADR-009  |
| Tests          | Vitest 4 + Testing Library 16                      | ADR-009  |
| E2E            | Playwright 1.61                                    | ADR-009  |
| Lint           | Oxlint (Rust)                                      | ADR-009  |
| Format         | Prettier 3.9                                       | ADR-009  |
| Browser env    | jsdom 29.1                                         | ADR-009  |
| Architecture   | Screaming Architecture                             | ADR-001  |
| Domain         | 11 FoodCategory groups                             | ADR-005  |
| Deficit        | 600 kcal conditional (BMI > 25)                    | ADR-004  |
| Scanner        | Mock → ONNX (V2)                                   | ADR-003  |
| Activity       | GoalTracker manual V1                              | ADR-006  |
| Sustainability | EnvironmentalScore + substitutionService V1        | ADR-007  |
| Notifications  | 17 rules: SafetyAlert/SystemAction/BehavioralNudge | ADR-008  |

---

## 10. Troubleshooting

### `pnpm: command not found`

```bash
npm install -g pnpm@latest
```

### `Error: Cannot find module '@shared/domain'`

```bash
pnpm install   # reinstall dependencies
pnpm typecheck # verify TypeScript resolves paths
```

### Tests fail with `ReferenceError: document is not defined`

```bash
# Ensure src/test/setup.ts imports @testing-library/jest-dom
pnpm test:run -- --environment jsdom
```

### Blank screen after pulling new changes

**Symptom**: the browser shows a completely white page with no errors in the terminal. DevTools console may show `Failed to resolve import` or CSP violations.

**Cause**: new dependencies (e.g., `vite-plugin-pwa`, `workbox-window`) were added to `package.json` but `node_modules` is stale. Vite cannot resolve the new imports in `vite.config.ts`, so the dev server starts but serves broken modules.

**Fix**:

```bash
pnpm install   # sync node_modules with updated pnpm-lock.yaml
pnpm dev       # restart the dev server
```

**Prevention**: always run `pnpm install` after `git pull` when `pnpm-lock.yaml` has changed.

### Port 5173 already in use

```bash
pnpm dev -- --port 3000
```
