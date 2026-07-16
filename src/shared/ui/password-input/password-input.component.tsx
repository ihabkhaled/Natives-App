import { IonButton, IonIcon, IonInput } from '@/packages/ionic';

import { extractIonInputValue, toInputStateClass } from '../input/input.helper';
import { PASSWORD_HIDE_ICON, PASSWORD_REVEAL_ICON } from './password-input.constants';
import type { AppPasswordInputProps } from './password-input.types';

/** Password field with caller-owned visibility state (components stay hook-free). */
export function AppPasswordInput(props: AppPasswordInputProps): React.JSX.Element {
  return (
    <IonInput
      data-testid={props.testId}
      label={props.label}
      labelPlacement="stacked"
      name={props.name}
      value={props.value}
      type={props.revealed ? 'text' : 'password'}
      {...(props.placeholder === undefined ? {} : { placeholder: props.placeholder })}
      autocomplete="current-password"
      {...(props.errorMessage === undefined ? {} : { errorText: props.errorMessage })}
      className={toInputStateClass(props.errorMessage !== undefined)}
      onIonInput={(event) => {
        props.onValueChange(extractIonInputValue(event.detail.value));
      }}
      {...(props.onBlur === undefined ? {} : { onIonBlur: props.onBlur })}
      fill="outline"
    >
      <IonButton
        fill="clear"
        slot="end"
        aria-label={props.revealed ? props.hideLabel : props.revealLabel}
        onClick={props.onToggleReveal}
      >
        <IonIcon
          slot="icon-only"
          icon={props.revealed ? PASSWORD_HIDE_ICON : PASSWORD_REVEAL_ICON}
          aria-hidden="true"
        />
      </IonButton>
    </IonInput>
  );
}
