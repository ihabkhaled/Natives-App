import type { AchievementStatus, AchievementTransition } from '../constants/standings.constants';

/**
 * Display-only mirror of the backend achievement state machine
 * (`achievement.state-machine.ts`): draft → submitted → approved → archived,
 * with `submitted → rejected` terminal. The server decides every transition —
 * this table only chooses which buttons exist, so a UI action is always a
 * subset of what the backend would allow.
 */
const ALLOWED_TRANSITIONS: Readonly<Record<AchievementStatus, readonly AchievementTransition[]>> = {
  draft: ['submit'],
  submitted: ['approve', 'reject'],
  approved: ['archive'],
  rejected: [],
  archived: [],
};

/** The transitions the UI may offer for a claim in `status`. */
export function allowedTransitionsFor(status: AchievementStatus): readonly AchievementTransition[] {
  return ALLOWED_TRANSITIONS[status];
}

/** Whether a transition needs an explicit confirm step before it fires. */
export function transitionNeedsConfirm(transition: AchievementTransition): boolean {
  return transition !== 'submit';
}

/** Whether the confirm step collects an optional reason (the rejection epitaph). */
export function transitionCollectsReason(transition: AchievementTransition): boolean {
  return transition === 'reject';
}
