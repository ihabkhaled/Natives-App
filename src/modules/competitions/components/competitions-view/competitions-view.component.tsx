import { TEST_IDS } from '@/shared/config';
import { AppButton, ListScreen } from '@/shared/ui';

import { CompetitionCard } from '../competition-card';
import { COMPETITIONS_STATE_TEST_IDS } from './competitions-view.constants';
import type { CompetitionsViewProps } from './competitions-view.types';

/** Competition list: two filters over one bounded page, then the cards. */
export function CompetitionsView(props: CompetitionsViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.competitionsPage}
      viewTestId={TEST_IDS.competitionsView}
      className="app-competitions"
      filters={[
        {
          testId: TEST_IDS.competitionsStatusFilter,
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
        },
        {
          testId: TEST_IDS.competitionsTypeFilter,
          label: props.typeFilterLabel,
          value: props.typeFilter,
          options: props.typeOptions,
          onChange: props.onTypeFilterChange,
        },
      ]}
      filterExtra={
        <AppButton label={props.squadsLinkLabel} tone="secondary" onClick={props.onOpenSquads} />
      }
      state={{ view: props, variant: 'list', ...COMPETITIONS_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul data-testid={TEST_IDS.competitionsList} className="app-competitions__list">
        {props.items.map((item) => (
          <CompetitionCard key={item.id} item={item} onOpen={props.onOpen} />
        ))}
      </ul>
    </ListScreen>
  );
}
