# README.md

## Descripción general del proyecto

### Marco y descripción general del proyecto

El marco de este proyecto, es el **TFM del Máster en Desarrollo con IA de BIGSchool y la Universidad Isabel I.**

Este proyecto se basa en **la Nutrición mediante la Dieta Mediterránea (DM) y el Ejercicio diario** creando un **Ecosistema de Autocuidado Integral para la Diabetes Tipo 2 (DT2) y la Salud Sostenible.**

## Stack tecnológico utilizado

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2.7 | Componentes de UI (Container/Presentational) |
| TypeScript | 6.0.2 | Type safety, erasableSyntaxOnly |
| Vite | 8.1.1 | Servidor de desarrollo y builds |
| Tailwind CSS | 4.3.2 | CSS utility-first (Vite plugin) |
| Zod | 4.4.3 | Validación runtime con inferencia de tipos |
| Zustand | 5.0.8 | State management — una store por feature |
| Supabase JS | 2.87.3 | BaaS: PostgreSQL, Auth, Storage (V1) |
| Vitest | 4.1.10 | Test runner unitario y de componentes |
| Testing Library React | 16.3.2 | Testing conductual de componentes |
| Oxlint | 1.71.0 | Linting basado en Rust |
| jsdom | 29.1.1 | Entorno browser para tests |
| pnpm | — | Gestor de paquetes rápido y eficiente en disco |

## Información sobre su instalación y ejecución

```bash
# Instalacion
git clone <repo-url>
cd nutre-fit-dia
pnpm install

# Desarrollo
pnpm dev

# Tests (TDD)
pnpm test:run        # Tests unitarios y de componentes
pnpm test:coverage   # Con cobertura

# Calidad
pnpm quality         # lint + typecheck + tests
pnpm verify          # quality + build
```

## Estructura del proyecto

```text
src/
├── features/
│   ├── nutritional-traffic-light/
│   │   ├── ScannerContainer.tsx          # Lógica: estado, store, handlers
│   │   ├── ScannerView.tsx               # UI puro: props, sin store
│   │   ├── store/scannerStore.ts         # Historial de escaneos (Zustand)
│   │   └── services/                     # classificationService, occultSugarDetector
│   ├── metabolic-tracker/
│   │   ├── MetabolicTrackerContainer.tsx # Lógica: perfil metabólico
│   │   ├── MetabolicTrackerView.tsx      # UI: formulario + resultados
│   │   ├── store/trackerStore.ts         # Perfil + objetivo calórico + restrictionActive
│   │   └── services/                     # caloricTargetService
│   ├── med-diet-validator/
│   │   ├── DailyLogContainer.tsx         # Lógica: registro diario
│   │   ├── DailyLogView.tsx              # UI: lista alimentos + validación
│   │   └── store/logStore.ts             # todayLog + validación (Zustand)
│   ├── recipe-engine/
│   │   ├── PlanContainer.tsx             # Lógica: plan semanal
│   │   ├── PlanView.tsx                  # UI: checkbox + plan generado
│   │   ├── store/planStore.ts            # weeklyPlan (Zustand)
│   │   └── services/                     # planGenerator
│   ├── activity-tracker/                 # [scaffolded] ADR-006 V1
│   │   ├── types.ts                      # ActivityEntry, WeeklyGoal
│   │   └── store/activityStore.ts        # weeklyMinutes, strengthSessions
│   └── nudge-engine/                     # [scaffolded] ADR-008
│       ├── types.ts                      # NudgeRule, NudgeContext
│       └── store/nudgeStore.ts           # pending nudges queue
├── shared/
│   ├── domain/                           # FoodCategory, TrafficLight, Notification, Zod schemas
│   ├── data/foods.ts                     # Catálogo 34 alimentos
│   ├── services/rationValidator.ts       # Validación diaria/semanal (cross-feature)
│   ├── sustainability/                   # [scaffolded] ADR-007 — EnvironmentalScore, Seasonality
│   ├── ui/primitives.tsx                 # Card, SelectField, TabButton, StatCard
│   └── utils/                            # sanitizeNumeric, computeIMC
├── infrastructure/
│   └── ml/                               # ADR-003 — ScannerAdapter + MockScannerAdapter
└── test/setup.ts                         # Testing Library + jsdom
```

## Funcionalidades principales

- **Semáforo Nutricional**: Clasifica alimentos en Verde/Naranja/Rojo según impacto metabólico. Detecta azúcares ocultos en procesados (18 tests).
- **Metabolic Tracker**: Calcula objetivo calórico diario con déficit condicional de 600 kcal (solo si IMC > 25). 12 tests.
- **Validador Dieta Mediterránea**: Valida frecuencias diarias y semanales según matriz AESAN 2022 (41 tests).
- **Recipe Engine**: Genera planes semanales con restricción calórica opcional. 12 tests.
- **Activity Tracker** `[scaffolded]`: Seguimiento WHO/OMS 150-300 min/semana + 2 días de fuerza. ADR-006 V1.
- **Nudge Engine** `[scaffolded]`: Taxonomía de notificaciones SafetyAlert / SystemAction / BehavioralNudge. ADR-008.
- **Sustainability Scoring** `[scaffolded]`: EnvironmentalScore con huella de carbono, estacionalidad y proximidad. ADR-007.

## Especificación Técnica y Arquitectónica: Ecosistema de Autocuidado Integral (DT2 y Salud Sostenible)

### 1. Fundamentos Médicos y Visión Estratégica del Sistema

La gestión clínica de la Diabetes Tipo 2 (DT2) exige una transición del seguimiento pasivo a la intervención metabólica activa. Este ecosistema se construye sobre la **Dieta Mediterránea con reducción de energía (erMedDiet)**, un pilar estratégico que utiliza la restricción calórica y la calidad lipídica para revertir la resistencia a la insulina. No aceptamos una digitalización superficial de guías nutricionales; implementamos un motor de salud basado en la evidencia de los estudios **PREDIMED-Plus y ProDiGY**.

