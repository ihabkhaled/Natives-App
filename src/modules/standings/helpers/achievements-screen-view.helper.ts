import type { TranslateParams } from '@/packages/i18n';
import type { RemoteQueryView } from '@/shared/view';
import { resolveScreenStatus } from '@/shared/view';
import { I18N_KEYS } from '@/shared/i18n';

import { buildStandingsScreenCopy } from './standings-copy.helper';
import {
  buildAchievementCard,
  buildCategoryFilterOptions,
  buildStatusFilterOptions,
} from './achievement-workspace-view.helper';
import type { Achievement, AchievementsPage } from '../types/achievements.types';
import type {
  AchievementDetailView,
  AchievementFormView,
  AchievementsScreenView,
  ImportWizardView,
} from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The faceted filter slice of the workspace. */
interface WorkspaceFilterDeps {
  readonly statusValue: string;
  readonly categoryValue: string;
  readonly onStatusChange: (value: string) => void;
  readonly onCategoryChange: (value: string) => void;
}

function buildWorkspaceFilters(t: Translate, deps: WorkspaceFilterDeps) {
  return {
    statusFilterLabel: t(I18N_KEYS.standings.achievementsStatusFilterLabel),
    statusFilterValue: deps.statusValue,
    statusFilterOptions: buildStatusFilterOptions(t),
    onStatusFilterChange: deps.onStatusChange,
    categoryFilterLabel: t(I18N_KEYS.standings.achievementsCategoryFilterLabel),
    categoryFilterValue: deps.categoryValue,
    categoryFilterOptions: buildCategoryFilterOptions(t),
    onCategoryFilterChange: deps.onCategoryChange,
  };
}

/** Everything the workspace screen needs, assembled once. */
export interface WorkspaceScreenDeps {
  readonly context: {
    readonly isOffline: boolean;
    readonly isLoading: boolean;
    readonly canManage: boolean;
    readonly canImport: boolean;
  };
  readonly listQuery: RemoteQueryView<AchievementsPage>;
  readonly items: readonly Achievement[];
  readonly locale: string;
  readonly memberName: (membershipId: string) => string;
  readonly filters: WorkspaceFilterDeps;
  readonly onOpenAchievement: (achievementId: string) => void;
  readonly onOpenCreate: () => void;
  readonly onOpenImport: () => void;
  readonly form: AchievementFormView | null;
  readonly detail: AchievementDetailView | null;
  readonly importWizard: ImportWizardView | null;
  readonly banner: string | null;
}

export function buildAchievementsScreenView(
  t: Translate,
  deps: WorkspaceScreenDeps,
): AchievementsScreenView {
  return {
    ...buildStandingsScreenCopy(t, {
      error: deps.listQuery.error,
      isOffline: deps.context.isOffline,
      onRetry: deps.listQuery.refetch,
      emptyTitleKey: I18N_KEYS.standings.achievementsEmptyTitle,
      emptyMessageKey: I18N_KEYS.standings.achievementsEmptyMessage,
    }),
    status: resolveScreenStatus(
      deps.context,
      deps.listQuery,
      deps.context.canManage,
      deps.items.length > 0,
    ),
    title: t(I18N_KEYS.standings.achievementsTitle),
    subtitle: t(I18N_KEYS.standings.achievementsSubtitle),
    ...buildWorkspaceFilters(t, deps.filters),
    cards: deps.items.map((item) =>
      buildAchievementCard(t, {
        item,
        locale: deps.locale,
        memberName: deps.memberName,
        onOpen: () => {
          deps.onOpenAchievement(item.achievementId);
        },
      }),
    ),
    createLabel: deps.context.canManage ? t(I18N_KEYS.standings.createOpen) : null,
    onOpenCreate: deps.onOpenCreate,
    form: deps.form,
    detail: deps.detail,
    importLabel: deps.context.canImport ? t(I18N_KEYS.standings.importOpen) : null,
    onOpenImport: deps.onOpenImport,
    importWizard: deps.importWizard,
    banner: deps.banner,
  };
}
