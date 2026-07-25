# Domain-Driven Development — Análisis Semántico

## Cuándo usar

- Requisitos crudos o ambiguos.
- Diferentes stakeholders usan la misma palabra con distinto significado.
- Múltiples documentos describen conceptos solapados con nombres inconsistentes.
- Una feature se siente enredada — el conflicto real es de lenguaje, no de lógica.

## Workflow

1. **Extraer términos del dominio** — todo sustantivo y verbo con significado de negocio
2. **Detectar polisemia** — ¿un nutriólogo y un desarrollador entienden lo mismo?
3. **Agrupar en Bounded Contexts** — por lenguaje ubicuo, reglas coherentes, ciclo de vida independiente
4. **Señalar conflictos** — nombre de contextos, explicar por qué colisionan, proponer término canónico

## Output esperado

- **Términos polisémicos**: tabla con Término, Significado Contexto A, Significado Contexto B, Conflicto
- **Bounded Context Map**: contextos, términos core, relaciones (upstream/downstream, shared kernel)
- **Nudos semánticos**: términos que bloquean el progreso por significar cosas incompatibles
- **Sugerencias de desambiguación**: resolución propuesta para cada conflicto

## Regla dura

**Desatar el nudo semántico antes de programar.** Sin código. Solo análisis.
