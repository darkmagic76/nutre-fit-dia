# Domain-Driven Development — Introducción Conceptual

> **📖 Este documento es una introducción conceptual al dominio de Nutre-Fit-Dia. Para el análisis semántico a nivel de código, consultar los specs en `openspec/specs/` y el modelo de tipos en `src/shared/domain/`. Este documento complementa, no reemplaza, esos artefactos técnicos.**

Como Arquitecto de Software con enfoque en **Domain-Driven Development (DDD)**, el primer paso para desatar el "nudo semántico" es reconocer que el lenguaje en Nutre-Fit-Dia no es uniforme; lo que un médico entiende por "validación" es radicalmente distinto a lo que entiende un desarrollador.

A continuación, presento el análisis de los **Bounded Contexts** (Contextos Delimitados) y el mapa de **polisemia** detectado en las fuentes.

## 1. Propuesta de Bounded Contexts (BC)

Para evitar que la lógica metabólica se contamine con la logística de recetas o métricas ambientales, identifico cuatro contextos claros:

- **BC de Gestión Metabólica (Core Domain):** Centrado en la fisiología del paciente (insulina, HbA1c, glucosa, IMC). Su objetivo es la reversión de la DT2.
- **BC de Gobernanza Nutricional:** Encapsula las reglas de la dieta **erMedDiet** y las raciones **AESAN 2022**. Aquí reside el "Semáforo" y la lógica de "Azúcares Ocultos".
- **BC de Sostenibilidad Planetaria:** Gestiona el `environmentalScore`, huellas hídricas y de carbono. No le interesa la glucosa, sino el impacto en el ecosistema.
- **BC de Comportamiento (Nudge Engine):** Gestiona la adherencia, alertas y el "engagement" del usuario mediante reglas de IA.

---

## 2. Detección de Polisemia y Conflictos Lingüísticos

He detectado términos críticos que significan cosas distintas según el contexto. Ignorar esto causará que el código falle en su propósito médico:

| Término            | Significado en Contexto Médico/Nutricional                                   | Significado en Contexto Técnico/Software                                           |
| :----------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Validación**     | Acto legal y clínico donde un **nutricionista colegiado** aprueba un plan.   | Validación de tipos con **Zod** o esquemas de datos en tiempo de ejecución.        |
| **Ración**         | Cantidad exacta en gramos según la matriz AESAN (ej. 4 de cereales/día).     | Una instancia o entrada en un array dentro del `RecipeEngine`.                     |
| **Alerta (Alert)** | Riesgo metabólico inminente (pico glucémico).                                | Un componente de UI, un `SafetyAlert` de sistema o un `ErrorBoundary`.             |
| **Azúcar**         | Carbohidrato macro-nutricional presente de forma natural.                    | **Ingrediente oculto** (sacarosa, jarabe) que debe disparar un bloqueo de sistema. |
| **Sostenibilidad** | Capacidad del planeta para soportar la producción del alimento (EAT-Lancet). | Mantenibilidad del código mediante la **Screaming Architecture** y tests.          |

---

## 3. Análisis de Requisitos Crudos y Ambigüedades

Al analizar las fuentes, surgen "zonas grises" que deben resolverse antes de programar los servicios de dominio:

1. **La "Prioridad" del Bacalao:** Las fuentes lo marcan como "proteína de alta prioridad". **Ambigüedad:** ¿Esta prioridad es nutricional (aparece más veces) o logística (es lo primero que sugiere el `Substitution Service`)?.
2. **El Peso del Semáforo:** Si un alimento es nutricionalmente "Verde" (AOVE) pero su `environmentalScore` es bajo (<30), ¿de qué color debe ser el semáforo?. Según la lógica de "Ranking Dual", el semáforo es médico, pero el ranking es el que penaliza la sostenibilidad. Confundir esto enviaría mensajes contradictorios al paciente.
3. **Déficit Condicional:** Se impone una reducción de 600 kcal si el IMC > 25. **Ambigüedad:** ¿Es un recorte fijo o dinámico? Las fuentes dicen que el registro de glucosa debe "recalibrar el motor" en tiempo real, lo que implica una lógica reactiva compleja, no solo un cálculo estático.

---

## 4. Simulación de Escenarios (Semantic Untangling)

Antes de escribir el `SubstitutionService.ts`, debemos resolver estos escenarios mentales:

- **Escenario A: "El Error de la Fruta":** Una pieza de fruta tiene alta carga glucémica. El sistema lanza un `SafetyAlert`. Si el desarrollador lo trata como una "notificación de sistema" genérica, el usuario podría ignorarla. Debe ser un **Bloqueo de Dominio**, ya que es una restricción biológica.
- **Escenario B: "El Azúcar Invisible":** Un yogur tiene 0% grasa (parece saludable) pero tiene jarabe de glucosa en los ingredientes. El contexto nutricional debe "ganar" al contexto de etiquetas macros. El modelo de dominio debe tener un `IngredientAnalyzer` que sea independiente del `MacroCalculator`.

**Conclusión del Arquitecto:** Para que este sistema sea una "herramienta de ingeniería médica de alta precisión", el código debe hablar el lenguaje de **erMedDiet**. La **Screaming Architecture** detectada en las fuentes es la defensa principal contra estos nudos semánticos, obligando a que cada carpeta de funcionalidad (`features/`) sea un silo de significado coherente.
