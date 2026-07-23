import { IonCheckbox, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput, SelectField } from '@/shared/ui';

import { integerFieldPatch, numericInputValue } from '../../../helpers/numeric-input.helper';
import {
  channelPatch,
  normalizedRules,
  patchQuietHours,
  patchRuleByEvent,
  setQuietHoursEnabled,
} from '../../../helpers/setting-editor-form-values.helper';
import { LEAD_HOURS_EVENT } from '../../../constants/setting-values.constants';
import type { NotificationRecipients } from '../../../constants/setting-values.constants';
import type { NotificationRulesEditorProps } from '../setting-editors.types';

/**
 * One card per event: enablement, channels, recipients — and a lead time
 * only where a reminder can actually lead. Quiet hours edit Cairo wall
 * times, and an overnight window is a feature, not a validation error.
 */
export function NotificationRulesEditor(props: NotificationRulesEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const quietHours = props.value.quietHours;
  return (
    <div className="app-editor-entry" data-testid={TEST_IDS.adminSettingEditor}>
      {normalizedRules(props.value).map((rule) => (
        <div key={rule.event} className="app-editor-card" data-testid={TEST_IDS.adminEditorRow}>
          <IonNote>{props.context.eventNames[rule.event]}</IonNote>
          <IonCheckbox
            checked={rule.enabled}
            labelPlacement="end"
            onIonChange={(event) => {
              props.onChange(
                patchRuleByEvent(props.value, rule.event, { enabled: event.detail.checked }),
              );
            }}
          >
            {labels.enabled}
          </IonCheckbox>
          <IonCheckbox
            checked={rule.channels.includes('push')}
            labelPlacement="end"
            onIonChange={(event) => {
              props.onChange(
                patchRuleByEvent(
                  props.value,
                  rule.event,
                  channelPatch(rule, 'push', event.detail.checked),
                ),
              );
            }}
          >
            {labels.channelPush}
          </IonCheckbox>
          <IonCheckbox
            checked={rule.channels.includes('email')}
            labelPlacement="end"
            onIonChange={(event) => {
              props.onChange(
                patchRuleByEvent(
                  props.value,
                  rule.event,
                  channelPatch(rule, 'email', event.detail.checked),
                ),
              );
            }}
          >
            {labels.channelEmail}
          </IonCheckbox>
          <SelectField
            label={labels.recipients}
            value={rule.recipients}
            options={props.context.recipientOptions}
            testId={`${TEST_IDS.adminEditorRow}-recipients-${rule.event}`}
            onChange={(recipients) => {
              props.onChange(
                patchRuleByEvent(props.value, rule.event, {
                  recipients: recipients as NotificationRecipients,
                }),
              );
            }}
          />
          {rule.event === LEAD_HOURS_EVENT ? (
            <AppInput
              label={labels.leadHours}
              name={`lead-hours-${rule.event}`}
              type="number"
              value={numericInputValue(rule.leadHours)}
              testId={`${TEST_IDS.adminEditorRow}-lead-hours`}
              onValueChange={(raw) => {
                props.onChange(
                  patchRuleByEvent(props.value, rule.event, integerFieldPatch('leadHours', raw)),
                );
              }}
            />
          ) : null}
        </div>
      ))}
      <IonNote>{labels.quietHoursHeading}</IonNote>
      <IonCheckbox
        checked={quietHours !== undefined}
        labelPlacement="end"
        onIonChange={(event) => {
          props.onChange(setQuietHoursEnabled(props.value, event.detail.checked));
        }}
      >
        {labels.quietHoursUse}
      </IonCheckbox>
      {quietHours === undefined ? null : (
        <div className="app-editor-entry__row">
          <AppInput
            label={labels.quietStart}
            name="quiet-start"
            value={quietHours.start}
            testId={`${TEST_IDS.adminSettingEditor}-quiet-start`}
            onValueChange={(raw) => {
              props.onChange(patchQuietHours(props.value, 'start', raw));
            }}
          />
          <AppInput
            label={labels.quietEnd}
            name="quiet-end"
            value={quietHours.end}
            testId={`${TEST_IDS.adminSettingEditor}-quiet-end`}
            onValueChange={(raw) => {
              props.onChange(patchQuietHours(props.value, 'end', raw));
            }}
          />
          <IonNote>{labels.quietOvernight}</IonNote>
        </div>
      )}
    </div>
  );
}
