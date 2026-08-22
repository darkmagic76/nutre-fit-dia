import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateNudges, createCooldownOps } from './evaluateNudges';
import type { ContextInput } from '@domain/nudgeContext';
import type { SafetyRule } from '@domain/nudgeTypes';
import type { SystemNotification } from '@domain/index';
import { NotificationSeverity, NotificationType } from '@domain/index';
import type { NotificationRepository } from '@application/ports/notificationRepository';

// ─── In-memory fake implementing NotificationRepository ────────────────────

function makeFakeNotificationRepo(pending: SystemNotification[] = []): NotificationRepository {
  const enqueued: SystemNotification[] = [];
  const acknowledged: string[] = [];
  const history: SystemNotification[] = [];
  const cooldowns: Record<string, number> = {};

  return {
    getPending: () => pending,
    getHistory: () => history,
    enqueue: (n: SystemNotification) => {
      enqueued.push(n);
    },
    acknowledge: (id: string) => {
      acknowledged.push(id);
    },
    dismiss: (id: string) => {
      history.push({
        id,
        type: NotificationType.SYSTEM_ACTION,
        severity: NotificationSeverity.INFO,
        target: 'user',
        title: 'Dismissed',
        body: '',
        ruleSource: 'test',
        triggeredAt: new Date(),
      } as SystemNotification);
    },
    getCooldowns: () => cooldowns,
    registerCooldown: (id: string, timestamp: number) => {
      cooldowns[id] = timestamp;
    },
    resetCooldown: (id?: string) => {
      if (id) {
        delete cooldowns[id];
      } else {
        Object.keys(cooldowns).forEach((k) => delete cooldowns[k]);
      }
    },
    // Expose internals for test assertions
    _enqueued: enqueued,
    _acknowledged: acknowledged,
    _cooldowns: cooldowns,
  } as NotificationRepository & {
    _enqueued: SystemNotification[];
    _acknowledged: string[];
    _cooldowns: Record<string, number>;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeContextInput(overrides: Partial<ContextInput> = {}): ContextInput {
  return {
    caloricRestrictionActive: false,
    todayLog: [],
    weeklyMinutes: 0,
    trends: {
      glucoseAvg7d: null,
      glucoseLatest: null,
      weightAvg7d: null,
      weightLatest: null,
      weightTrend: null,
    },
    ...overrides,
  };
}

const ALWAYS_MATCH_RULE: SafetyRule = {
  id: 'ALWAYS_MATCH',
  type: NotificationType.BEHAVIORAL_NUDGE,
  cooldown: 0,
  severity: NotificationSeverity.SOFT_WARN,
  condition: () => true,
  title: 'Always match',
  body: 'This rule always matches',
};

const NEVER_MATCH_RULE: SafetyRule = {
  id: 'NEVER_MATCH',
  type: NotificationType.BEHAVIORAL_NUDGE,
  cooldown: 0,
  severity: NotificationSeverity.SOFT_WARN,
  condition: () => false,
  title: 'Never match',
  body: 'This rule never matches',
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('evaluateNudges (use case)', () => {
  let notifRepo: NotificationRepository & {
    _enqueued: SystemNotification[];
    _acknowledged: string[];
    _cooldowns: Record<string, number>;
  };

  beforeEach(() => {
    notifRepo = makeFakeNotificationRepo();
  });

  it('enqueues notifications for matching rules via port', () => {
    const ctx = makeContextInput({ caloricRestrictionActive: true });
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo);

    expect(notifRepo._enqueued).toHaveLength(1);
    expect(notifRepo._enqueued[0].ruleSource).toBe('ALWAYS_MATCH');
    expect(notifRepo._enqueued[0].title).toBe('Always match');
  });

  it('does not enqueue when no rules match', () => {
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo);

    expect(notifRepo._enqueued).toHaveLength(0);
  });

  it('honours cooldown — does not re-enqueue cooldowned rules', () => {
    // Pre-set cooldown so the rule is blocked
    notifRepo._cooldowns['ALWAYS_MATCH'] = Date.now() + 60000; // expires in 60s

    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo);

    expect(notifRepo._enqueued).toHaveLength(0);
  });

  it('registers cooldown after enqueue', () => {
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo);

    expect(notifRepo._cooldowns['ALWAYS_MATCH']).toBeDefined();
    expect(notifRepo._cooldowns['ALWAYS_MATCH']).toBeGreaterThan(0);
  });

  it('auto-resolves stale nudges when condition no longer met', () => {
    const pendingNudge: SystemNotification = {
      id: 'stale-1',
      type: NotificationType.BEHAVIORAL_NUDGE,
      severity: NotificationSeverity.SOFT_WARN,
      target: 'user',
      title: 'Stale',
      body: 'This is stale',
      ruleSource: 'NEVER_MATCH',
      triggeredAt: new Date(),
    };

    // Use the repo's pending mechanism via a fresh fake with pre-set pending
    const repoWithPending = makeFakeNotificationRepo([pendingNudge]);
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE]; // NEVER_MATCH condition returns false

    evaluateNudges(ctx, rules, repoWithPending);

    // Stale nudge should be auto-resolved (condition no longer met)
    expect(repoWithPending._acknowledged).toContain('stale-1');
  });

  it('auto-resolves HARD_BLOCK nudges when their condition no longer holds', () => {
    // Policy: a nudge is auto-resolved once its rule condition stops holding,
    // regardless of severity. HARD_BLOCK alerts (e.g. CEREALS_RESTRICTION) must
    // clear themselves after the user corrects the excess — they are not sticky.
    const hardBlockNudge: SystemNotification = {
      id: 'hard-block-1',
      type: NotificationType.SAFETY_ALERT,
      severity: NotificationSeverity.HARD_BLOCK,
      target: 'user',
      title: 'Hard Block',
      body: 'Condition no longer met',
      ruleSource: 'NEVER_MATCH',
      triggeredAt: new Date(),
    };

    const repoWithPending = makeFakeNotificationRepo([hardBlockNudge]);
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE];

    evaluateNudges(ctx, rules, repoWithPending);

    // HARD_BLOCK is auto-resolved because its rule condition returns false.
    expect(repoWithPending._acknowledged).toContain('hard-block-1');
  });

  it('resets the cooldown of an auto-resolved nudge so it can re-fire later', () => {
    // Lifecycle: a nudge fires and registers its cooldown; when the condition
    // ceases the nudge is auto-resolved AND its cooldown is cleared, so exceeding
    // again re-emits it instead of being silently blocked by the stale cooldown.
    const staleNudge: SystemNotification = {
      id: 'cereals-1',
      type: NotificationType.SAFETY_ALERT,
      severity: NotificationSeverity.HARD_BLOCK,
      target: 'user',
      title: 'Cereals',
      body: 'Condition no longer met',
      ruleSource: 'NEVER_MATCH',
      triggeredAt: new Date(),
    };

    const repoWithPending = makeFakeNotificationRepo([staleNudge]) as ReturnType<
      typeof makeFakeNotificationRepo
    > & { _cooldowns: Record<string, number> };
    // Simulate a previously-registered cooldown for this rule.
    repoWithPending.registerCooldown('NEVER_MATCH', Date.now());
    expect(repoWithPending._cooldowns['NEVER_MATCH']).toBeDefined();

    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE];

    evaluateNudges(ctx, rules, repoWithPending);

    // Auto-resolved AND cooldown cleared.
    expect(repoWithPending._acknowledged).toContain('cereals-1');
    expect(repoWithPending._cooldowns['NEVER_MATCH']).toBeUndefined();
  });

  it('does not auto-resolve when rule not found', () => {
    const orphanNudge: SystemNotification = {
      id: 'orphan-1',
      type: NotificationType.BEHAVIORAL_NUDGE,
      severity: NotificationSeverity.SOFT_WARN,
      target: 'user',
      title: 'Orphan',
      body: 'No matching rule',
      ruleSource: 'NONEXISTENT_RULE',
      triggeredAt: new Date(),
    };

    const repoWithPending = makeFakeNotificationRepo([orphanNudge]);
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, repoWithPending);

    // Orphan should NOT be auto-resolved (rule not found → skip)
    expect(repoWithPending._acknowledged).not.toContain('orphan-1');
  });

  it('is testable with in-memory fake (zero Zustand)', () => {
    const ctx = makeContextInput({ caloricRestrictionActive: true });
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo);

    expect(notifRepo._enqueued).toHaveLength(1);
    // Proof: no Zustand or store imports required
  });
});

describe('createCooldownOps', () => {
  it('delegates resetCooldown to the notification repository', () => {
    const notifRepo = makeFakeNotificationRepo();
    const ops = createCooldownOps(notifRepo);

    ops.resetCooldown('rule-1');

    expect(notifRepo._cooldowns).not.toHaveProperty('rule-1');
  });

  it('delegates getCooldowns to the notification repository', () => {
    const notifRepo = makeFakeNotificationRepo();
    notifRepo.registerCooldown('rule-1', Date.now());

    const ops = createCooldownOps(notifRepo);
    const cooldowns = ops.getCooldowns();

    expect(cooldowns).toHaveProperty('rule-1');
  });

  it('delegates registerCooldown to the notification repository', () => {
    const notifRepo = makeFakeNotificationRepo();
    const ops = createCooldownOps(notifRepo);

    ops.registerCooldown('rule-2', 12345);

    expect(notifRepo._cooldowns).toHaveProperty('rule-2', 12345);
  });
});
