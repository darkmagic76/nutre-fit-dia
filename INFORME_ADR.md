# Especificación Funcional: Plataforma Digital de Salud Metabólica basada en erMedDiet

## 1. Fundamentos Médicos y Objetivos Estratégicos

La presente especificación técnica define los requisitos funcionales para una solución digital de salud orientada al manejo de la Diabetes Tipo 2 (DT2). El núcleo clínico se basa en la Dieta Mediterránea con reducción de energía (**erMedDiet**), un modelo que integra la alta calidad nutricional del patrón mediterráneo con una restricción calórica estratégica y actividad física protocolizada. A diferencia de las intervenciones convencionales, este sistema aborda la DT2 como una patología heterogénea influenciada por variantes genéticas y fenotípicas, priorizando la mejora de la sensibilidad a la insulina y la reducción de la adiposidad visceral mediante la sinergia de alimentos completos en lugar del simple conteo de macronutrientes aislados.

**[FR-1.1] Pilares Estratégicos del Sistema (AESAN 2022 / PREDIMED-Plus):**

- **Prevención Primaria y Secundaria de ENT:** Reducción de la incidencia de complicaciones cardiovasculares mediante patrones validados.
- **Mitigación de la Mortalidad Prematura:** Implementación de protocolos que han demostrado disminuir eventos fatales en pacientes crónicos.
- **Gestión del Exceso de Peso:** Aplicación de un déficit energético programado para revertir la dislipidemia y la obesidad.
- **Sostenibilidad y Salud Planetaria:** Alineación con los ODS 2030, optimizando la huella hídrica y de carbono en la selección de recetas.
- **Preservación del Bienestar Emocional:** Integración del estilo de vida mediterráneo (socialización y cocina tradicional) como factor de adherencia.

**[FR-1.2] Lógica de Transición Nutricional:** El sistema deberá pivotar del enfoque "nutricionista-centrista" (calorías/gramos) hacia un modelo de "patrones dietéticos". El éxito del usuario final depende de la matriz alimentaria; por ello, el algoritmo debe priorizar la sinergia entre alimentos (ej. fibra + carbohidratos complejos) para estabilizar la glucemia postprandial. Esta base médica se traduce en la siguiente lógica algorítmica de ingesta.

## 2. Lógica Algorítmica de Ingesta y Distribución Nutricional

El motor de cálculo deberá procesar las raciones recomendadas por la AESAN y la Pirámide Mediterránea adaptada para DT2, transformándolas en un plan de alimentación dinámico.

|                         |                                         |                                    |                                                                    |
| ----------------------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Grupo de Alimento       | Requisito Algorítmico                   | Parámetro Técnico / Tagging        | Alerta de Sistema (Trigger)                                        |
| **Cereales Integrales** | 3-6 raciones/día (Máx 4 en restricción) | Priorizar grano entero (bajo IG).  | **ALERT:** Si `Caloric_Restriction == TRUE` y `Rations > 4`.       |
| **Hortalizas**          | ≥ 3 raciones/día                        | Variedad cromática (fitoquímicos). | **SYSTEM:** Sugerir receta si `Count < 3` a las 20:00h.            |
| **Frutas**              | 2-3 raciones/día                        | Piezas enteras, local y temporada. | **ALERT:** Alta carga glucémica en uvas, dátiles e higos.          |
| **AOVE**                | 3-6 raciones/día                        | Fuente lipídica principal única.   | **SYSTEM:** Tagging obligatorio en cada comida principal.          |
| **Lácteos**             | Máx 3 raciones/día                      | Naturales, kéfir o quesos frescos. | **NUDGE:** Si `Animal_Protein > 2`, sugerir fuente calcio vegetal. |
| **Legumbres**           | 4 raciones/semana hasta diario          | Proteína vegetal + fibra.          | **SYSTEM:** Requisito base para control glucémico postprandial.    |
| **Pescado**             | ≥ 3 raciones/semana                     | Alternar blanco y azul (Omega-3).  | **TAG:** `High_Protein_Low_Fat` para Bacalao (0.7% grasa).         |
| **Huevos**              | Máximo 4/semana                         | Proteína de alta calidad.          | **SYSTEM:** Alternativa preferente a carnes rojas.                 |
| **Carnes Blancas**      | Máx 3 raciones/semana                   | Aves y conejo.                     | **LIMIT:** Restringir si se han superado raciones de pescado.      |
| **Agua**                | 1.5 - 2 Litros (4-8 vasos)              | Bebida de elección única.          | **NUDGE:** Recordatorio hídrico cada 3 horas.                      |

**[FR-2.1] Lógica de Cereales y Restricción Calórica:** El sistema aplicará un límite estricto de **4 raciones diarias** de cereales (siempre integrales) cuando el perfil del usuario requiera pérdida de peso. El algoritmo debe priorizar alimentos con alta densidad de fibra para mitigar la carga glucémica, siendo este el factor crítico para la estabilidad de la HbA1c.

