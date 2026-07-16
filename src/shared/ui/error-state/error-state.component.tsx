import { AppButton } from '../button';
import { StatusView } from '../status-view';
import { ERROR_STATE_DEFAULT_TEST_ID, ERROR_STATE_ICON } from './error-state.constants';
import type { ErrorStateProps } from './error-state.types';

export function ErrorState(props: ErrorStateProps): React.JSX.Element {
  const { onRetry, retryLabel } = props;
  const canRetry = onRetry !== undefined && retryLabel !== undefined;
  return (
    <StatusView
      icon={ERROR_STATE_ICON}
      tone="danger"
      title={props.title}
      message={props.message}
      testId={props.testId ?? ERROR_STATE_DEFAULT_TEST_ID}
      action={
        canRetry ? <AppButton label={retryLabel} tone="secondary" onClick={onRetry} /> : undefined
      }
    />
  );
}
