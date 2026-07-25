# Architecture Decisions — Pilares Obligatorios

Toda decisión arquitectónica DEBE pasar estos 4 pilares.

## 1. Security by Design + Security by Default

- La seguridad NO es un parche. Está en el ADN del producto.
- Aplicar OWASP Top 10 y NIST como baseline.
- Las configuraciones por defecto DEBEN ser seguras aunque el usuario no cambie nada.
- Least privilege: cada componente recibe el acceso mínimo necesario.
- Defense in depth: nunca depender de una sola capa de seguridad.

## 2. SRP + Modularidad (OCP)

- **Una razón para cambiar**: cada módulo, clase y función tiene exactamente UNA responsabilidad.
- **Abierto para extensión**: diseñar para añadir comportamiento sin modificar código existente.
- **Cerrado para modificación**: abstracciones estables que no requieren rewrites.
- **Nunca mezclar**: lógica de dominio NO vive con acceso a datos, presentación o infraestructura.

## 3. Domain Isolation

- El core NO depende de frameworks, bases de datos ni capas HTTP.
- Tests de dominio sin mocks de infraestructura.
- Evolución sin dolor: cambiar base de datos o framework UI sin tocar reglas de negocio.
- **Ubiquitous Language**: si el experto dice "clasificar", el código dice `classify()`, NO `insertRow()`.

## 4. Escalabilidad Organizacional

- Bounded Contexts que mapean a equipos autónomos.
- APIs contractuales entre contextos.
- Deploy independiente por contexto.
- Sin bases de datos compartidas entre contextos.

## Checklist

Antes de finalizar una decisión:
- [ ] ¿Cada módulo tiene UNA razón para cambiar? (SRP)
- [ ] ¿Las reglas de negocio están libres de dependencias de framework? (Domain Isolation)
- [ ] ¿Se puede extender sin modificar código existente? (OCP)
- [ ] ¿Las configuraciones por defecto son seguras sin acción del usuario? (Security by Default)
- [ ] ¿El código habla el lenguaje del experto de dominio? (Ubiquitous Language)
