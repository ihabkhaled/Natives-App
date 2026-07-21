import { IonCheckbox, IonInput, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { QuietHoursPanelProps } from './quiet-hours-panel.types';

/** Quiet-hours window plus the explicit urgent-cancellation override. */
export function QuietHoursPanel(props: QuietHoursPanelProps): React.JSX.Element {
  return (
    <SectionPanel
      heading={props.heading}
      intro={props.intro}
      notice={props.validationMessage}
      testId={TEST_IDS.quietHoursPanel}
    >
      <div className="app-quiet-hours__fields">
        <IonInput
          data-testid={TEST_IDS.quietHoursStart}
          label={props.startLabel}
          value={props.startValue}
          onIonInput={(event) => {
            props.onStartChange(event.detail.value ?? '');
          }}
        />
        <IonInput
          data-testid={TEST_IDS.quietHoursEnd}
          label={props.endLabel}
          value={props.endValue}
          onIonInput={(event) => {
            props.onEndChange(event.detail.value ?? '');
          }}
        />
        <p data-testid={TEST_IDS.quietHoursTimezone} className="app-quiet-hours__timezone m-0">
          {`${props.timezoneLabel}: ${props.timezoneValue}`}
        </p>
      </div>
      <IonCheckbox
        data-testid={TEST_IDS.quietHoursUrgent}
        checked={props.urgentEnabled}
        labelPlacement="end"
        justify="start"
        onIonChange={(event) => {
          props.onUrgentChange(event.detail.checked);
        }}
      >
        {props.urgentLabel}
      </IonCheckbox>
      <IonNote>{props.urgentNote}</IonNote>
      <AppButton
        label={props.saveLabel}
        tone="primary"
        loading={props.isSaving}
        disabled={props.validationMessage !== null || props.isSaving}
        testId={TEST_IDS.quietHoursSave}
        onClick={props.onSave}
      />
    </SectionPanel>
  );
}
