# README.md

## Descripción general del proyecto

### Marco y descripción general del proyecto

El marco de este proyecto, es el **TFM del Máster en Desarrollo con IA de BIGSchool y la Universidad Isabel I.**

Este proyecto se basa en **la Nutrición mediante la Dieta Mediterránea (DM) y el Ejercicio diario** creando un **Ecosistema de Autocuidado Integral para la Diabetes Tipo 2 (DT2) y la Salud Sostenible.**

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
4. **Fase 4: Tests & Error Handling** ✅ — 544 tests (56 test files + 4 E2E). Cobertura 97.63% líneas / 97.15% statements. `ErrorBoundary` con aislamiento por pestaña. `ValidationError` y `NotFoundError` tipados.
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
                └ gitleaks           ├ unit tests (544)
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
