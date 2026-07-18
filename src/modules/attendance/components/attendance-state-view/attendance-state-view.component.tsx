import { TEST_IDS } from '@/shared/config';
import { EmptyState, ErrorState, LoadingState, OfflineState, PermissionState } from '@/shared/ui';

import type { AttendanceStateViewProps } from './attendance-state-view.types';

export function AttendanceStateView(props: AttendanceStateViewProps): React.JSX.Element {
  return (
    <>
      {props.status === 'loading' ? (
        <LoadingState
          label={props.loadingLabel}
          testId={TEST_IDS.attendanceLoading}
          variant="list"
        />
      ) : null}
      {props.status === 'error' ? (
        <ErrorState
          title={props.errorTitle}
          message={props.errorMessage}
          retryLabel={props.retryLabel}
          onRetry={props.onRetry}
          testId={TEST_IDS.attendanceError}
        />
      ) : null}
      {props.status === 'offline' ? (
        <OfflineState
          title={props.offlineTitle}
          message={props.offlineMessage}
          testId={TEST_IDS.attendanceOffline}
        />
      ) : null}
      {props.status === 'forbidden' ? (
        <PermissionState
          title={props.forbiddenTitle}
          message={props.forbiddenMessage}
          testId={TEST_IDS.attendanceError}
        />
      ) : null}
      {props.status === 'empty' ? (
        <EmptyState
          title={props.emptyTitle}
          message={props.emptyMessage}
          testId={TEST_IDS.attendanceEmpty}
        />
      ) : null}
    </>
  );
}
