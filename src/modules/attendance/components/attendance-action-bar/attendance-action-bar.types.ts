import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceActionBarProps = Pick<
  AttendanceScreenView,
  | 'canRetryQueue'
  | 'retryQueueLabel'
  | 'saveLabel'
  | 'canSubmit'
  | 'isSubmitting'
  | 'finalizeLabel'
  | 'canFinalize'
  | 'showFinalize'
  | 'isFinalizing'
  | 'onRetryQueue'
  | 'onSubmit'
  | 'onFinalize'
>;
