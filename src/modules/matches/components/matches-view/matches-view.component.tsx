import { TEST_IDS } from '@/shared/config';
import { ListScreen } from '@/shared/ui';

import { MATCHES_STATE_TEST_IDS } from '../../constants/matches-view.constants';
import { MatchCard } from '../match-card';
import type { MatchesViewProps } from './matches-view.types';

/** Match list: one state filter over one bounded page, then the cards. */
export function MatchesView(props: MatchesViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.matchesPage}
      viewTestId={TEST_IDS.matchesView}
      className="app-matches"
      filters={[
        {
          testId: TEST_IDS.matchesStatusFilter,
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
        },
      ]}
      state={{ view: props, variant: 'list', ...MATCHES_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul data-testid={TEST_IDS.matchesList} className="app-matches__list">
        {props.items.map((item) => (
          <MatchCard
            key={item.id}
            item={item}
            onOpenScoreboard={props.onOpenScoreboard}
            onOpenStatistics={props.onOpenStatistics}
          />
        ))}
      </ul>
    </ListScreen>
  );
}
