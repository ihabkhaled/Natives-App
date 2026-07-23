import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, RecordList, SectionPanel, WorkspaceScreen } from '@/shared/ui';

import { OPS_STATE_TEST_IDS } from './admin-operations-view.constants';
import type { AdminOperationsViewProps } from './admin-operations-view.types';

/** Outbox health, dead letters, job health, and the audit log. */
export function AdminOperationsView(props: AdminOperationsViewProps): React.JSX.Element {
  return (
    <WorkspaceScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.adminOpsPage}
      viewTestId={TEST_IDS.adminOpsView}
      className="app-admin-ops"
      state={{ view: props, variant: 'dashboard', ...OPS_STATE_TEST_IDS }}
    >
      <SectionPanel
        heading={props.outboxHeading}
        intro={props.outboxIntro}
        testId={TEST_IDS.adminOutboxPanel}
      >
        <RecordList
          rows={props.outboxMetrics}
          ariaLabel={props.outboxHeading}
          rowTestId={TEST_IDS.adminOutboxMetric}
        />
        <AppButton
          label={props.outboxRefreshLabel}
          tone="secondary"
          testId={TEST_IDS.adminOutboxRefresh}
          onClick={props.onRetry}
        />
      </SectionPanel>

      <SectionPanel
        heading={props.deadLetterHeading}
        intro={props.deadLetterIntro}
        notice={props.deadLetterNotice}
        testId={TEST_IDS.adminDeadLetterPanel}
      >
        {props.deadLetterRows.length === 0 ? (
          <IonNote data-testid={TEST_IDS.adminDeadLetterEmpty} role="note">
            {props.deadLetterEmptyLabel}
          </IonNote>
        ) : null}
        <ul className="app-admin-ops__list">
          {props.deadLetterRows.map((row) => (
            <li
              key={row.eventId}
              data-testid={TEST_IDS.adminDeadLetterRow}
              className="app-admin-ops__row"
            >
              <div className="app-admin-ops__row-main">
                <IonText>
                  <p className="app-admin-ops__row-title m-0">{row.eventType}</p>
                </IonText>
                <IonNote>{`${row.attemptsLabel} · ${row.failureCode} · ${row.failedAtLabel}`}</IonNote>
              </div>
              <AppButton
                label={row.replayLabel}
                tone="secondary"
                disabled={!row.canReplay}
                testId={TEST_IDS.adminDeadLetterReplay}
                onClick={row.onReplay}
              />
            </li>
          ))}
        </ul>
      </SectionPanel>

      <SectionPanel
        heading={props.jobHeading}
        intro={props.jobIntro}
        testId={TEST_IDS.adminJobHealthPanel}
      >
        <RecordList
          rows={props.jobRows}
          ariaLabel={props.jobHeading}
          rowTestId={TEST_IDS.adminJobRow}
        />
      </SectionPanel>

      <SectionPanel
        heading={props.auditHeading}
        intro={props.auditIntro}
        notice={props.auditNotice}
        testId={TEST_IDS.adminAuditPanel}
      >
        <RecordList
          rows={props.auditRows}
          ariaLabel={props.auditHeading}
          rowTestId={TEST_IDS.adminAuditRow}
        />
      </SectionPanel>
    </WorkspaceScreen>
  );
}
