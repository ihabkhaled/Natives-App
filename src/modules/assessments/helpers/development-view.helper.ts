import { formatDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  GOAL_STATUS,
  GOAL_STATUS_LABEL_KEYS,
  GOAL_STATUS_TONES,
  GOAL_TRANSITION,
} from '../constants/assessments.constants';
import type { GoalStatus, GoalTransition } from '../constants/assessments.constants';
import type {
  FeedbackCardView,
  FeedbackSectionView,
  GoalCardView,
  GoalTransitionView,
} from '../types/assessments-view.types';
import type { DevelopmentGoal, SharedFeedback } from '../types/assessments.types';

type Translate = (key: string, params?: TranslateParams) => string;

const FEEDBACK_FIELD_KEYS: readonly (readonly [keyof SharedFeedback, string])[] = [
  ['positiveFrisbee', I18N_KEYS.assessments.feedbackPositiveFrisbee],
  ['frisbeeImprovement', I18N_KEYS.assessments.feedbackFrisbeeImprovement],
  ['positiveMental', I18N_KEYS.assessments.feedbackPositiveMental],
  ['mentalImprovement', I18N_KEYS.assessments.feedbackMentalImprovement],
  ['teamRole', I18N_KEYS.assessments.feedbackTeamRole],
  ['recommendedPosition', I18N_KEYS.assessments.feedbackRecommendedPosition],
  ['summary', I18N_KEYS.assessments.feedbackSummary],
];

/**
 * Only fields the server actually shared render. A `null` field is absent, not
 * an empty heading — and the private coach note never reaches this shape.
 */
export function buildFeedbackSections(
  t: Translate,
  feedback: SharedFeedback,
): readonly FeedbackSectionView[] {
  return FEEDBACK_FIELD_KEYS.flatMap(([field, labelKey]) => {
    const body = feedback[field];
    return typeof body === 'string' && body.trim() !== ''
      ? [{ key: field, label: t(labelKey), body }]
      : [];
  });
}

export function buildFeedbackCard(
  t: Translate,
  locale: string,
  feedback: SharedFeedback,
): FeedbackCardView {
  const isAcknowledged = feedback.acknowledgedAtIso !== null;
  return {
    id: feedback.id,
    publishedLabel:
      feedback.publishedAtIso === null
        ? ''
        : `${t(I18N_KEYS.assessments.publishedAtLabel)}: ${formatDateTime(
            feedback.publishedAtIso,
            locale,
          )}`,
    sections: buildFeedbackSections(t, feedback),
    acknowledgeLabel: t(I18N_KEYS.assessments.feedbackAcknowledge),
    acknowledgedLabel:
      feedback.acknowledgedAtIso === null
        ? null
        : t(I18N_KEYS.assessments.feedbackAcknowledged, {
            when: formatDateTime(feedback.acknowledgedAtIso, locale),
          }),
    isAcknowledged,
    clarifyLabel: t(I18N_KEYS.assessments.feedbackRequestClarification),
    clarificationLabel: feedback.clarificationRequested
      ? t(I18N_KEYS.assessments.feedbackClarificationRequested)
      : null,
  };
}

/**
 * Progress as a percentage of the distance from baseline to target. Anything
 * unmeasured stays `null` — an unknown is never rendered as 0%.
 */
export function computeGoalProgressPercent(
  baselineValue: number | null,
  targetValue: number | null,
  progressValue: number | null,
): number | null {
  if (progressValue === null || targetValue === null) {
    return null;
  }
  const baseline = baselineValue ?? 0;
  const span = targetValue - baseline;
  if (span === 0) {
    return progressValue >= targetValue ? 100 : 0;
  }
  const ratio = ((progressValue - baseline) / span) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}

/** The single lifecycle move a player may make from a given goal status. */
export function resolveGoalTransition(status: GoalStatus): GoalTransition | null {
  if (status === GOAL_STATUS.Proposed) {
    return GOAL_TRANSITION.Activate;
  }
  if (status === GOAL_STATUS.Active) {
    return GOAL_TRANSITION.Achieve;
  }
  return status === GOAL_STATUS.Missed ? GOAL_TRANSITION.Reopen : null;
}

function buildTransition(t: Translate, status: GoalStatus): GoalTransitionView | null {
  if (status === GOAL_STATUS.Proposed) {
    return {
      transition: GOAL_TRANSITION.Activate,
      label: t(I18N_KEYS.assessments.goalActivate),
    };
  }
  if (status === GOAL_STATUS.Active) {
    return { transition: GOAL_TRANSITION.Achieve, label: t(I18N_KEYS.assessments.goalAchieve) };
  }
  if (status === GOAL_STATUS.Missed) {
    return { transition: GOAL_TRANSITION.Reopen, label: t(I18N_KEYS.assessments.goalReopen) };
  }
  return null;
}

export function buildGoalCard(t: Translate, entry: DevelopmentGoal): GoalCardView {
  const { goal } = entry;
  const percent = computeGoalProgressPercent(
    goal.baselineValue,
    goal.targetValue,
    goal.progressValue,
  );
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    statusLabel: t(GOAL_STATUS_LABEL_KEYS[goal.status]),
    statusTone: GOAL_STATUS_TONES[goal.status],
    targetLabel:
      goal.measurableTarget ??
      (goal.targetValue === null
        ? null
        : `${t(I18N_KEYS.assessments.goalTargetLabel)}: ${goal.targetValue}`),
    baselineLabel:
      goal.baselineValue === null
        ? null
        : `${t(I18N_KEYS.assessments.goalBaselineLabel)}: ${goal.baselineValue}`,
    progressLabel:
      percent === null
        ? t(I18N_KEYS.assessments.goalProgressUnknown)
        : t(I18N_KEYS.assessments.goalProgressValue, { percent }),
    progressPercent: percent,
    dueLabel:
      goal.dueDate === null
        ? t(I18N_KEYS.assessments.goalNoDue)
        : `${t(I18N_KEYS.assessments.goalDueLabel)}: ${goal.dueDate}`,
    actionsLabel: t(I18N_KEYS.assessments.goalActionsLabel),
    actions: entry.actions.map((action, index) => ({
      key: `${goal.id}-${String(index)}`,
      description: action.description,
      done: action.done,
      stateLabel: t(
        action.done ? I18N_KEYS.assessments.goalActionDone : I18N_KEYS.assessments.goalActionOpen,
      ),
      dueLabel:
        action.dueDate === null
          ? null
          : `${t(I18N_KEYS.assessments.goalDueLabel)}: ${action.dueDate}`,
    })),
    transition: buildTransition(t, goal.status),
  };
}
