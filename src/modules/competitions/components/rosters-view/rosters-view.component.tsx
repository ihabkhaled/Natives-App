import { TEST_IDS } from '@/shared/config';
import { ListScreen } from '@/shared/ui';

import { RosterCard } from '../roster-card';
import { SQUADS_STATE_TEST_IDS } from '../squads-view/squads-view.constants';
import type { RostersViewProps } from './rosters-view.types';

/** Competition and match rosters, narrowed client-side by kind. */
export function RostersView(props: RostersViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.rostersPage}
      viewTestId={TEST_IDS.rostersView}
      className="app-squads"
      filters={[
        {
          testId: TEST_IDS.rostersKindFilter,
          label: props.kindFilterLabel,
          value: props.kindFilter,
          options: props.kindOptions,
          onChange: props.onKindFilterChange,
        },
      ]}
      state={{ view: props, variant: 'list', ...SQUADS_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul data-testid={TEST_IDS.rostersList} className="app-squads__list">
        {props.items.map((item) => (
          <RosterCard key={item.id} item={item} onOpen={props.onOpen} />
        ))}
      </ul>
    </ListScreen>
  );
}
