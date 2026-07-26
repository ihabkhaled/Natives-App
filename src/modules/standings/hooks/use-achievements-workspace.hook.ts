import { useState } from 'react';

import { buildMembersDirectoryQueryOptions } from '@/modules/members';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import {
  STANDINGS_FILTER_ALL,
  STANDINGS_MEMBERS_PAGE_SIZE,
  type AchievementCategory,
  type AchievementStatus,
} from '../constants/standings.constants';
import { buildAchievementsScreenView } from '../helpers/achievements-screen-view.helper';
import { buildAchievementsQueryOptions } from '../queries/standings.query';
import type { AchievementsPage } from '../types/achievements.types';
import type { AchievementsScreenView } from '../types/achievements-view.types';
import { useAchievementCreate } from './use-achievement-create.hook';
import { useAchievementDetail } from './use-achievement-detail.hook';
import { useAchievementImport } from './use-achievement-import.hook';
import { useStandingsContext } from './use-standings-context.hook';

/**
 * View model of the achievements workspace: faceted list, plus the authoring,
 * approval, and import concerns delegated to sub-hooks so this hook stays
 * thin.
 */
export function useAchievementsWorkspace(): AchievementsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useStandingsContext();

  const [statusFilter, setStatusFilter] = useState<string>(STANDINGS_FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(STANDINGS_FILTER_ALL);
  const [isImportOpen, setImportOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const listQuery = toRemoteQueryView<AchievementsPage>(
    useAppQuery(
      buildAchievementsQueryOptions(
        context.teamId,
        {
          status:
            statusFilter === STANDINGS_FILTER_ALL ? null : (statusFilter as AchievementStatus),
          category:
            categoryFilter === STANDINGS_FILTER_ALL
              ? null
              : (categoryFilter as AchievementCategory),
        },
        0,
      ),
    ),
  );
  const membersQuery = toRemoteQueryView(
    useAppQuery(
      buildMembersDirectoryQueryOptions(context.teamId, { pageSize: STANDINGS_MEMBERS_PAGE_SIZE }),
    ),
  );
  const members = membersQuery.data?.items ?? [];
  const items = listQuery.data?.items ?? [];
  const memberName = (membershipId: string): string =>
    members.find((member) => member.membershipId === membershipId)?.displayName ?? membershipId;

  const createApi = useAchievementCreate(t, {
    teamId: context.teamId,
    locale,
    isOffline: context.isOffline,
    members,
    onBanner: setBanner,
  });
  const detailApi = useAchievementDetail(t, {
    teamId: context.teamId,
    locale,
    canManage: context.canManage,
    items,
    onChanged: setBanner,
    onRefetch: listQuery.refetch,
  });
  const importWizard = useAchievementImport(t, {
    teamId: context.teamId,
    isOffline: context.isOffline,
    isOpen: isImportOpen,
    onClose: () => {
      setImportOpen(false);
    },
    onCommitted: () => {
      setBanner(t(I18N_KEYS.standings.importDone));
    },
  });

  return buildAchievementsScreenView(t, {
    context,
    listQuery,
    items,
    locale,
    memberName,
    filters: {
      statusValue: statusFilter,
      categoryValue: categoryFilter,
      onStatusChange: setStatusFilter,
      onCategoryChange: setCategoryFilter,
    },
    onOpenAchievement: detailApi.openAchievement,
    onOpenCreate: createApi.openCreate,
    onOpenImport: () => {
      setImportOpen(true);
    },
    form: createApi.form,
    detail: detailApi.detail,
    importWizard,
    banner,
  });
}
