# Especificación Técnica: Ecosistema Digital de Nutrición Sostenible y Control de Diabetes Tipo 2 (erMedDiet)

## 1. Introducción y Marco de Referencia Estratégico

El desarrollo de este ecosistema digital se sitúa en el nexo crítico entre la salud metabólica personalizada y la sostenibilidad planetaria (AESAN 2022). En el contexto de la Diabetes Tipo 2 (DT2), la integración de estos ejes no es meramente periférica; es una condición indispensable para asegurar la adherencia del paciente a largo plazo y cumplir con los objetivos de salud pública contemporáneos. La arquitectura del sistema se fundamenta en el modelo **erMedDiet** (Dieta Mediterránea con reducción de energía), cuya superioridad clínica frente a la DM tradicional en términos de control glucémico y reducción de riesgo cardiovascular ha sido validada por los estudios **PREDIMED-Plus y ProDiGY**. Esta especificación técnica actúa como el puente necesario para traducir dichos pilares clínicos en algoritmos operativos y lógicas de intervención digital de alta precisión.

## 2. Motor de Perfilado Metabólico y Lógica PREDIMED-Plus

La personalización fenotípica y el análisis de la heterogeneidad de la enfermedad son requisitos arquitectónicos de primer nivel. La DT2 no se manifiesta de forma uniforme, por lo que el sistema debe implementar una lógica de **ingesta de datos biométricos** que permita una recalibración dinámica del tratamiento.

### Lógica de Cálculo Calórico y Triggering

El sistema ejecutará un proceso de cálculo energético basado en el siguiente flujo de control:

1. **Validación de Datos de Entrada:** Ingesta obligatoria de edad de diagnóstico, Índice de Masa Corporal (IMC) actual y niveles de glucosa basal/postprandial para el filtrado fenotípico.
2. **Cálculo de Gasto Energético Basal (GEB):** Implementación de fórmulas validadas (Harris-Benedict o Mifflin-St Jeor) como base para la estimación metabólica.
3. **Algoritmo de Restricción erMedDiet:** Trigger automático que, ante la detección de sobrepeso u obesidad (IMC > 25), aplica una **restricción de 600 kcal/día** sobre el gasto energético total, siguiendo el protocolo de intervención intensiva de PREDIMED-Plus.

Este perfil metabólico dinámico rige el comportamiento de todos los módulos subsiguientes, garantizando que el ajuste de la carga glucémica sea específico para la capacidad de respuesta del usuario.

## 3. Algoritmo del Escáner Nutricional y Semáforo de Salud

El escáner no se define como un simple lector de OCR/barras, sino como un **filtro de seguridad clínica proactivo**. Su misión técnica es la detección de amenazas metabólicas invisibles mediante el análisis de la cadena de ingredientes.

### Clasificación por Semáforo Nutricional (Lógica Hospital Rey Juan Carlos)

|                          |                                                                                      |                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Categoría                | Alimentos Incluidos                                                                  | Justificación Técnica                                                                                                      |
| **Verde (Recomendable)** | Cereales 100% integrales, legumbres, pescado blanco/azul, AOVE.                      | Alta densidad nutricional y fibra. El **bacalao** se clasifica aquí por ser "proteína pura" (**0,7% de contenido graso**). |
| **Naranja (Moderación)** | Cereales refinados, patatas, carnes magras de cerdo, frutas de alta carga glucémica. | Carga glucémica intermedia; requiere control estricto de frecuencia y cantidad mediante lógica de **Nudges**.              |
| **Rojo (Evitar)**        | Azúcares añadidos, grasas trans (margarinas), harinas refinadas, embutidos.          | Productos con impacto directo en picos glucémicos y riesgo cardiovascular elevado.                                         |

### Algoritmo de Detección de "Ocultos"

El motor de análisis debe identificar variantes críticas de azúcar que comprometen el control glucémico, incluyendo **melazas, dextrosa y jarabes**. Asimismo, el algoritmo detectará grasas trans y aditivos (azúcar/sal) en productos aparentemente inocuos como conservas vegetales, menestras o gazpachos industriales, emitiendo alertas preventivas de riesgo metabólico.

