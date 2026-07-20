import { IonInput } from '@/packages/ionic';

import { extractIonInputValue, toInputStateClass } from './input.helper';
import type { AppInputProps } from './input.types';

export function AppInput(props: AppInputProps): React.JSX.Element {
  return (
    <IonInput
      data-testid={props.testId}
      label={props.label}
      labelPlacement="stacked"
      name={props.name}
      value={props.value}
      type={props.type ?? 'text'}
      disabled={props.disabled === true}
      {...(props.placeholder === undefined ? {} : { placeholder: props.placeholder })}
      {...(props.autocomplete === undefined ? {} : { autocomplete: props.autocomplete })}
      {...(props.errorMessage === undefined ? {} : { errorText: props.errorMessage })}
      className={toInputStateClass(props.errorMessage !== undefined)}
      onIonInput={(event) => {
        props.onValueChange(extractIonInputValue(event.detail.value));
      }}
      {...(props.onBlur === undefined ? {} : { onIonBlur: props.onBlur })}
      fill="outline"
    />
  );
}
