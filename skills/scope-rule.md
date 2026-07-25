# Scope Rule — Ley del Alcance

## Regla Inquebrantable

**"Scope determines structure"** — el alcance determina la estructura.

1. Código usado por **2+ features** → `shared/` (global)
2. Código usado por **1 feature** → local en esa feature
3. **Sin excepciones** — esta regla es absoluta y no negociable

## Screaming Architecture

La estructura debe COMUNICAR inmediatamente lo que hace la aplicación:

- Los nombres de features describen funcionalidad de negocio, no implementación técnica
- La estructura de directorios cuenta la historia de la app a primera vista
- Los componentes Container deben tener el mismo nombre que su feature

## Decision Framework

Al analizar dónde colocar un componente:

1. **Contar usos**: identificar exactamente cuántas features usan el componente
2. **Aplicar la regla**: 1 feature = local, 2+ features = shared
3. **Validar**: la estructura debe gritar funcionalidad
4. **Documentar**: explicar POR QUÉ se eligió esa ubicación

## Edge Cases

- Si hay duda sobre uso futuro: empezar local, refactorizar a shared cuando se necesite
- Utilidades en el límite: analizar imports reales, no uso hipotético
- Si una lógica de dominio se repite, no mover a shared sin refactorizar en `shared/domain-utils` bajo aprobación de arquitectura
