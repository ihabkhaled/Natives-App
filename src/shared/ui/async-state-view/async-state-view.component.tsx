import { EmptyState } from '../empty-state';
import { ErrorState } from '../error-state';
import { LoadingState } from '../loading-state';
import { OfflineState } from '../offline-state';
import { PermissionState } from '../permission-state';
import type { AsyncStateViewProps } from './async-state-view.types';

/**
 * Exactly one designed non-ready state, shared by every async screen so
 * loading, error, offline, forbidden, and empty always look the same.
 */
export function AsyncStateView(props: AsyncStateViewProps): React.JSX.Element {
  const { view } = props;
  return (
    <>
      {view.status === 'loading' ? (
        <LoadingState
          label={view.loadingLabel}
          testId={props.loadingTestId}
          variant={props.variant}
        />
      ) : null}
      {view.status === 'error' ? (
        <ErrorState
          title={view.errorTitle}
          message={view.errorMessage}
          retryLabel={view.retryLabel}
          onRetry={view.onRetry}
          testId={props.errorTestId}
        />
      ) : null}
      {view.status === 'offline' ? (
        <OfflineState
          title={view.offlineTitle}
          message={view.offlineMessage}
          testId={props.offlineTestId}
        />
      ) : null}
      {view.status === 'forbidden' ? (
        <PermissionState
          title={view.forbiddenTitle}
          message={view.forbiddenMessage}
          testId={props.forbiddenTestId}
        />
      ) : null}
      {view.status === 'empty' ? (
        <EmptyState
          title={view.emptyTitle}
          message={view.emptyMessage}
          testId={props.emptyTestId}
        />
      ) : null}
    </>
  );
}
