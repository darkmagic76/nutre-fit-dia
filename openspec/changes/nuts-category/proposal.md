# Proposal: Categoría NUTS (Frutos Secos)

## Intent
Completar el gap AESAN 2022 identificado en AUDIT_CLEAN.md §5b. La categoría de frutos secos está ausente del código a pesar de ser una recomendación explícita:

> "3 o más raciones/semana de frutos secos, hasta un consumo de 1 ración diaria, eligiendo aquellos sin sal ni grasas ni azúcares añadidos"

## Scope
- NUTS como 12ª categoría alimentaria en el dominio
- Validación dual: mínimo semanal (≥3/sem) + máximo diario (≤1/día)
- Catálogo de 5 frutos secos crudos (almendras, nueces, avellanas, anacardos, pistachos)
- 2 reglas de nudge: déficit semanal + exceso diario
- Clasificación semáforo: GREEN por defecto
- Traducciones ES/EN
- ~8-10 tests nuevos

## Approach
Capa por capa, TDD estricto (RED → GREEN → REFACTOR):
1. Domain — enum + schema + umbrales + validación + gram standards
2. Data — 5 alimentos en catálogo
3. i18n — categoría + nudge texts ES/EN
4. Nudge — 2 reglas nuevas
5. Feature — semáforo GREEN default
6. Tests — nuevos + actualizar 2 existentes

## Risk Assessment
- Validación dual separada: min semanal en validateWeeklyRations, max diario en validateRations
- Tests existentes: actualizar count assertions (11→12) y agregar NUTS=3 a weekly balance
- Plan Generator: no afecta — solo validación

## Estimated Effort
- Archivos: 12
- Líneas: ~256
- Tests nuevos: 8-10
- Por debajo del límite de 400 líneas

## Dependencies
Ninguna — cambio standalone.
