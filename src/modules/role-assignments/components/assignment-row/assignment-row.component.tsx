import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import { revokeActionTestId } from './assignment-row.constants';
import type { AssignmentRowProps } from './assignment-row.types';

/**
 * One role assignment.
 *
 * The scope sits next to the role rather than below it: "Coach" means nothing
 * until you know where. Revoke is absent — not disabled — on a platform-wide
 * grant, because that grant is ended through the audited platform flow.
 */
export function AssignmentRow(props: AssignmentRowProps): React.JSX.Element {
  const { view } = props;
  return (
    <article
      className="app-surface-card app-role-assignments__row flex flex-wrap items-center justify-between gap-3 p-4"
      data-testid={TEST_IDS.roleAssignmentsRow}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip label={view.roleLabel} tone="primary" />
          <IonText>
            <span className="text-sm font-semibold">{view.scopeLabel}</span>
          </IonText>
        </div>
        <IonNote>{`${view.sinceLabel} · ${view.grantedByLabel}`}</IonNote>
      </div>

      {view.canRevoke ? (
        <AppButton
          label={view.revokeLabel}
          tone="danger"
          testId={revokeActionTestId(view.id)}
          onClick={view.onRevoke}
        />
      ) : null}
    </article>
  );
}
