import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceHistoryPanelProps = Pick<
  AttendanceScreenView,
  | 'historyTitle'
  | 'historyEmptyLabel'
  | 'historyLoadingLabel'
  | 'historyMembershipId'
  | 'historyItems'
  | 'isHistoryLoading'
>;
