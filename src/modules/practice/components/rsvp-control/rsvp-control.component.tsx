import {
  IonBadge,
  IonButton,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { type RsvpReason } from '../../constants/practice.constants';
import { RSVP_REASON_NONE_VALUE } from './rsvp-control.constants';
import type { RsvpControlProps } from './rsvp-control.types';

/** RSVP going/maybe/not-going with reason, deadline, waitlist, and conflict UI. */
export function RsvpControl(props: RsvpControlProps): React.JSX.Element {
  const { data } = props;
  const disabled = !data.canRespond || props.isSubmitting;
  const statusNoteColor = data.disabledExplanation === null ? 'medium' : 'warning';
  const notes = [
    {
      key: 'status',
      testId: TEST_IDS.rsvpDeadlineNote,
      color: statusNoteColor,
      alert: false,
      text: data.disabledExplanation ?? data.deadlineLabel,
    },
    {
      key: 'waitlist',
      testId: TEST_IDS.rsvpWaitlistNote,
      color: 'tertiary',
      alert: false,
      text: data.waitlistLabel,
    },
    {
      key: 'conflict',
      testId: TEST_IDS.rsvpConflictNote,
      color: 'danger',
      alert: true,
      text: props.conflictNote,
    },
  ].filter((note) => note.text !== null);

  return (
    <section
      data-testid={TEST_IDS.rsvpControl}
      aria-label={data.yourResponseLabel}
      aria-busy={props.isSubmitting}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <IonText>
          <h2 className="m-0 text-base font-semibold">{data.yourResponseLabel}</h2>
        </IonText>
        <IonBadge color={data.currentStatusTone}>{data.currentStatusLabel}</IonBadge>
      </div>
      <div role="group" aria-label={data.prompt} className="flex flex-wrap gap-2">
        {data.options.map((option) => (
          <IonButton
            key={option.value}
            data-testid={option.testId}
            color={option.color}
            fill={option.isActive ? 'solid' : 'outline'}
            disabled={disabled}
            aria-pressed={option.isActive ? 'true' : 'false'}
            onClick={() => {
              props.onSubmit(option.value);
            }}
          >
            {option.label}
          </IonButton>
        ))}
      </div>
      {data.showReason ? (
        <IonSelect
          data-testid={TEST_IDS.rsvpReasonSelect}
          label={data.reasonLabel}
          value={props.selectedReason ?? RSVP_REASON_NONE_VALUE}
          disabled={props.isSubmitting}
          onIonChange={(event) => {
            const value = event.detail.value as string;
            props.onSelectReason(value === RSVP_REASON_NONE_VALUE ? null : (value as RsvpReason));
          }}
        >
          <IonSelectOption value={RSVP_REASON_NONE_VALUE}>{data.reasonNoneLabel}</IonSelectOption>
          {data.reasonOptions.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      ) : null}
      {notes.map((note) => (
        <IonNote
          key={note.key}
          color={note.color}
          data-testid={note.testId}
          role={note.alert ? 'alert' : undefined}
        >
          {note.text}
        </IonNote>
      ))}
    </section>
  );
}
