import type { TranslateParams } from '@/packages/i18n';
import type { SelectFieldOption } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_STATUSES,
  type AchievementStatus,
  type AchievementTransition,
} from '../constants/standings.constants';
import type { Achievement } from '../types/achievements.types';
import type { AchievementCardView } from '../types/achievements-view.types';
import {
  buildSourceTag,
  buildStatusChip,
  buildVisibilityChip,
  formatAchievedOn,
  resolveCategoryIcon,
  resolveCategoryLabel,
} from './achievement-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

export const TRANSITION_LABEL_KEYS: Readonly<Record<AchievementTransition, string>> = {
  submit: I18N_KEYS.standings.transitionSubmit,
  approve: I18N_KEYS.standings.transitionApprove,
  reject: I18N_KEYS.standings.transitionReject,
  archive: I18N_KEYS.standings.transitionArchive,
};

export const TRANSITION_CONFIRM_KEYS: Readonly<Record<AchievementTransition, string>> = {
  submit: I18N_KEYS.standings.transitionSubmit,
  approve: I18N_KEYS.standings.transitionApproveConfirm,
  reject: I18N_KEYS.standings.transitionRejectConfirm,
  archive: I18N_KEYS.standings.transitionArchiveConfirm,
};

/** The action tone of one transition. */
export function transitionTone(
  transition: AchievementTransition,
): 'primary' | 'secondary' | 'danger' {
  if (transition === 'reject') {
    return 'danger';
  }
  return transition === 'approve' ? 'primary' : 'secondary';
}

/** The status facet options, "All" first. */
export function buildStatusFilterOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: 'all', label: t(I18N_KEYS.standings.achievementsFilterAll) },
    ...ACHIEVEMENT_STATUSES.map((status: AchievementStatus) => ({
      value: status,
      label: buildStatusChip(t, status).label,
    })),
  ];
}

/** The category facet options, "All" first. */
export function buildCategoryFilterOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: 'all', label: t(I18N_KEYS.standings.achievementsFilterAll) },
    ...ACHIEVEMENT_CATEGORIES.map((category) => ({
      value: category,
      label: resolveCategoryLabel(t, category),
    })),
  ];
}

/** The per-card facts the workspace resolves outside the pure builder. */
export interface AchievementCardInputs {
  readonly item: Achievement;
  readonly locale: string;
  readonly memberName: (membershipId: string) => string;
  readonly onOpen: () => void;
}

/** One workspace card, with the subject resolved to a member or "our team". */
export function buildAchievementCard(
  t: Translate,
  inputs: AchievementCardInputs,
): AchievementCardView {
  const { item } = inputs;
  return {
    key: item.achievementId,
    iconName: resolveCategoryIcon(item.category),
    title: item.title,
    achievedOn: formatAchievedOn(inputs.locale, item.achievedOn),
    subject:
      item.membershipId === null
        ? t(I18N_KEYS.standings.ourTeamLabel)
        : inputs.memberName(item.membershipId),
    statusChip: buildStatusChip(t, item.status),
    visibilityChip: buildVisibilityChip(t, item.visibility),
    sourceTag: buildSourceTag(t, item),
    onOpen: inputs.onOpen,
  };
}
