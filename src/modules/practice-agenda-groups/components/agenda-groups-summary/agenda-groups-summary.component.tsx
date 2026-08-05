import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AgendaGroupList } from '../agenda-group-list';
import { AgendaPlanBlocks } from '../agenda-plan-blocks';
import { CopyAgendaForm } from '../copy-agenda-form';
import { CreateGroupForm } from '../create-group-form';
import type { AgendaGroupsSummaryProps } from './agenda-groups-summary.types';

/**
 * The loaded body. Split from the screen so the screen owns only which state
 * to show — the same split `practice-reminders` uses for `ReminderSummary`.
 */
export function AgendaGroupsSummary(props: AgendaGroupsSummaryProps): React.JSX.Element {
  return (
    <>
      {props.statusLabel === '' ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm" data-testid={TEST_IDS.practiceAgendaGroupsStatus}>
            {props.statusLabel}
          </p>
        </IonText>
      )}

      <AgendaPlanBlocks
        heading={props.planHeading}
        emptyLabel={props.blocksEmptyLabel}
        blocks={props.blocks}
      />

      <AgendaGroupList
        heading={props.groupsHeading}
        emptyLabel={props.groupsEmptyLabel}
        groups={props.groups}
      />

      <CreateGroupForm {...props.createForm} />

      <CopyAgendaForm {...props.copyForm} />
    </>
  );
}
