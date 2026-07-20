import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import type {
  CandidateStatus,
  DecisionOutcome,
  EvaluationCriterion,
  TryoutEventStatus,
} from './tryouts.constants';

export const EVENT_STATUS_LABEL_KEYS: Record<TryoutEventStatus, string> = {
  scheduled: I18N_KEYS.tryouts.eventStatusScheduled,
  open: I18N_KEYS.tryouts.eventStatusOpen,
  closed: I18N_KEYS.tryouts.eventStatusClosed,
  completed: I18N_KEYS.tryouts.eventStatusCompleted,
};

export const EVENT_STATUS_TONES: Record<TryoutEventStatus, string> = {
  scheduled: 'medium',
  open: 'success',
  closed: 'warning',
  completed: 'medium',
};

export const CANDIDATE_STATUS_LABEL_KEYS: Record<CandidateStatus, string> = {
  registered: I18N_KEYS.tryouts.statusRegistered,
  waitlisted: I18N_KEYS.tryouts.statusWaitlisted,
  checked_in: I18N_KEYS.tryouts.statusCheckedIn,
  evaluated: I18N_KEYS.tryouts.statusEvaluated,
  accepted: I18N_KEYS.tryouts.statusAccepted,
  declined: I18N_KEYS.tryouts.statusDeclined,
  withdrawn: I18N_KEYS.tryouts.statusWithdrawn,
  converted: I18N_KEYS.tryouts.statusConverted,
};

export const CANDIDATE_STATUS_TONES: Record<CandidateStatus, string> = {
  registered: 'primary',
  waitlisted: 'warning',
  checked_in: 'success',
  evaluated: 'secondary',
  accepted: 'success',
  declined: 'danger',
  withdrawn: 'medium',
  converted: 'primary',
};

export const CRITERION_LABEL_KEYS: Record<EvaluationCriterion, string> = {
  throwing: I18N_KEYS.tryouts.criterionThrowing,
  catching: I18N_KEYS.tryouts.criterionCatching,
  movement: I18N_KEYS.tryouts.criterionMovement,
  attitude: I18N_KEYS.tryouts.criterionAttitude,
};

export const DECISION_LABEL_KEYS: Record<DecisionOutcome, string> = {
  accept: I18N_KEYS.tryouts.decisionAccept,
  waitlist: I18N_KEYS.tryouts.decisionWaitlist,
  decline: I18N_KEYS.tryouts.decisionDecline,
};

export const DECISION_TEST_IDS: Record<DecisionOutcome, string> = {
  accept: TEST_IDS.tryoutDecisionAccept,
  waitlist: TEST_IDS.tryoutDecisionWaitlist,
  decline: TEST_IDS.tryoutDecisionDecline,
};

export const DECISION_TONES: Record<DecisionOutcome, string> = {
  accept: 'primary',
  waitlist: 'secondary',
  decline: 'danger',
};

/** The shared async-state copy the tryout screens draw from. */
export const TRYOUTS_COPY_NAMESPACE = {
  loadingLabel: I18N_KEYS.tryouts.loadingLabel,
  errorTitle: I18N_KEYS.tryouts.errorTitle,
  errorMessage: I18N_KEYS.tryouts.errorMessage,
  retry: I18N_KEYS.tryouts.retry,
  offlineTitle: I18N_KEYS.tryouts.offlineTitle,
  offlineMessage: I18N_KEYS.tryouts.offlineMessage,
  forbiddenTitle: I18N_KEYS.tryouts.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.tryouts.forbiddenMessage,
} as const;
