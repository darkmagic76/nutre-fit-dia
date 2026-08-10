import type { NotificationRepository } from './notificationRepository';
import type { ActivityRepository } from './activityRepository';
import type { LogRepository } from './logRepository';
import type { BiomarkerRepository } from './biomarkerRepository';
import type { PlanRepository } from './planRepository';
import type { ContextInput } from '@domain/nudgeContext';
import type { ProfileInput } from '@application/dtos/ProfileInput';
import type { CaloricTargetOutput } from '@domain/caloricTargetService';

/**
 * Container interface — the single DI container for the application.
 *
 * Defined here (application/ports) so that shared/context can depend on
 * this port instead of importing from infrastructure/compositionRoot.
 * This enforces the Clean Architecture dependency rule.
 */
export interface Container {
  // Use cases
  calculateTarget: (input: ProfileInput) => {
    caloricTarget: CaloricTargetOutput | null;
    caloricRestrictionActive: boolean;
    profileError: Error | null;
  };
  evaluateNudges: (input: ContextInput) => void;
  exportData: () => string;

  // Repositories (port-level access)
  notificationRepo: NotificationRepository;
  activityRepo: ActivityRepository;
  logRepo: LogRepository;
  biomarkerRepo: BiomarkerRepository;
  planRepo: PlanRepository;
}
