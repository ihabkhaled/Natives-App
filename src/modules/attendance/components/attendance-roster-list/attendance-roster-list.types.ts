import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceRosterListProps = Pick<
  AttendanceScreenView,
  | 'subtitle'
  | 'rows'
  | 'noMatchesTitle'
  | 'noMatchesMessage'
  | 'resolveConflictLabel'
  | 'isSubmitting'
  | 'isCorrecting'
  | 'isReplaying'
  | 'onToggleMember'
  | 'onStatusChange'
  | 'onLatenessChange'
  | 'onExcuseChange'
  | 'onCorrectionReasonChange'
  | 'onResolveConflict'
  | 'onShowHistory'
  | 'onSaveCorrection'
>;
