import type { AttendanceExcuse, AttendanceStatus } from '../../constants/attendance.constants';
import type { AttendanceRosterRowView } from '../../types/attendance-view.types';

export interface AttendanceRowEditorProps {
  readonly row: AttendanceRosterRowView;
  readonly isBusy: boolean;
  readonly onStatusChange: (membershipId: string, status: AttendanceStatus) => void;
  readonly onLatenessChange: (membershipId: string, value: string) => void;
  readonly onExcuseChange: (membershipId: string, excuse: AttendanceExcuse | null) => void;
  readonly onCorrectionReasonChange: (membershipId: string, value: string) => void;
}
