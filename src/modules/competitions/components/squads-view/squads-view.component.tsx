import { TEST_IDS } from '@/shared/config';
import { ListScreen } from '@/shared/ui';

import { SquadCard } from '../squad-card';
import { SQUADS_STATE_TEST_IDS } from './squads-view.constants';
import type { SquadsViewProps } from './squads-view.types';

/** Season squad list, narrowed client-side by lifecycle status. */
export function SquadsView(props: SquadsViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.squadsPage}
      viewTestId={TEST_IDS.squadsView}
      className="app-squads"
      filters={[
        {
          testId: TEST_IDS.squadsStatusFilter,
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
        },
      ]}
      state={{ view: props, variant: 'list', ...SQUADS_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul data-testid={TEST_IDS.squadsList} className="app-squads__list">
        {props.items.map((item) => (
          <SquadCard key={item.id} item={item} onOpen={props.onOpen} />
        ))}
      </ul>
    </ListScreen>
  );
}
