import { IonDatetime, IonDatetimeButton, IonModal, IonNote, IonText } from '@/packages/ionic';

import { buildDatetimeBindings, extractDateValue } from './date-field.helper';
import type { AppDateFieldProps } from './date-field.types';

/**
 * The design system's date picker. A compact `ion-datetime-button` shows the
 * chosen day and opens a real `ion-datetime` calendar in a modal — keyboard
 * accessible, screen-reader labelled, RTL- and theme-aware for free, and it
 * emits a date-only `YYYY-MM-DD` value. `max` blocks future days to mirror the
 * backend's "not in the future" rule at the edge. Never import the vendor date
 * control directly; every date field renders through here.
 */
export function AppDateField(props: AppDateFieldProps): React.JSX.Element {
  const labelId = `${props.datetimeId}-label`;
  const errorId = `${props.datetimeId}-error`;
  return (
    <div data-testid={props.testId} className="flex flex-col gap-1 py-2">
      <IonText>
        <span id={labelId} className="text-sm font-medium">
          {props.label}
        </span>
      </IonText>
      <IonDatetimeButton
        datetime={props.datetimeId}
        aria-labelledby={labelId}
        data-testid={`${props.datetimeId}-trigger`}
      />
      <IonModal keepContentsMounted>
        <IonDatetime
          id={props.datetimeId}
          data-testid={props.inputTestId}
          presentation="date"
          preferWheel={false}
          showDefaultButtons
          aria-labelledby={labelId}
          {...buildDatetimeBindings(props, errorId)}
          onIonChange={(event) => {
            props.onValueChange(extractDateValue(event.detail.value));
          }}
        />
      </IonModal>
      {props.hint === undefined ? null : <IonNote className="text-xs">{props.hint}</IonNote>}
      {props.errorMessage === undefined ? null : (
        <IonNote id={errorId} color="danger" role="alert" className="text-xs">
          {props.errorMessage}
        </IonNote>
      )}
    </div>
  );
}
