# Code Smells — Detección y Taxonomía

## Triangulación

Usar múltiples tests para triangular la solución correcta. 3 tests (límite inferior, límite exacto, caso general) confirman la implementación sin sobre-ingeniería.

## Taxonomía

### 🏗 Estructurales
- **Long Method**: método > 20 líneas → extraer
- **Large Class**: clase con múltiples responsabilidades → split
- **Long Parameter List**: > 3 parámetros → objeto/interface
- **Data Clumps**: grupos de datos que siempre viajan juntos → tipo compuesto

### 🔄 Comportamiento
- **Duplicate Code**: misma lógica en 2+ lugares → extraer a shared
- **Switch Statements**: condicionales por tipo → polimorfismo o strategy
- **Lazy Class**: clase que no hace nada → eliminar
- **Dead Code**: código no referenciado → eliminar

### 🎯 Orientados a Objetos
- **Feature Envy**: método que usa más datos de otra clase que de la propia → mover
- **Inappropriate Intimacy**: clases que conocen demasiado los internos de otra → desacoplar
- **Refused Bequest**: subclase que no usa lo heredado → composición sobre herencia
- **Middle Man**: clase que solo delega → eliminar intermediario

### 💾 Datos
- **Primitive Obsession**: usar strings/numbers para conceptos de dominio → value objects
- **Data Class**: clase sin comportamiento → añadir lógica donde pertenece
- **Temporary Field**: campo que solo tiene valor en ciertos estados → extraer estado
- **Magic Numbers**: números sin nombre → constantes con semántica clínica
