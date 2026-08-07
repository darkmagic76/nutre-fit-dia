// Backward-compat barrel: delegates to domain locations.
export { buildNudgeContext } from '../../domain/nudgeContextBuilder';
export { evaluateRules } from '../../domain/nudgeEvaluator';

export type { ContextInput, NudgeContext } from '../../domain/nudgeContext';
export type { NudgeRule, SafetyRule, NudgeEvaluation } from '../../domain/nudgeTypes';
