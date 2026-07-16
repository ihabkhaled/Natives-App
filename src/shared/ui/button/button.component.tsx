import { IonButton, IonSpinner } from '@/packages/ionic';

import { BUTTON_TONE_TO_ION_COLOR } from './button.constants';
import type { AppButtonProps } from './button.types';

export function AppButton(props: AppButtonProps): React.JSX.Element {
  const isDisabled = props.disabled === true || props.loading === true;
  return (
    <IonButton
      data-testid={props.testId}
      color={BUTTON_TONE_TO_ION_COLOR[props.tone ?? 'primary']}
      type={props.type ?? 'button'}
      disabled={isDisabled}
      {...(props.expand === true ? { expand: 'block' as const } : {})}
      onClick={props.onClick}
      aria-busy={props.loading === true ? 'true' : undefined}
      className="min-h-11"
    >
      {props.loading === true ? (
        <IonSpinner slot="start" name="crescent" aria-hidden="true" />
      ) : null}
      {props.label}
    </IonButton>
  );
}
