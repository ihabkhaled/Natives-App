import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, type RemoteQueryView } from '@/shared/view';

import { DRILL_CATEGORIES, DRILL_STATUSES } from '../constants/drills.constants';
import { DRILLS_LIST_SCREEN_COPY_KEYS } from '../constants/drills-copy.constants';
import {
  DRILL_CATEGORY_LABEL_KEYS,
  DRILL_STATUS_LABEL_KEYS,
} from '../constants/drills-labels.constants';
import type { DrillsPage } from '../types/drills.types';
import type { DrillCardView, DrillsCatalogueScreenView } from '../types/drills-view.types';
import { buildDrillCard } from './drill-card.helper';
import {
  buildDrillFilterOptions,
  filterDrillItems,
  type DrillsFilterState,
} from './drills-filter.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** Everything the list screen needs that is not itself copy. */
export interface DrillsCatalogueViewInput {
  readonly page: DrillsPage | undefined;
  readonly query: RemoteQueryView<DrillsPage>;
  readonly scope: { readonly isOffline: boolean; readonly isLoading: boolean };
  readonly permitted: boolean;
  readonly filter: DrillsFilterState;
  readonly onSearchChange: (value: string) => void;
  readonly onCategoryFilterChange: (value: string) => void;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onNewDrill: () => void;
  readonly onOpen: (drillId: string) => void;
}

/** The narrowed items for this render, and the cards built from them. */
function buildVisibleCards(
  t: Translate,
  page: DrillsPage | undefined,
  filter: DrillsFilterState,
): readonly DrillCardView[] {
  const items = filterDrillItems(page?.items ?? [], filter);
  return items.map((item) => buildDrillCard(t, item));
}

/** The three filter controls: their current value, options, and handlers. */
function buildFilterFields(
  t: Translate,
  input: DrillsCatalogueViewInput,
): Pick<
  DrillsCatalogueScreenView,
  | 'searchLabel'
  | 'searchPlaceholder'
  | 'search'
  | 'onSearchChange'
  | 'categoryFilterLabel'
  | 'categoryFilter'
  | 'categoryOptions'
  | 'onCategoryFilterChange'
  | 'statusFilterLabel'
  | 'statusFilter'
  | 'statusOptions'
  | 'onStatusFilterChange'
> {
  return {
    searchLabel: t(I18N_KEYS.drills.searchLabel),
    searchPlaceholder: t(I18N_KEYS.drills.searchPlaceholder),
    search: input.filter.search,
    onSearchChange: input.onSearchChange,
    categoryFilterLabel: t(I18N_KEYS.drills.categoryFilterLabel),
    categoryFilter: input.filter.category,
    categoryOptions: buildDrillFilterOptions(
      t,
      DRILL_CATEGORIES,
      DRILL_CATEGORY_LABEL_KEYS,
      I18N_KEYS.drills.filterAll,
    ),
    onCategoryFilterChange: input.onCategoryFilterChange,
    statusFilterLabel: t(I18N_KEYS.drills.statusFilterLabel),
    statusFilter: input.filter.status,
    statusOptions: buildDrillFilterOptions(
      t,
      DRILL_STATUSES,
      DRILL_STATUS_LABEL_KEYS,
      I18N_KEYS.drills.filterAll,
    ),
    onStatusFilterChange: input.onStatusFilterChange,
  };
}

/**
 * Assemble the whole list-screen view from three focused builders.
 *
 * Split out of the screen hook so the hook only wires the query and state,
 * and every piece of copy resolution is testable without rendering.
 */
export function buildDrillsCatalogueView(
  t: Translate,
  input: DrillsCatalogueViewInput,
): DrillsCatalogueScreenView {
  const cards = buildVisibleCards(t, input.page, input.filter);
  return {
    ...buildScreenCopy(t, {
      keys: DRILLS_LIST_SCREEN_COPY_KEYS,
      error: input.query.error,
      isOffline: input.scope.isOffline,
      onRetry: input.query.refetch,
      emptyTitleKey: I18N_KEYS.drills.emptyTitle,
      emptyMessageKey: I18N_KEYS.drills.emptyMessage,
    }),
    // Deliberately the RAW page's item count, not the filtered `cards` length:
    // a search or filter that matches nothing is "no matches" (handled below
    // by `hasMatches`/`noMatchesTitle`), never the shared "empty" state, which
    // means the catalogue itself has nothing in it yet.
    status: resolveScreenStatus(
      input.scope,
      input.query,
      input.permitted,
      (input.page?.items.length ?? 0) > 0,
    ),
    title: t(I18N_KEYS.drills.title),
    subtitle: t(I18N_KEYS.drills.subtitle),
    countLabel: t(I18N_KEYS.drills.countSummary, {
      shown: cards.length,
      total: input.page?.total ?? 0,
    }),
    ...buildFilterFields(t, input),
    newDrillLabel: t(I18N_KEYS.drills.newDrillLabel),
    onNewDrill: input.onNewDrill,
    items: cards,
    hasMatches: cards.length > 0,
    noMatchesTitle: t(I18N_KEYS.drills.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.drills.noMatchesMessage),
    onOpen: input.onOpen,
  };
}
