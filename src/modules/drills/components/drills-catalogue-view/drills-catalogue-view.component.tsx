import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, ListScreen } from '@/shared/ui';

import { DrillCard } from '../drill-card';
import type { DrillsCatalogueViewProps } from './drills-catalogue-view.types';

/**
 * The searchable drill list: a search box, category and status filters, a
 * "New drill" action, and one card per catalogue entry. There is no free-text
 * search on the wire, so the search box narrows the bounded page already on
 * screen rather than issuing a second request.
 */
export function DrillsCatalogueView(props: DrillsCatalogueViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.drillsPage}
      viewTestId={TEST_IDS.drillsView}
      className="app-drills"
      filters={[
        {
          testId: TEST_IDS.drillsCategoryFilter,
          label: props.categoryFilterLabel,
          value: props.categoryFilter,
          options: props.categoryOptions,
          onChange: props.onCategoryFilterChange,
        },
        {
          testId: TEST_IDS.drillsStatusFilter,
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
        },
      ]}
      filterExtra={
        <div className="app-drills__toolbar-extra flex flex-col gap-2">
          <AppInput
            testId={TEST_IDS.drillsSearch}
            label={props.searchLabel}
            name="drills-search"
            value={props.search}
            placeholder={props.searchPlaceholder}
            onValueChange={props.onSearchChange}
          />
          <AppButton
            label={props.newDrillLabel}
            tone="primary"
            testId={TEST_IDS.drillsNewButton}
            onClick={props.onNewDrill}
          />
        </div>
      }
      state={{
        view: props,
        variant: 'list',
        loadingTestId: TEST_IDS.drillsLoading,
        errorTestId: TEST_IDS.drillsError,
        offlineTestId: TEST_IDS.drillsOffline,
        forbiddenTestId: TEST_IDS.drillsForbidden,
        emptyTestId: TEST_IDS.drillsEmpty,
      }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul data-testid={TEST_IDS.drillsList} className="app-drills__list">
        {props.items.map((item) => (
          <DrillCard key={item.id} item={item} onOpen={props.onOpen} />
        ))}
      </ul>
    </ListScreen>
  );
}
