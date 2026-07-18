import type { AttendanceExcuse, AttendanceStatus } from '../../constants/attendance.constants';
import type { AttendanceRosterRowView } from '../../types/attendance-view.types';

export interface AttendanceRosterRowProps {
  readonly row: AttendanceRosterRowView;
  readonly resolveConflictLabel: string;
  readonly isBusy: boolean;
  readonly onToggle: (membershipId: string) => void;
  readonly onStatusChange: (membershipId: string, status: AttendanceStatus) => void;
  readonly onLatenessChange: (membershipId: string, value: string) => void;
  readonly onExcuseChange: (membershipId: string, excuse: AttendanceExcuse | null) => void;
  readonly onCorrectionReasonChange: (membershipId: string, value: string) => void;
  readonly onResolveConflict: (membershipId: string) => void;
  readonly onShowHistory: (membershipId: string) => void;
  readonly onSaveCorrection: (membershipId: string) => void;
}
