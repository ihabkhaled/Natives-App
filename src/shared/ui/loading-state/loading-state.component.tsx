import { IonSpinner, IonText } from '@/packages/ionic';

import { LOADING_STATE_DEFAULT_TEST_ID } from './loading-state.constants';
import type { LoadingStateProps } from './loading-state.types';

export function LoadingState(props: LoadingStateProps): React.JSX.Element {
  return (
    <div
      data-testid={props.testId ?? LOADING_STATE_DEFAULT_TEST_ID}
      className="flex min-h-40 flex-col items-center justify-center gap-2 p-6"
      role="status"
      aria-live="polite"
    >
      <IonSpinner name="crescent" aria-hidden="true" />
      <IonText color="medium">
        <p className="m-0 text-sm">{props.label}</p>
      </IonText>
    </div>
  );
}
