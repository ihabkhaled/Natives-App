import { IonButton, IonSpinner } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';

import { BUTTON_TONE_TO_CLASS, BUTTON_TONE_TO_ION_COLOR } from './button.constants';
import type { AppButtonProps } from './button.types';

export function AppButton(props: AppButtonProps): React.JSX.Element {
  const isDisabled = props.disabled === true || props.loading === true;
  const tone = props.tone ?? 'primary';
  return (
    <IonButton
      data-testid={props.testId}
      color={BUTTON_TONE_TO_ION_COLOR[tone]}
      type={props.type ?? 'button'}
      disabled={isDisabled}
      {...(props.expand === true ? { expand: 'block' as const } : {})}
      {...(tone === 'ghost' ? { fill: 'clear' as const } : {})}
      onClick={props.onClick}
      aria-busy={props.loading === true ? 'true' : undefined}
      className={cx('min-h-11', BUTTON_TONE_TO_CLASS[tone])}
    >
      {props.loading === true ? (
        <IonSpinner slot="start" name="crescent" aria-hidden="true" />
      ) : null}
      {props.label}
    </IonButton>
  );
}
