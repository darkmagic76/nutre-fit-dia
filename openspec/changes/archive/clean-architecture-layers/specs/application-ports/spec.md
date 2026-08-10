# Application Ports Specification

## Purpose

Pure TypeScript interfaces defining repository contracts in `src/application/ports/`. These ports are the boundary between use cases and infrastructure. Zero framework imports — interfaces only.

## Requirements

### Requirement: NotificationRepository Interface

`NotificationRepository` MUST define a pure TypeScript interface with methods: `getPending`, `getHistory`, `enqueue`, `acknowledge`, `dismiss`, `getCooldowns`, `registerCooldown`, `resetCooldown`.

#### Scenario: Interface is TypeScript-only

- GIVEN `application/ports/notificationRepository.ts`
- WHEN inspecting the file
- THEN it SHALL contain only `interface` and type declarations
- AND zero `from 'react'`, `from 'zustand'`, or `from '@infrastructure/*'` imports SHALL exist

#### Scenario: All eight methods declared

- GIVEN the `NotificationRepository` interface
- THEN it SHALL declare `getPending(): SystemNotification[]`, `getHistory(): SystemNotification[]`, `enqueue(n: SystemNotification): void`, `acknowledge(id: string): void`, `dismiss(id: string): void`, `getCooldowns(): Record<string, number>`, `registerCooldown(id: string, timestamp: number): void`, `resetCooldown(id?: string): void`

### Requirement: ActivityRepository Interface

`ActivityRepository` MUST define: `getWeeklyMinutes`, `getStrengthSessions`, `getEntries`, `addEntry`, `getStreak`.

#### Scenario: All ActivityRepository methods declared

- GIVEN the `ActivityRepository` interface
- THEN it SHALL declare methods matching `useActivityStore` public API: `getWeeklyMinutes(): number`, `getStrengthSessions(): number`, `getEntries(): ActivityEntry[]`, `addEntry(entry: ActivityEntry): void`, `getStreak(): number`

### Requirement: LogRepository Interface

`LogRepository` MUST define: `getTodayLog`, `addFood`, `removeFood`, `clearLog`.

#### Scenario: All LogRepository methods declared

- GIVEN the `LogRepository` interface
- THEN it SHALL declare: `getTodayLog(): Food[]`, `addFood(food: Food): void`, `removeFood(index: number): void`, `clearLog(): void`

### Requirement: BiomarkerRepository Interface

`BiomarkerRepository` MUST define: `getGlucoseHistory`, `getWeightHistory`, `getTrend`, `recordGlucose`, `recordWeight`, `detectThresholdCrossing`.

#### Scenario: All BiomarkerRepository methods declared

- GIVEN the `BiomarkerRepository` interface
- THEN it SHALL declare: `getGlucoseHistory(): GlucoseReading[]`, `getWeightHistory(): WeightReading[]`, `getTrend(): BiomarkerTrend`, `recordGlucose(reading: GlucoseReading): void`, `recordWeight(kg: number, cm: number): WeightReading`, `detectThresholdCrossing(): 'crossed_above' | 'crossed_below' | null`

### Requirement: Ports Return Domain Types

Every port method SHALL return or accept domain types (`Food`, `SystemNotification`, `ActivityEntry`, `GlucoseReading`, `WeightReading`, `BiomarkerTrend`).

#### Scenario: Port methods reference domain types

- GIVEN any port method signature
- WHEN inspecting return and parameter types
- THEN all types SHALL resolve to `domain/` modules
- AND no infrastructure-specific types (e.g., Zustand middleware, `StoreApi`) SHALL appear
