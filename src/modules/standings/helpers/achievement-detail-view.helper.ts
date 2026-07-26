import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AchievementTransition } from '../constants/standings.constants';
import {
  allowedTransitionsFor,
  transitionCollectsReason,
  transitionNeedsConfirm,
} from './achievement-transition.helper';
import {
  buildSourceTag,
  buildTimeline,
  buildVisibilityChip,
  formatAchievedOn,
  resolveCategoryLabel,
} from './achievement-view.helper';
import {
  TRANSITION_CONFIRM_KEYS,
  TRANSITION_LABEL_KEYS,
  transitionTone,
} from './achievement-workspace-view.helper';
import type { Achievement } from '../types/achievements.types';
import type {
  AchievementDetailView,
  TransitionActionView,
  TransitionConfirmView,
} from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

function buildFacts(t: Translate, locale: string, selected: Achievement) {
  const facts = [
    {
      key: 'category',
      label: t(I18N_KEYS.standings.achievementsCategoryFilterLabel),
      value: resolveCategoryLabel(t, selected.category),
    },
    {
      key: 'achieved-on',
      label: t(I18N_KEYS.standings.createDateLabel),
      value: formatAchievedOn(locale, selected.achievedOn),
    },
    {
      key: 'visibility',
      label: t(I18N_KEYS.standings.createVisibilityLabel),
      value: buildVisibilityChip(t, selected.visibility).label,
    },
    {
      key: 'source',
      label: t(I18N_KEYS.standings.sourceLabel),
      value: buildSourceTag(t, selected),
    },
  ];
  if (selected.approvedBy === null) {
    return facts;
  }
  return [
    ...facts,
    {
      key: 'approved-by',
      label: t(I18N_KEYS.standings.approvedByLabel),
      value: selected.approvedBy,
    },
  ];
}

/** Resolved callbacks the transition actions bind. */
export interface TransitionActionInputs {
  readonly canManage: boolean;
  readonly onArm: (transition: AchievementTransition) => void;
  readonly onFire: (transition: AchievementTransition) => void;
}

/** The gated action buttons for a claim's current state. */
export function buildTransitionActions(
  t: Translate,
  selected: Achievement,
  inputs: TransitionActionInputs,
): readonly TransitionActionView[] {
  if (!inputs.canManage) {
    return [];
  }
  return allowedTransitionsFor(selected.status).map((kind) => ({
    key: kind,
    label: t(TRANSITION_LABEL_KEYS[kind]),
    tone: transitionTone(kind),
    needsConfirm: transitionNeedsConfirm(kind),
    onTrigger: () => {
      if (transitionNeedsConfirm(kind)) {
        inputs.onArm(kind);
        return;
      }
      inputs.onFire(kind);
    },
  }));
}

/** Resolved state + callbacks the confirm step binds. */
export interface TransitionConfirmInputs {
  readonly armed: AchievementTransition | null;
  readonly selected: Achievement;
  readonly reason: string;
  readonly isRunning: boolean;
  readonly onReasonChange: (value: string) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** The pending confirm step, when a transition is armed. */
export function buildTransitionConfirm(
  t: Translate,
  inputs: TransitionConfirmInputs,
): TransitionConfirmView | null {
  const { armed } = inputs;
  if (armed === null) {
    return null;
  }
  const collectsReason = transitionCollectsReason(armed);
  return {
    message: t(TRANSITION_CONFIRM_KEYS[armed], { title: inputs.selected.title }),
    reasonLabel: collectsReason ? t(I18N_KEYS.standings.transitionReasonLabel) : null,
    reasonHint: collectsReason ? t(I18N_KEYS.standings.transitionReasonHint) : null,
    reasonValue: inputs.reason,
    onReasonChange: inputs.onReasonChange,
    confirmLabel: t(I18N_KEYS.standings.transitionConfirm),
    cancelLabel: t(I18N_KEYS.standings.transitionCancel),
    isRunning: inputs.isRunning,
    onConfirm: inputs.onConfirm,
    onCancel: inputs.onCancel,
  };
}

/** Resolved parts the detail panel binds. */
export interface DetailViewInputs {
  readonly selected: Achievement;
  readonly locale: string;
  readonly conflictNotice: string | null;
  readonly actions: readonly TransitionActionView[];
  readonly confirm: TransitionConfirmView | null;
  readonly onClose: () => void;
}

/** The opened claim: facts, timeline, rejection epitaph, and the transition bar. */
export function buildAchievementDetailView(
  t: Translate,
  inputs: DetailViewInputs,
): AchievementDetailView {
  return {
    heading: inputs.selected.title,
    facts: buildFacts(t, inputs.locale, inputs.selected),
    timelineHeading: t(I18N_KEYS.standings.timelineHeading),
    timeline: buildTimeline(t, inputs.selected.status),
    rejectionReason: inputs.selected.rejectionReason,
    rejectionReasonLabel: t(I18N_KEYS.standings.rejectionReasonLabel),
    conflictNotice: inputs.conflictNotice,
    actions: inputs.actions,
    confirm: inputs.confirm,
    closeLabel: t(I18N_KEYS.standings.detailClose),
    onClose: inputs.onClose,
  };
}
