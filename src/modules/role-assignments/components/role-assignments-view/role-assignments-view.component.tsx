import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput, AsyncStateView, PageShell } from '@/shared/ui';

import { AssignmentRow } from '../assignment-row';
import { GrantRolePanel } from '../grant-role-panel';
import {
  ROLE_ASSIGNMENTS_STATE_TEST_IDS,
  TARGET_USER_FIELD_NAME,
  TARGET_USER_TEST_ID,
} from './role-assignments-view.constants';
import type { RoleAssignmentsViewProps } from './role-assignments-view.types';

/**
 * The RBAC admin screen: name a user, read every role they hold and where,
 * end one of them, or grant another from the roles the server says this
 * administrator may pass on.
 *
 * The target field stays visible in every state — including forbidden and
 * error — because it is how the screen is steered, not a result of it.
 */
export function RoleAssignmentsView(props: RoleAssignmentsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.roleAssignmentsPage}>
      <section
        data-testid={TEST_IDS.roleAssignmentsView}
        aria-label={props.pageTitle}
        className="app-role-assignments flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <AppInput
          label={props.targetLabel}
          testId={TARGET_USER_TEST_ID}
          name={TARGET_USER_FIELD_NAME}
          value={props.targetValue}
          placeholder={props.targetPlaceholder}
          onValueChange={props.onTargetChange}
        />

        {props.notice === null ? null : (
          <p className="app-pending-notice m-0" role="status">
            {props.notice}
          </p>
        )}

        <AsyncStateView view={props} variant="list" {...ROLE_ASSIGNMENTS_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <h2 className="app-section-panel__title m-0">{props.listHeading}</h2>
            <IonText color="medium">
              <p className="m-0 text-sm">{props.listIntro}</p>
            </IonText>
            <IonText color="medium">
              <p className="m-0 text-sm">{props.countLabel}</p>
            </IonText>
            <ul className="app-role-assignments__list m-0 flex list-none flex-col gap-3 p-0">
              {props.rows.map((row) => (
                <li key={row.id}>
                  <AssignmentRow view={row} />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {props.grant === null ? null : <GrantRolePanel view={props.grant} />}
      </section>
    </PageShell>
  );
}
