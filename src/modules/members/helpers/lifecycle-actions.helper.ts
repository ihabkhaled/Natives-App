import {
  LIFECYCLE_ACTION,
  MEMBERSHIP_STATUS,
  type LifecycleAction,
  type MembershipStatus,
} from '../constants/members.constants';
import type { LifecycleActionOptionView } from '../types/members-view.types';

type ActionTone = LifecycleActionOptionView['tone'];

/** Allowed lifecycle transitions per current status (UI affordance only). */
const ACTIONS_BY_STATUS: Record<MembershipStatus, readonly LifecycleAction[]> = {
  [MEMBERSHIP_STATUS.invited]: [LIFECYCLE_ACTION.activate, LIFECYCLE_ACTION.archive],
  [MEMBERSHIP_STATUS.active]: [
    LIFECYCLE_ACTION.deactivate,
    LIFECYCLE_ACTION.suspend,
    LIFECYCLE_ACTION.leave,
    LIFECYCLE_ACTION.archive,
  ],
  [MEMBERSHIP_STATUS.inactive]: [LIFECYCLE_ACTION.reactivate, LIFECYCLE_ACTION.archive],
  [MEMBERSHIP_STATUS.suspended]: [LIFECYCLE_ACTION.reactivate, LIFECYCLE_ACTION.archive],
  [MEMBERSHIP_STATUS.left]: [LIFECYCLE_ACTION.reactivate, LIFECYCLE_ACTION.archive],
  [MEMBERSHIP_STATUS.archived]: [LIFECYCLE_ACTION.reactivate],
  [MEMBERSHIP_STATUS.anonymized]: [],
};

const ACTION_TONES: Record<LifecycleAction, ActionTone> = {
  [LIFECYCLE_ACTION.activate]: 'primary',
  [LIFECYCLE_ACTION.reactivate]: 'primary',
  [LIFECYCLE_ACTION.deactivate]: 'secondary',
  [LIFECYCLE_ACTION.leave]: 'secondary',
  [LIFECYCLE_ACTION.suspend]: 'danger',
  [LIFECYCLE_ACTION.archive]: 'danger',
};

/** Lifecycle actions the admin may offer from the given status. */
export function availableLifecycleActions(status: MembershipStatus): readonly LifecycleAction[] {
  return ACTIONS_BY_STATUS[status];
}

/** Button tone for a lifecycle action (primary/secondary/danger). */
export function lifecycleActionTone(action: LifecycleAction): ActionTone {
  return ACTION_TONES[action];
}
