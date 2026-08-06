import type { SystemNotification } from '@domain/index';

/** NotificationRepository — application port for nudge notification side effects. */
export interface NotificationRepository {
  /** Get pending (not yet acknowledged or dismissed) notifications. */
  getPending(): SystemNotification[];

  /** Get notification history (acknowledged or dismissed). */
  getHistory(): SystemNotification[];

  /** Enqueue a new notification. */
  enqueue(notification: SystemNotification): void;

  /** Acknowledge a notification by ID (moves to history). */
  acknowledge(id: string): void;

  /** Dismiss a notification by ID (moves to history). */
  dismiss(id: string): void;

  /** Get current cooldowns map (rule-id → timestamp). */
  getCooldowns(): Record<string, number>;

  /** Register a cooldown for a rule. */
  registerCooldown(id: string, timestamp: number): void;

  /** Reset cooldown(s). If no id, reset all. */
  resetCooldown(id?: string): void;
}
