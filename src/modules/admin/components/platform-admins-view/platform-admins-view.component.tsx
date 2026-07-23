import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  AppInput,
  AsyncStateView,
  PageShell,
  ReasonField,
  SectionPanel,
} from '@/shared/ui';

import { PLATFORM_STATE_TEST_IDS } from './platform-admins-view.constants';
import type { PlatformAdminsViewProps } from './platform-admins-view.types';

/**
 * The platform super-admin panel: the audited roster and the separate,
 * confirm-gated promotion form. Deliberately NOT part of the team invite
 * flow — Super Admin is a platform privilege, granted here or nowhere.
 */
export function PlatformAdminsView(props: PlatformAdminsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.adminPlatformPage}>
      <section
        data-testid={TEST_IDS.adminPlatformView}
        aria-label={props.title}
        className="app-admin-platform flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <AsyncStateView view={props} variant="list" {...PLATFORM_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <SectionPanel
              heading={props.rosterHeading}
              intro={props.rosterIntro}
              notice={props.auditNotice}
              testId={TEST_IDS.adminPlatformRoster}
            >
              <ul className="app-admin-platform__list">
                {props.rows.map((row) => (
                  <li
                    key={row.userId}
                    data-testid={TEST_IDS.adminPlatformRow}
                    className="app-admin-platform__row"
                  >
                    <div className="app-admin-platform__row-main">
                      <IonText>
                        <p className="app-admin-platform__row-title m-0">{row.name}</p>
                      </IonText>
                      <IonNote>{`${row.email} · ${row.sinceLabel} · ${row.grantedByLabel}`}</IonNote>
                    </div>
                    <AppButton
                      label={row.revokeLabel}
                      tone="danger"
                      disabled={!row.canRevoke}
                      testId={TEST_IDS.adminPlatformRevoke}
                      onClick={row.onRevoke}
                    />
                  </li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel
              heading={props.promoteHeading}
              intro={props.promoteIntro}
              testId={TEST_IDS.adminPlatformPromotePanel}
            >
              <AppInput
                testId={TEST_IDS.adminPlatformUserId}
                label={props.userIdLabel}
                name="platform-user-id"
                value={props.userIdValue}
                placeholder={props.userIdPlaceholder}
                onValueChange={props.onUserIdChange}
              />
              <ReasonField
                testId={TEST_IDS.adminPlatformReason}
                label={props.reasonLabel}
                placeholder={props.reasonPlaceholder}
                value={props.reasonValue}
                validationMessage={props.validationMessage}
                onChange={props.onReasonChange}
              />
              <AppButton
                label={props.promoteLabel}
                tone="primary"
                loading={props.isPromoting}
                disabled={!props.canPromote}
                testId={TEST_IDS.adminPlatformPromote}
                onClick={props.onPromote}
              />
            </SectionPanel>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
