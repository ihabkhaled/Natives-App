import { AppButton } from '../button';
import { StatusView } from '../status-view';
import { ERROR_STATE_DEFAULT_TEST_ID, ERROR_STATE_ICON } from './error-state.constants';
import type { ErrorStateProps } from './error-state.types';

export function ErrorState(props: ErrorStateProps): React.JSX.Element {
  const canRetry = props.onRetry !== undefined && props.retryLabel !== undefined;
  return (
    <StatusView
      icon={ERROR_STATE_ICON}
      tone="danger"
      title={props.title}
      message={props.message}
      testId={props.testId ?? ERROR_STATE_DEFAULT_TEST_ID}
      action={
        canRetry ? (
          <AppButton label={props.retryLabel ?? ''} tone="secondary" onClick={props.onRetry} />
        ) : undefined
      }
    />
  );
}