## 4. Sistema de Alertas de Carga Glucémica y Sustitución Sostenible (AESAN)

Para mitigar la fatiga de decisión y optimizar los resultados clínicos, el sistema emplea una estrategia de **"Nudges"** (empujoncitos cognitivos) vinculados directamente a la mejora de la **HbA1c y la presión arterial**.

- **Alertas de Carga Glucémica:** El sistema emitirá notificaciones proactivas ante la intención de consumo de frutas con alta densidad de azúcares (uvas, dátiles, higos), basándose en el historial de glucosa del usuario.
- **Lógica de Sustitución Inteligente (API-driven Environmental Mapping):** Basado en las directrices de la **AESAN 2022**, el sistema implementa el siguiente trigger:
  - `IF Scan_Result == 'Red Meat' AND User_Profile == 'erMedDiet' THEN Suggest(Alternative_Legume || Alternative_BlueFish)`.
- **Ranking de Sostenibilidad:** Las alternativas se priorizan según su **baja huella hídrica y de carbono**, permitiendo que el usuario optimice su salud y su impacto ambiental de forma simultánea.

## 5. Especificaciones de Menús y Control de Raciones (RF-01)

La estabilidad metabólica se garantiza mediante un control riguroso de la frecuencia de ingesta y el gramado exacto de los macronutrientes.

### Requisitos Funcionales de Estructura de Menú

- **Fraccionamiento Metabólico:** Distribución obligatoria en un plan de **3 a 6 tomas diarias**.
- **Control de Gramajes:** El sistema debe definir porciones precisas por receta (ej. pan integral: **40-60g**).
- **Frecuencias Semanales y Restricciones:**
  - **Cereales:** 3-6 raciones/día (**MÁXIMO 4 raciones** si existe restricción energética erMedDiet), exclusivamente **100% integrales**.
  - **Legumbres:** Mínimo 4 raciones/semana (prioridad proteica vegetal).
  - **Pescado:** **3 a 4 raciones por semana**, alternando blanco y azul.
  - **Hortalizas y Frutas:** Mínimo 3 raciones de hortalizas y 2-3 de frutas frescas (excluyendo desecadas/almíbar).
  - **Hidratación:** El sistema debe monitorizar una ingesta de **1,5 a 2 litros de agua diarios** (4-8 vasos).

## 6. Requisitos Funcionales de Estilo de Vida e IA

La IA debe actuar como un gestor integral del comportamiento humano, reconociendo que la sensibilidad a la insulina depende de factores extrínsecos a la dieta.

- **Seguimiento de Actividad Física (RF-03):** Monitoreo de un objetivo de **150-300 min/semana** de actividad moderada, integrando al menos **2 días de fortalecimiento muscular**.
- **RNF-02 Convivialidad y Adherencia:** La IA priorizará recetas de técnica culinaria sencilla (vapor/hervido) y fomentará el "comer en compañía" (valor UNESCO) como requisito no funcional para la retención del paciente y bienestar emocional.
- **RNF-03 Sostenibilidad Local:** El motor de recomendaciones dará prioridad algorítmica a productos de temporada, de origen local y con minimización de envases.

## 7. Requisitos No Funcionales, Seguridad y Gobernanza

Dada la criticidad clínica de la DT2, la automatización opera bajo un marco de supervisión humana obligatoria para mitigar riesgos de salud.

- **Aviso Legal de Seguridad (RNF-01):** El sistema debe desplegar un aviso legal mandatorio: **"Toda recomendación, cantidad y plan nutricional debe ser validado por un dietista-nutricionista colegiado"**.
- **Registro Metabólico y Feedback Loop:** Se establece un módulo técnico de registro para glucosa, peso e IMC. Estos datos alimentan un bucle de **reajuste dinámico de la IA**, permitiendo que las recomendaciones energéticas evolucionen junto con el progreso metabólico del usuario.

Este mapa técnico asegura una solución de alta precisión clínica y conciencia ambiental, transformando la evidencia científica en una herramienta operativa de vanguardia.
