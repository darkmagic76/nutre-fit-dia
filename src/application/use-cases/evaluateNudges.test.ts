import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateNudges } from './evaluateNudges';
import type { ContextInput } from '@domain/nudgeContext';
import type { SafetyRule } from '@domain/nudgeTypes';
import type { SystemNotification } from '@domain/index';
import { NotificationSeverity, NotificationType } from '@domain/index';

// ─── Types matching inline port interfaces ─────────────────────────────────

interface FakeNotificationRepo {
  enqueued: SystemNotification[];
  acknowledged: string[];
  pending: SystemNotification[];
  cooldowns: Record<string, number>;
}

function makeFakeNotificationRepo(pending: SystemNotification[] = []): FakeNotificationRepo {
  return {
    enqueued: [],
    acknowledged: [],
    pending,
    cooldowns: {},
    enqueue(n: SystemNotification) {
      this.enqueued.push(n);
    },
    acknowledge(id: string) {
      this.acknowledged.push(id);
    },
    getPending() {
      return this.pending;
    },
    getCooldowns() {
      return this.cooldowns;
    },
    registerCooldown(id: string, timestamp: number) {
      this.cooldowns[id] = timestamp;
    },
    resetCooldown(id: string) {
      delete this.cooldowns[id];
    },
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
  let notifRepo: FakeNotificationRepo;

  beforeEach(() => {
    notifRepo = makeFakeNotificationRepo();
  });

  it('enqueues notifications for matching rules via port', () => {
    const ctx = makeContextInput({ caloricRestrictionActive: true });
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    expect(notifRepo.enqueued).toHaveLength(1);
    expect(notifRepo.enqueued[0].ruleSource).toBe('ALWAYS_MATCH');
    expect(notifRepo.enqueued[0].title).toBe('Always match');
  });

  it('does not enqueue when no rules match', () => {
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    expect(notifRepo.enqueued).toHaveLength(0);
  });

  it('honours cooldown — does not re-enqueue cooldowned rules', () => {
    // Pre-set cooldown so the rule is blocked
    notifRepo.cooldowns['ALWAYS_MATCH'] = Date.now() + 60000; // expires in 60s

    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    expect(notifRepo.enqueued).toHaveLength(0);
  });

  it('registers cooldown after enqueue', () => {
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    expect(notifRepo.cooldowns['ALWAYS_MATCH']).toBeDefined();
    expect(notifRepo.cooldowns['ALWAYS_MATCH']).toBeGreaterThan(0);
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

    notifRepo.pending = [pendingNudge];
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE]; // NEVER_MATCH condition returns false

    evaluateNudges(ctx, rules, notifRepo as any);

    // Stale nudge should be auto-resolved (condition no longer met)
    expect(notifRepo.acknowledged).toContain('stale-1');
  });

  it('does not auto-resolve HARD_BLOCK severity nudges', () => {
    const hardBlockNudge: SystemNotification = {
      id: 'hard-block-1',
      type: NotificationType.SAFETY_ALERT,
      severity: NotificationSeverity.HARD_BLOCK,
      target: 'user',
      title: 'Hard Block',
      body: 'This requires explicit ack',
      ruleSource: 'NEVER_MATCH',
      triggeredAt: new Date(),
    };

    notifRepo.pending = [hardBlockNudge];
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [NEVER_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    // HARD_BLOCK should NOT be auto-resolved
    expect(notifRepo.acknowledged).not.toContain('hard-block-1');
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

    notifRepo.pending = [orphanNudge];
    const ctx = makeContextInput();
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    // Orphan should NOT be auto-resolved (rule not found → skip)
    expect(notifRepo.acknowledged).not.toContain('orphan-1');
  });

  it('is testable with in-memory fake (zero Zustand)', () => {
    const ctx = makeContextInput({ caloricRestrictionActive: true });
    const rules: SafetyRule[] = [ALWAYS_MATCH_RULE];

    evaluateNudges(ctx, rules, notifRepo as any);

    expect(notifRepo.enqueued).toHaveLength(1);
    // Proof: no Zustand or store imports required
  });
});
