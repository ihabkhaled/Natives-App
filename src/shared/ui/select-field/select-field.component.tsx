import { IonSelect, IonSelectOption } from '@/packages/ionic';

import type { SelectFieldProps } from './select-field.types';

/**
 * The one labelled select in the design system. Filters, pickers, and form
 * choices all render through it so every option list keeps the same label
 * placement, hit area, and RTL behaviour.
 */
export function SelectField(props: SelectFieldProps): React.JSX.Element {
  return (
    <IonSelect
      data-testid={props.testId}
      label={props.label}
      {...(props.placeholder === undefined ? {} : { placeholder: props.placeholder })}
      {...(props.disabled === undefined ? {} : { disabled: props.disabled })}
      value={props.value}
      onIonChange={(event) => {
        props.onChange(event.detail.value as string);
      }}
    >
      {props.options.map((option) => (
        <IonSelectOption key={option.value} value={option.value}>
          {option.label}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
}
