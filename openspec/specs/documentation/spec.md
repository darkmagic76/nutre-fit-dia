# documentation Specification

## Purpose

Project documentation accuracy: remove Supabase JS references from README.md and SETUP.md per ADR-011, since Supabase is neither installed nor imported.

## Requirements

### Requirement: DOC-SUPABASE-REMOVAL

README.md stack tables (English and Spanish) SHALL NOT list Supabase JS as a dependency.

#### Scenario: English stack table has no Supabase row

- GIVEN the English "Tech Stack" table in README.md
- WHEN the table rows are inspected
- THEN no row with "Supabase JS" SHALL be present

#### Scenario: Spanish stack table has no Supabase row

- GIVEN the Spanish "Stack Tecnológico" table in README.md
- WHEN the table rows are inspected
- THEN no row with "Supabase JS" SHALL be present

### Requirement: DOC-SETUP-CLEANUP

SETUP.md SHALL NOT reference Supabase as an installed or optional dependency in any language section.

#### Scenario: English dependency table has no Supabase entry

- GIVEN the English "Dependencies / Decision Log" table in SETUP.md
- WHEN the table is inspected
- THEN no "Backend" row referencing Supabase SHALL exist

#### Scenario: English category list has no Supabase entry

- GIVEN the English "Key Dependencies" category table in SETUP.md
- WHEN the table is inspected
- THEN no "Backend (optional)" row referencing "Supabase JS" SHALL exist

#### Scenario: Spanish dependency table has no Supabase entry

- GIVEN the Spanish "Dependencias / Registro de Decisiones" table in SETUP.md
- WHEN the table is inspected
- THEN no "Backend" row referencing Supabase SHALL exist

#### Scenario: Spanish category list has no Supabase entry

- GIVEN the Spanish "Dependencias Clave" category table in SETUP.md
- WHEN the table is inspected
- THEN no "Backend (opcional)" row referencing "Supabase JS" SHALL exist
