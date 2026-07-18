import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceStateViewProps = Pick<
  AttendanceScreenView,
  | 'status'
  | 'loadingLabel'
  | 'errorTitle'
  | 'errorMessage'
  | 'retryLabel'
  | 'offlineTitle'
  | 'offlineMessage'
  | 'forbiddenTitle'
  | 'forbiddenMessage'
  | 'emptyTitle'
  | 'emptyMessage'
  | 'onRetry'
>;