El sistema **debe imponer una reducción de 600 kcal** respecto al gasto metabólico basal en pacientes con sobrepeso u obesidad, integrando la actividad física no como un complemento, sino como un requisito algorítmico para la sensibilidad insulínica. La arquitectura de software no es un simple contenedor de datos; debe ser una **"Screaming Architecture"** que declare su propósito médico y garantice que cada módulo sea un reflejo exacto de las restricciones biológicas del paciente.

## 2. Arquitectura de Software: Screaming Architecture y la Ley del Alcance

Como líderes técnicos, rechazamos las estructuras genéricas. Adoptamos **Screaming Architecture** para que la intención de negocio (Control Metabólico) domine la organización del proyecto. Complementamos esto con una aplicación rigurosa de la **Regla del Alcance (Scope Rule)** para blindar la mantenibilidad y evitar el acoplamiento cruzado de lógica médica.

### Mandatos de Diseño Estructural

1. **Directorio** `features/`: Cada carpeta debe representar una capacidad funcional única del ecosistema DT2. Es **obligatorio** que los `services`, `hooks` y `logic-utils` específicos de una funcionalidad estén **colocados (colocation)** dentro de su respectiva carpeta de funcionalidad. ***Prohibimos la fuga de lógica metabólica a carpetas globales***.
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

|Color|Criterios de Alimento (Input)|Acción del Sistema (Output)|
|---|---|---|
|**Verde**|Cereales integrales, legumbres, pescado (Bacalao), AOVE.|Promoción activa en planes de comida.|
|**Naranja**|Arroz/pasta blanca, patatas, carnes magras.|Restricción de porción y advertencia de frecuencia.|
|**Rojo**|Azúcares añadidos, harinas refinadas, grasas trans, refrescos.|Alerta de bloqueo y sugerencia de sustitución.|

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
4. **Fase 4: Tests & Error Handling** ✅ — 120 tests (stores, utils, domain errors). Cero errores silenciosos. `ValidationError` y `NotFoundError` tipados. Cobertura real 97.2%.

## Estructura de Proyecto (Scope Rule & Colocation)

```text
src/
├── features/
│   ├── nutritional-traffic-light/
│   │   ├── ScannerContainer.tsx          # Lógica: estado, store, handlers
│   │   ├── ScannerView.tsx               # UI puro: props, sin store
│   │   ├── store/scannerStore.ts         # Historial de escaneos (Zustand)
│   │   └── services/                     # classificationService, occultSugarDetector
│   ├── metabolic-tracker/
│   │   ├── MetabolicTrackerContainer.tsx # Lógica: perfil metabólico
│   │   ├── MetabolicTrackerView.tsx      # UI: formulario + resultados
│   │   ├── store/trackerStore.ts         # Perfil + objetivo calórico + restrictionActive
│   │   └── services/                     # caloricTargetService
│   ├── med-diet-validator/
│   │   ├── DailyLogContainer.tsx         # Lógica: registro diario
│   │   ├── DailyLogView.tsx              # UI: lista alimentos + validación
│   │   └── store/logStore.ts             # todayLog + validación (Zustand)
│   ├── recipe-engine/
│   │   ├── PlanContainer.tsx             # Lógica: plan semanal
│   │   ├── PlanView.tsx                  # UI: checkbox + plan generado
│   │   ├── store/planStore.ts            # weeklyPlan (Zustand)
│   │   └── services/                     # planGenerator
│   ├── activity-tracker/                 # [scaffolded] ADR-006 V1
│   │   ├── types.ts                      # ActivityEntry, WeeklyGoal
│   │   └── store/activityStore.ts        # weeklyMinutes, strengthSessions
│   └── nudge-engine/                     # [scaffolded] ADR-008
│       ├── types.ts                      # NudgeRule, NudgeContext
│       └── store/nudgeStore.ts           # pending nudges queue
├── shared/
│   ├── domain/                           # FoodCategory, TrafficLight, Notification, Zod schemas
│   ├── data/foods.ts                     # Catálogo 34 alimentos
│   ├── errors.ts                         # DomainError, ValidationError, NotFoundError
│   ├── services/rationValidator.ts       # Validación diaria/semanal (cross-feature)
│   ├── sustainability/                   # [scaffolded] ADR-007 — EnvironmentalScore, Seasonality
│   ├── ui/primitives.tsx                 # Card, SelectField, TabButton, StatCard
│   └── utils/                            # parseNumeric, sanitizeNumeric, computeIMC
├── infrastructure/
│   └── ml/                               # ADR-003 — ScannerAdapter + MockScannerAdapter
└── test/setup.ts                         # Testing Library + jsdom
```

### Componente Contenedor: ScannerContainer.tsx

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

Este ***Ecosistema de Autocuidado Integral para la DT2 y Salud Sostenible***, NO es una simple aplicación de bienestar; **es una herramienta de ingeniería médica de alta precisión**. La adopción de **Screaming Architecture** y la **Regla del Alcance** garantiza que ***la lógica de la Dieta Mediterránea y las restricciones de la AESAN 2022 sean inalterables y mantenibles***.

Al implementar **un motor que penaliza los azúcares ocultos y restringe los cereales integrales a 4 raciones bajo régimen erMedDiet**, aseguramos ***la fidelidad absoluta a la evidencia científica***. Esta arquitectura no solo optimiza la eficiencia del desarrollo, sino que **posiciona al sistema como un estándar en la reducción de la HbA1c y la promoción de una salud sostenible tanto para el paciente como para el planeta**.
