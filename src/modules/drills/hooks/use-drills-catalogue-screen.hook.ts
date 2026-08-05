import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { toRemoteQueryView } from '@/shared/view';

import { DRILLS_ALL_FILTER, DRILL_NEW_ID } from '../constants/drills.constants';
import { buildDrillsCatalogueView } from '../helpers/drills-catalogue-view.helper';
import { buildDrillsListQueryOptions } from '../queries/drills.query';
import { drillDetailPath } from '../routes/drills.paths';
import type { DrillsPage } from '../types/drills.types';
import type { DrillsCatalogueScreenView } from '../types/drills-view.types';
import { useDrillsContext } from './use-drills-context.hook';

/**
 * The searchable drill list: one bounded page, narrowed client-side by
 * search text, category and status. The backend list endpoint has no
 * free-text search parameter, so this is the whole page's filtering surface.
 */
export function useDrillsCatalogueScreen(): DrillsCatalogueScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const context = useDrillsContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(DRILLS_ALL_FILTER);
  const [status, setStatus] = useState(DRILLS_ALL_FILTER);

  const query = useAppQuery<DrillsPage>(buildDrillsListQueryOptions(context.teamId));
  const view = toRemoteQueryView(query);

  return buildDrillsCatalogueView(t, {
    page: view.data,
    query: view,
    scope: { isOffline: context.isOffline, isLoading: context.isLoading },
    permitted: context.canManage,
    filter: { search, category, status },
    onSearchChange: setSearch,
    onCategoryFilterChange: setCategory,
    onStatusFilterChange: setStatus,
    onNewDrill: () => {
      navigation.push(drillDetailPath(DRILL_NEW_ID));
    },
    onOpen: (drillId) => {
      navigation.push(drillDetailPath(drillId));
    },
  });
}
