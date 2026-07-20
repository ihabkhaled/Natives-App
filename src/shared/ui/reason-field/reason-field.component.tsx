import { IonNote, IonTextarea } from '@/packages/ionic';

import type { ReasonFieldProps } from './reason-field.types';

/**
 * The written reason an auditable action requires. The validation message is
 * announced, so a coach is told why the action is still blocked.
 */
export function ReasonField(props: ReasonFieldProps): React.JSX.Element {
  return (
    <>
      <IonTextarea
        data-testid={props.testId}
        label={props.label}
        labelPlacement="stacked"
        placeholder={props.placeholder}
        value={props.value}
        autoGrow
        onIonInput={(event) => {
          props.onChange(event.detail.value ?? '');
        }}
      />
      {props.validationMessage === null ? null : (
        <IonNote color="danger" role="alert">
          {props.validationMessage}
        </IonNote>
      )}
    </>
  );
}
