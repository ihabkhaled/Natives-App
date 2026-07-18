import type { AttendanceRosterRowView } from '../../types/attendance-view.types';

export interface AttendanceRowIdentityProps {
  readonly row: AttendanceRosterRowView;
  readonly onToggle: (membershipId: string) => void;
}
