import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, WorkspaceScreen } from '@/shared/ui';

import { PreferenceMatrix } from '../preference-matrix';
import { QuietHoursPanel } from '../quiet-hours-panel';
import { PREFS_STATE_TEST_IDS } from './notification-preferences-view.constants';
import type { NotificationPreferencesViewProps } from './notification-preferences-view.types';

/** Per-category channel preferences, team scope, and quiet hours. */
export function NotificationPreferencesView(
  props: NotificationPreferencesViewProps,
): React.JSX.Element {
  return (
    <WorkspaceScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.notificationPrefsPage}
      viewTestId={TEST_IDS.notificationPrefsView}
      className="app-prefs"
      toolbar={<AppButton label={props.backLabel} tone="ghost" onClick={props.onBack} />}
      state={{ view: props, variant: 'detail', ...PREFS_STATE_TEST_IDS }}
    >
      <PreferenceMatrix
        heading={props.matrixHeading}
        intro={props.matrixIntro}
        mandatoryNotice={props.mandatoryNotice}
        rows={props.rows}
      />
      <SectionPanel heading={props.scopeHeading} testId={TEST_IDS.notificationPrefsScope}>
        <IonNote>{props.scopeNote}</IonNote>
      </SectionPanel>
      <QuietHoursPanel {...props.quietHours} />
    </WorkspaceScreen>
  );
}
