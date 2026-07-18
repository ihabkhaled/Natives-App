import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceSummaryProps = Pick<
  AttendanceScreenView,
  | 'subtitle'
  | 'sessionLabel'
  | 'sheetStateLabel'
  | 'rosterSummary'
  | 'queueSummary'
  | 'finalizedLabel'
>;
