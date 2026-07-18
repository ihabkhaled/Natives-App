import type { AttendanceRosterRowView } from '../../types/attendance-view.types';

export interface AttendanceRowActionsProps {
  readonly row: AttendanceRosterRowView;
  readonly resolveConflictLabel: string;
  readonly isBusy: boolean;
  readonly onResolveConflict: (membershipId: string) => void;
  readonly onShowHistory: (membershipId: string) => void;
  readonly onSaveCorrection: (membershipId: string) => void;
}
