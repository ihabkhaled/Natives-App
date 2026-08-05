import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AgendaGroupRow } from '../agenda-group-row';
import type { AgendaGroupListProps } from './agenda-group-list.types';

/** The groups a coach has split this session's roster into, in `position` order. */
export function AgendaGroupList(props: AgendaGroupListProps): React.JSX.Element {
  return (
    <section aria-label={props.heading} data-testid={TEST_IDS.practiceAgendaGroupsGroups}>
      <h2 className="app-section-panel__title m-0">{props.heading}</h2>
      {props.groups.length === 0 ? (
        <IonText color="medium">
          <p className="m-0 text-sm" data-testid={TEST_IDS.practiceAgendaGroupsGroupsEmpty}>
            {props.emptyLabel}
          </p>
        </IonText>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {props.groups.map((group) => (
            <AgendaGroupRow key={group.id} {...group} />
          ))}
        </ul>
      )}
    </section>
  );
}
