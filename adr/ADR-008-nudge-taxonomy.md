# ADR-008: Nudge Taxonomy — Unified Notification Model

**Status:** Accepted  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

INFORME_ADR FR-2 defines per-group "alertas de sistema" using six different labels in the same table column with no taxonomy:

| Label in INFORME_ADR | Example                                                                      | Applies to                          |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `ALERT`              | "Si Caloric_Restriction == TRUE y Rations > 4"                               | Cereales, Frutas                    |
| `SYSTEM`             | "Sugerir receta si Count < 3 a las 20:00h"                                   | Hortalizas, AOVE, Legumbres, Huevos |
| `NUDGE`              | "Si Animal_Protein > 2, sugerir fuente calcio vegetal"                       | Lácteos, Agua                       |
| `TAG`                | "High_Protein_Low_Fat para Bacalao (0.7% grasa)"                             | Pescado                             |
| `LIMIT`              | "Restringir si se han superado raciones de pescado"                          | Carnes Blancas                      |
| —                    | (no label for Agua's hydration reminder — classified under NUDGE by context) | Agua                                |

These labels conflate **who receives the notification**, **whether it blocks user action**, **what triggers it**, and **what the system should do**. Without a taxonomy, the `NudgeEngine` cannot be designed — every notification type would require custom handling logic.

Additionally, SPECS_TECH introduces notification types not present in INFORME_ADR:

- Nudge de hiperglucemia: "si glucosa elevada → sugerir caminata o receta rica en fibra soluble"
- Ajuste HC por actividad: "si actividad nula, reducir carga de carbohidratos"

## Decision

### Taxonomy: Three Notification Categories

Every system notification belongs to exactly one of these three types:

```
Notification
├── SafetyAlert      — Clinical risk. Blocks or warns. Requires human attention.
├── SystemAction     — Automatic behavior. Invisible to user. Modifies system state.
└── BehavioralNudge  — User-facing suggestion. Non-blocking. Encourages adherence.
```

#### 1. SafetyAlert

**Purpose**: prevent clinical harm. Always visible to the user and traceable by the dietitian.

| Property                 | Value                                         |
| ------------------------ | --------------------------------------------- |
| Blocks user action?      | Yes (hard) or warns (soft, user can override) |
| Target                   | User (push/UI) + Dietitian (dashboard)        |
| Requires acknowledgment? | Yes                                           |
| Logged for audit?        | Yes                                           |

Examples from INFORME_ADR:

| Original label | Rule                                                | Type                                                            |
| -------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `ALERT`        | Cereales: si restricción activa y raciones > 4      | `SafetyAlert` (hard block)                                      |
| `ALERT`        | Frutas: alta carga glucémica (uvas, dátiles, higos) | `SafetyAlert` (soft warning — user can proceed but is informed) |

#### 2. SystemAction

**Purpose**: automatic system behavior. Invisible to the user. No push notification.

| Property                 | Value                               |
| ------------------------ | ----------------------------------- |
| Blocks user action?      | No                                  |
| Target                   | System only (internal state change) |
| Requires acknowledgment? | No                                  |
| Logged for audit?        | Optional (debug mode)               |

Examples from INFORME_ADR:

| Original label | Rule                                                    | Type                                                          |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `SYSTEM`       | Hortalizas: sugerir receta a las 20:00h si deficitarias | `SystemAction` (triggers recipe suggestion in plan generator) |
| `SYSTEM`       | AOVE: tagging obligatorio en cada comida principal      | `SystemAction` (metadata enforcement at plan generation)      |
| `SYSTEM`       | Legumbres: requisito base para control glucémico        | `SystemAction` (constraint in plan generator)                 |
| `SYSTEM`       | Huevos: alternativa preferente a carnes rojas           | `SystemAction` (priority rule in recipe engine)               |
| `LIMIT`        | Carnes Blancas: restringir si pescado excedido          | `SystemAction` (cross-group constraint)                       |
| `TAG`          | Bacalao: High_Protein_Low_Fat                           | `SystemAction` (metadata assignment)                          |

#### 3. BehavioralNudge

**Purpose**: encourage adherence. User-facing but non-blocking. Can be ignored.

| Property                 | Value                                     |
| ------------------------ | ----------------------------------------- |
| Blocks user action?      | No                                        |
| Target                   | User (push notification or in-app banner) |
| Requires acknowledgment? | No (can be dismissed)                     |
| Logged for audit?        | Yes (engagement metrics)                  |

Examples from INFORME_ADR:

| Original label | Rule                                                   | Type              |
| -------------- | ------------------------------------------------------ | ----------------- |
| `NUDGE`        | Lácteos: si Animal_Protein > 2, sugerir calcio vegetal | `BehavioralNudge` |
| `NUDGE`        | Agua: recordatorio hídrico cada 3 horas                | `BehavioralNudge` |

### New SPECS_TECH Notifications Mapped

| SPECS_TECH requirement                                          | Type              | Rationale                                    |
| --------------------------------------------------------------- | ----------------- | -------------------------------------------- |
| Nudge de hiperglucemia: sugerir caminata o receta fibra soluble | `BehavioralNudge` | Non-blocking suggestion; user decides        |
| Ajuste HC por actividad: reducir carbohidratos si inactividad   | `SystemAction`    | Automatic plan adjustment, invisible to user |

### Mapping Summary

| INFORME_ADR label | Canonical type    |
| ----------------- | ----------------- |
| `ALERT`           | `SafetyAlert`     |
| `SYSTEM`          | `SystemAction`    |
| `NUDGE`           | `BehavioralNudge` |
| `LIMIT`           | `SystemAction`    |
| `TAG`             | `SystemAction`    |

### TypeScript Model

```ts
// src/shared/domain/notification.ts

export const NotificationType = {
  SAFETY_ALERT: 'safety_alert',
  SYSTEM_ACTION: 'system_action',
  BEHAVIORAL_NUDGE: 'behavioral_nudge',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationSeverity = {
  HARD_BLOCK: 'hard_block', // User cannot proceed
  SOFT_WARN: 'soft_warn', // User warned but can override
  INFO: 'info', // Informational only
} as const;

export type NotificationSeverity = (typeof NotificationSeverity)[keyof typeof NotificationSeverity];

export interface SystemNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity; // Only meaningful for SafetyAlert
  target: 'user' | 'dietitian' | 'system';
  title: string;
  body: string;
  ruleSource: string; // e.g. "INFORME_ADR FR-2: Cereales"
  triggeredAt: Date;
  acknowledgedAt?: Date; // Required for SafetyAlert
  dismissedAt?: Date; // Allowed for BehavioralNudge
}
```

### NudgeEngine Contract

```ts
// src/features/nudge-engine/services/nudgeEngine.ts

interface NudgeRule {
  id: string;
  type: NotificationType;
  condition: (context: NudgeContext) => boolean;
  buildNotification: (context: NudgeContext) => SystemNotification;
  cooldown: number; // Minimum minutes between repeated triggers
}

interface NudgeContext {
  userProfile: UserProfile;
  todayIntake: FoodGroupCounts;
  recentGlucose: GlucoseReading | null;
  currentPlan: MealPlan | null;
  lastActivity: Date | null;
}

function evaluateRules(rules: NudgeRule[], context: NudgeContext): SystemNotification[];
```

## Consequences

- ✅ All 17 INFORME_ADR rules + SPECS_TECH nudges map cleanly to 3 notification types
- ✅ `NudgeEngine` has a single `evaluateRules()` entry point instead of 6 bespoke handlers
- ✅ `SafetyAlert` → dietitian dashboard enables the "Human-in-the-loop" requirement from SPECS_TECH §5
- ✅ Audit trail: `SystemNotification.acknowledgedAt` / `dismissedAt` provide engagement data
- ✅ Cooldown prevents notification fatigue (hydration nudge every 3h, but not every minute)
- ❌ `SystemAction` notifications are invisible to users — debug logging must be toggleable to avoid hiding bugs
- ❌ Hard block `SafetyAlert` in UI requires design: what does a blocked user see? A disabled button? A red banner? This is a UX concern, not an architecture concern — deferred to implementation