**[FR-2.2] Factor de Sostenibilidad (Environmental Weight):** El motor de sugerencias aplicará un sistema de puntuación ambiental. Se priorizarán tubérculos y cereales de bajo impacto. El sistema informará al usuario que el arroz tiene una huella de carbono **4 veces superior al trigo y 12 veces superior a la patata**, ajustando la frecuencia de aparición en los planes semanales.

## 3. Especificación Técnica del Sistema de Semáforo Nutricional

Para asegurar la seguridad metabólica en el punto de compra, la plataforma integrará un escáner de alimentos procesados basado en el **Modelo del Hospital Rey Juan Carlos**.

**[FR-3.1] Algoritmo de Clasificación:**

- **Verde (Recomendable):** Alimentos base (AOVE, legumbres, pescado, cereales integrales).
- **Naranja (Moderación):** Carnes magras, arroz/pasta blanca, patatas y tubérculos amiláceos.
- **Rojo (Evitar):** Harinas refinadas, azúcares añadidos, grasas trans (margarinas), refrescos y carnes procesadas.

**[FR-3.2] Detección de "Ocultos" (String-Match Logic):** El escáner no se limitará a la tabla de macronutrientes. El sistema deberá ejecutar una búsqueda por cadena de texto en la lista de ingredientes para identificar azúcares libres encubiertos.

- **Criterio de Exclusión:** Identificación de términos como "sacarosa", "jarabe", "sirope", "maltodextrina" o "concentrado de zumo" en conservas y lácteos.
- **Acción:** Si se detecta coincidencia en ingredientes, el producto se clasificará automáticamente como **Rojo (Evitar)**, independientemente de su aporte calórico total.

## 4. Motor de Personalización y Dinámicas de Adherencia (Nudges)

La adaptación del plan debe responder a la heterogeneidad biológica del paciente con DT2.

**[FR-4.1] Filtro Fenotípico y Genético:** El sistema utilizará como claves primarias para la personalización:

- **Edad de Diagnóstico:** Para ajustar la agresividad de la restricción.
- **IMC Inicial:** Para el cálculo de la tasa metabólica basal (TMB).
- **Heterogeneidad de Datos:** Capacidad de procesar variantes comunes y raras que influyen en la respuesta metabólica.

**[FR-4.2] Protocolo de Restricción erMedDiet (PREDIMED-Plus):**

- **Déficit Energético:** Generación automática de planes con una reducción de **600 kcal diarias** respecto al gasto basal calculado.
- **Fraccionamiento:** Distribución obligatoria en un esquema de **3 a 6 tomas** para evitar excursiones glucémicas.

**[FR-4.3] Integración Biomecánica y Nudge Logic:**

- **API Activity Tracking:** Integración bidireccional con Google Fit / Apple Health. El sistema ajustará el presupuesto calórico del día en tiempo real según la actividad física realizada.
- **Triggers de Adherencia:** Si la entrada de glucosa capilar o peso falta por un periodo > 4 horas respecto al horario habitual, el sistema disparará un "Nudge" proactivo para incentivar el registro.
- **Objetivo Clínico:** La IA correlacionará la actividad física (inseparable de la nutrición) con la mejora de la sensibilidad a la insulina reportada por el usuario.

## 5. Protocolos de Seguridad Metabólica y Sostenibilidad

**[FR-5.1] Validación y UX Profesional:**

- **Requisito UI:** La pantalla de generación de plan dietético debe mostrar de forma prominente un aviso legal indicando que el plan requiere validación por un **Dietista-Nutricionista colegiado**.
- **Monitoreo de Biomarcadores:** Interfaz obligatoria de seguimiento para Glucosa, IMC y Peso, con visualización de tendencias para el facultativo.

**[FR-5.2] Patrimonio Cultural y Social (UNESCO):**

- **Metadata de Recetas:** Cada preparación incluirá etiquetas como `<Cocina_Tradicional>` o `<Social_Eating>` para fomentar el bienestar emocional y el valor social de la dieta mediterránea.
- **Sostenibilidad Alimentaria:** El motor de recetas priorizará productos de temporada y proximidad. La reducción de carnes rojas y lácteos se justificará no solo por el perfil de grasas saturadas, sino por la exigencia de los ODS 2030 y la salud planetaria (EAT-Lancet).

**[Conclusión Técnica]:** Esta especificación garantiza una solución digital que no solo es una base de datos nutricional, sino un asistente proactivo y ético. Al integrar métricas de impacto ambiental, lógica de detección de azúcares ocultos y personalización por fenotipo, la plataforma asegura una adherencia robusta al protocolo clínico erMedDiet, optimizando tanto la salud humana como la planetaria.
