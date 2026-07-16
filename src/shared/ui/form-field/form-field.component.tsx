import { IonNote, IonText } from '@/packages/ionic';

import type { FormFieldProps } from './form-field.types';

/** Field chrome (label, hint, error) for controls that are not IonInput. */
export function FormField(props: FormFieldProps): React.JSX.Element {
  return (
    <div data-testid={props.testId} className="flex flex-col gap-1 py-2">
      <IonText>
        <label htmlFor={props.htmlFor} className="text-sm font-medium">
          {props.label}
        </label>
      </IonText>
      {props.children}
      {props.hint === undefined ? null : <IonNote className="text-xs">{props.hint}</IonNote>}
      {props.errorMessage === undefined ? null : (
        <IonNote color="danger" role="alert" className="text-xs">
          {props.errorMessage}
        </IonNote>
      )}
    </div>
  );
}
