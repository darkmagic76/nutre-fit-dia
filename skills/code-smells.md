# Code Smells — Detection and Taxonomy

## Triangulation

Use multiple tests to triangulate the correct solution. 3 tests (lower bound, exact bound, general case) confirm the implementation without over-engineering.

## Taxonomy

### 🏗 Structural

- **Long Method**: method > 20 lines → extract
- **Large Class**: class with multiple responsibilities → split
- **Long Parameter List**: > 3 parameters → object/interface
- **Data Clumps**: data groups that always travel together → compound type

### 🔄 Behavioral

- **Duplicate Code**: same logic in 2+ places → extract to shared
- **Switch Statements**: type-based conditionals → polymorphism or strategy
- **Lazy Class**: class that does nothing → remove
- **Dead Code**: unreferenced code → remove

### 🎯 Object-Oriented

- **Feature Envy**: method that uses more data from another class than its own → move
- **Inappropriate Intimacy**: classes that know too much about another's internals → decouple
- **Refused Bequest**: subclass that does not use what it inherited → composition over inheritance
- **Middle Man**: class that only delegates → remove intermediary

### 💾 Data

- **Primitive Obsession**: using strings/numbers for domain concepts → value objects
- **Data Class**: class without behavior → add logic where it belongs
- **Temporary Field**: field that only has value in certain states → extract state
- **Magic Numbers**: unnamed numbers → constants with clinical semantics
