import { IonSpinner, IonText } from '@/packages/ionic';

import {
  LOADING_STATE_BLOCK_TEST_ID,
  LOADING_STATE_DEFAULT_TEST_ID,
  LOADING_STATE_VARIANT_CLASSES,
} from './loading-state.constants';
import type { LoadingStateProps } from './loading-state.types';

/**
 * Polished async placeholder: a shimmering skeleton card that mirrors the shape
 * of the content to come, plus an accessible (visually hidden) spinner and a
 * polite status caption so assistive tech announces the wait.
 */
export function LoadingState(props: LoadingStateProps): React.JSX.Element {
  return (
    <div
      data-testid={props.testId ?? LOADING_STATE_DEFAULT_TEST_ID}
      className={`app-loading-state ${
        LOADING_STATE_VARIANT_CLASSES[props.variant ?? 'card']
      } flex flex-col gap-4`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <IonSpinner name="crescent" aria-hidden="true" />
      <div className="app-skeleton-layout" aria-hidden="true">
        <div className="app-skeleton-block" data-testid={LOADING_STATE_BLOCK_TEST_ID}>
          <span className="app-skeleton app-skeleton-title" />
          <span className="app-skeleton app-skeleton-line app-skeleton-line-lg" />
          <span className="app-skeleton app-skeleton-line" />
          <span className="app-skeleton app-skeleton-line app-skeleton-line-md" />
        </div>
        <div
          className="app-skeleton-block app-skeleton-block--secondary"
          data-testid={LOADING_STATE_BLOCK_TEST_ID}
        >
          <span className="app-skeleton app-skeleton-title" />
          <span className="app-skeleton app-skeleton-line app-skeleton-line-md" />
          <span className="app-skeleton app-skeleton-line app-skeleton-line-lg" />
        </div>
        <div
          className="app-skeleton-block app-skeleton-block--tertiary"
          data-testid={LOADING_STATE_BLOCK_TEST_ID}
        >
          <span className="app-skeleton app-skeleton-title" />
          <span className="app-skeleton app-skeleton-line" />
          <span className="app-skeleton app-skeleton-line app-skeleton-line-sm" />
        </div>
      </div>
      <IonText color="medium">
        <p className="m-0 text-center text-sm">{props.label}</p>
      </IonText>
    </div>
  );
}
