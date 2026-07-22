# Guía de Instalación — NutreFitDia

## Requisitos previos

| Herramienta | Versión mínima | Verificación     |
| ----------- | -------------- | ---------------- |
| **Node.js** | 22+            | `node --version` |
| **pnpm**    | 10+            | `pnpm --version` |
| **Git**     | 2.40+          | `git --version`  |

### Instalar Node.js

```bash
# Opción A: Node Version Manager (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# Opción B: Descarga directa
# https://nodejs.org → LTS 22.x
```

### Instalar pnpm

```bash
npm install -g pnpm@latest
```

---

## 1. Clonar el repositorio

```bash
git clone git@github.com:darkmagic76/nutre-fit-dia.git
cd nutre-fit-dia
```

Ramas del proyecto:

| Rama      | Propósito                              |
| --------- | -------------------------------------- |
| `main`    | Producción                             |
| `staging` | Pre-producción, pruebas de integración |
| `develop` | Desarrollo activo                      |

```bash
git checkout develop  # rama de trabajo
```

---

## 2. Instalar dependencias

```bash
pnpm install
```

Dependencias principales que se instalan:

| Categoría          | Paquetes                                |
| ------------------ | --------------------------------------- |
| Frontend           | React 19, Vite 8, Tailwind 4, Zustand 5 |
| Validación         | Zod 4                                   |
| Backend (opcional) | Supabase JS                             |
| Testing            | Vitest 4, Testing Library 16, jsdom 29  |
| Calidad            | TypeScript 6, Oxlint                    |

---

## 3. Ejecutar en desarrollo

```bash
pnpm dev
```

Abre `http://localhost:5173` en el navegador.

La aplicación tiene 7 pestañas:

| Pestaña          | Funcionalidad                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| 🔍 **Semáforo**  | Clasificación dual (salud + sostenibilidad) + detección de azúcares ocultos                                         |
| 📝 **Hoy**       | Registro diario con validación de raciones AESAN 2022                                                               |
| 📊 **Perfil**    | Cálculo de objetivo calórico erMedDiet + biomarcadores + perfil fenotípico                                          |
| 📅 **Plan**      | Plan semanal con ranking dual, fraccionamiento 3-6 tomas, kcal por comida, badges UNESCO 🏺👥🌿 + ZeroWaste ♻️🥕    |
| 🏃 **Actividad** | Seguimiento WHO/OMS 150-300 min + sesiones de fuerza                                                                |
| 🔔 **Nudges**    | Panel de notificaciones con badge contador + historial de engagement                                                |
| 🌍 **Eco**       | Puntuación ambiental (carbono 50%, temporalidad 30%, proximidad 20%), Zero-Waste, emisiones comparativas EAT-Lancet |

---

## 4. Ejecutar tests

```bash
# Tests unitarios
pnpm test:run

# Tests en modo watch (desarrollo)
pnpm test:watch

# Con cobertura
pnpm test:coverage
```

---

## 5. Verificar calidad

```bash
# Lint + typecheck + tests
pnpm quality

# quality + build (para CI/CD)
pnpm verify
```

Pipeline de calidad:

```text
pnpm quality
  ├── pnpm format:check → Prettier
  ├── pnpm lint         → Oxlint (Rust, ultrarrápido)
  ├── pnpm typecheck    → TypeScript 6 (erasableSyntaxOnly)
  └── pnpm test:run     → Vitest (510 tests)
```

---

## 6. Build de producción

```bash
pnpm build
```

Genera `dist/` con los archivos optimizados:

```text
dist/
├── index.html
├── favicon.svg
└── assets/
    ├── index-*.css   (~14 KB)
    └── index-*.js    (~277 KB)
```

---

## 7. Despliegue

### Opción A: Local (para demo/defensa TFM)

```bash
pnpm dev
# Compartir con: http://localhost:5173
```

### Opción B: GitHub Pages (recomendado, cero dependencias externas)

Crear `.github/workflows/deploy.yml`:

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

Configurar en GitHub: `Settings → Pages → Source: GitHub Actions`.

URL: `https://darkmagic76.github.io/nutre-fit-dia`

### Opción C: Vercel

```bash
npx vercel --prod
# Seguir instrucciones en pantalla
```

---

## 8. Estructura del proyecto

```text
nutre-fit-dia/
├── src/
│   ├── features/              ← Screaming Architecture (ADR-001)
│   │   ├── nutritional-traffic-light/  ← Scanner + clasificación dual (H4)
│   │   ├── metabolic-tracker/          ← Perfil fenotípico + biomarcadores
│   │   ├── med-diet-validator/         ← Validación AESAN 2022
│   │   ├── recipe-engine/              ← Plan semanal + badges UNESCO + ZeroWaste
│   │   ├── activity-tracker/           ← WHO/OMS 150-300 min (H1)
│   │   └── nudge-engine/               ← 15 reglas + panel UI (H2, H6, H7, M2)
│   ├── shared/
│   │   ├── domain/            ← FoodCategory, Food (Zod), CulturalMetadata, Notification
│   │   ├── data/              ← Catálogo 34 alimentos con datos AESAN
│   │   ├── sustainability/    ← EnvironmentalScore, substitutionService, ZeroWaste
│   │   ├── services/          ← rationValidator cross-feature
│   │   └── ui/                ← Componentes atómicos (Card, TabButton, etc.)
│   ├── infrastructure/
│   │   └── ml/                ← ScannerAdapter (ADR-003) + ScanResult
│   └── test/
│       └── fixtures.ts        ← makeFood factory
├── adr/                       ← 11 ADRs + matriz de trazabilidad + reconciliation
├── docs/                      ← Especificaciones (INFORME_ADR, SPECS_RF, SPECS_TECH)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .oxlintrc.json
```

---

## 9. Stack tecnológico

| Capa           | Tecnología                                          | Decisión |
| -------------- | --------------------------------------------------- | -------- |
| UI             | React 19 + Tailwind 4                               | ADR-009  |
| Build          | Vite 8                                              | ADR-009  |
| Tipos          | TypeScript 6 (erasableSyntaxOnly)                   | ADR-002  |
| Validación     | Zod 4                                               | ADR-002  |
| Estado         | Zustand 5                                           | ADR-009  |
| Backend        | Supabase (PostgreSQL + Auth)                        | ADR-009  |
| Tests          | Vitest 4 + Testing Library 16                       | ADR-009  |
| Lint           | Oxlint (Rust)                                       | ADR-009  |
| Arquitectura   | Screaming Architecture                              | ADR-001  |
| Dominio        | 11 FoodCategory groups                              | ADR-005  |
| Déficit        | 600 kcal condicional (IMC > 25)                     | ADR-004  |
| Scanner        | Mock → ONNX (V2)                                    | ADR-003  |
| Actividad      | GoalTracker manual V1                               | ADR-006  |
| Sostenibilidad | EnvironmentalScore + substitutionService V1         | ADR-007  |
| Notificaciones | 15 reglas: SafetyAlert/SystemAction/BehavioralNudge | ADR-008  |

---

## 10. Solución de problemas

### `pnpm: command not found`

```bash
npm install -g pnpm@latest
```

### `Error: Cannot find module '@shared/domain'`

```bash
pnpm install   # reinstalar dependencias
pnpm typecheck # verificar que TypeScript resuelve los paths
```

### Tests fallan con `ReferenceError: document is not defined`

```bash
# Asegurarse que src/test/setup.ts importa @testing-library/jest-dom
pnpm test:run -- --environment jsdom
```

### Puerto 5173 en uso

```bash
pnpm dev -- --port 3000
```
