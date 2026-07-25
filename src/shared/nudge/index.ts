export { CooldownTracker } from './cooldownTracker';
export { NUDGE_RULES } from './rules';
export { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/constants/clinical';
export { buildNudgeContext, evaluateRules, evaluateAndEnqueue } from './engine';
export type { NudgeRule, SafetyRule, NudgeContext, NudgeEvaluation } from './types';
