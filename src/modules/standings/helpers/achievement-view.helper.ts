import { formatDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type {
  AchievementCategory,
  AchievementSource,
  AchievementStatus,
  AchievementVisibility,
} from '../constants/standings.constants';
import type { Achievement } from '../types/achievements.types';
import type { TimelineStepView } from '../types/achievements-view.types';
import type { ChipView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const CATEGORY_KEYS: Readonly<Record<AchievementCategory, string>> = {
  trophy: I18N_KEYS.standings.categoryTrophy,
  placement: I18N_KEYS.standings.categoryPlacement,
  award: I18N_KEYS.standings.categoryAward,
  milestone: I18N_KEYS.standings.categoryMilestone,
  spirit: I18N_KEYS.standings.categorySpirit,
  participation: I18N_KEYS.standings.categoryParticipation,
};

const CATEGORY_ICONS: Readonly<Record<AchievementCategory, 'trophy' | 'medal' | 'ribbon'>> = {
  trophy: 'trophy',
  placement: 'medal',
  award: 'medal',
  milestone: 'ribbon',
  spirit: 'ribbon',
  participation: 'ribbon',
};

const STATUS_VIEWS: Readonly<
  Record<AchievementStatus, { readonly key: string; readonly tone: string }>
> = {
  draft: { key: I18N_KEYS.standings.statusDraft, tone: 'medium' },
  submitted: { key: I18N_KEYS.standings.statusSubmitted, tone: 'warning' },
  approved: { key: I18N_KEYS.standings.statusApproved, tone: 'success' },
  rejected: { key: I18N_KEYS.standings.statusRejected, tone: 'danger' },
  archived: { key: I18N_KEYS.standings.statusArchived, tone: 'medium' },
};

const VISIBILITY_KEYS: Readonly<Record<AchievementVisibility, string>> = {
  public: I18N_KEYS.standings.visibilityPublic,
  team: I18N_KEYS.standings.visibilityTeam,
  staff: I18N_KEYS.standings.visibilityStaff,
};

const SOURCE_KEYS: Readonly<Record<AchievementSource, string>> = {
  manual: I18N_KEYS.standings.achievementSourceManual,
  derived: I18N_KEYS.standings.achievementSourceDerived,
  import: I18N_KEYS.standings.achievementSourceImport,
};

/** The translated category label. */
export function resolveCategoryLabel(t: Translate, category: AchievementCategory): string {
  return t(CATEGORY_KEYS[category]);
}

/** The category icon: trophies gold-tier, placements medal, the rest ribbon. */
export function resolveCategoryIcon(category: AchievementCategory): 'trophy' | 'medal' | 'ribbon' {
  return CATEGORY_ICONS[category];
}

/** The status chip: tones mirror the approval weight of each state. */
export function buildStatusChip(t: Translate, status: AchievementStatus): ChipView {
  const view = STATUS_VIEWS[status];
  return { label: t(view.key), tone: view.tone };
}

/** The visibility chip; `public` is what reaches the cabinet once approved. */
export function buildVisibilityChip(t: Translate, visibility: AchievementVisibility): ChipView {
  return {
    label: t(VISIBILITY_KEYS[visibility]),
    tone: visibility === 'public' ? 'tertiary' : 'medium',
  };
}

/** The source tag, citing the import reference when the row was imported. */
export function buildSourceTag(t: Translate, achievement: Achievement): string {
  const label = t(SOURCE_KEYS[achievement.source]);
  if (achievement.source === 'import' && achievement.importReference !== null) {
    return t(I18N_KEYS.standings.achievementImportReference, {
      source: label,
      reference: achievement.importReference,
    });
  }
  return label;
}

/** The achieved-on date, locale-formatted. */
export function formatAchievedOn(locale: string, achievedOn: string): string {
  return formatDate(`${achievedOn}T00:00:00.000Z`, locale);
}

/**
 * The status timeline: the happy path lit up to the current state, with
 * `rejected` rendered as a terminal branch instead of a fifth step.
 */
export function buildTimeline(
  t: Translate,
  status: AchievementStatus,
): readonly TimelineStepView[] {
  const path: readonly AchievementStatus[] = ['draft', 'submitted', 'approved', 'archived'];
  const reachedIndex = status === 'rejected' ? 1 : path.indexOf(status);
  const steps = path.map((step, index) => ({
    key: step,
    label: buildStatusChip(t, step).label,
    isCurrent: step === status,
    isReached: index <= reachedIndex,
  }));
  if (status !== 'rejected') {
    return steps;
  }
  return [
    ...steps,
    {
      key: 'rejected',
      label: buildStatusChip(t, 'rejected').label,
      isCurrent: true,
      isReached: true,
    },
  ];
}
