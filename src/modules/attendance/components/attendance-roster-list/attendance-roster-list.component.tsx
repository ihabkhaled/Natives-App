import { TEST_IDS } from '@/shared/config';
import { EmptyState } from '@/shared/ui';

import { AttendanceRosterRow } from '../attendance-roster-row';
import type { AttendanceRosterListProps } from './attendance-roster-list.types';

export function AttendanceRosterList(props: AttendanceRosterListProps): React.JSX.Element {
  const isBusy = props.isSubmitting || props.isCorrecting || props.isReplaying;
  return (
    <section
      data-testid={TEST_IDS.attendanceRoster}
      aria-label={props.subtitle}
      className="grid gap-3"
    >
      {props.rows.length === 0 ? (
        <EmptyState
          title={props.noMatchesTitle}
          message={props.noMatchesMessage}
          testId={TEST_IDS.attendanceEmpty}
        />
      ) : null}
      {props.rows.map((row) => (
        <AttendanceRosterRow
          key={row.membershipId}
          row={row}
          resolveConflictLabel={props.resolveConflictLabel}
          isBusy={isBusy}
          onToggle={props.onToggleMember}
          onStatusChange={props.onStatusChange}
          onLatenessChange={props.onLatenessChange}
          onExcuseChange={props.onExcuseChange}
          onCorrectionReasonChange={props.onCorrectionReasonChange}
          onResolveConflict={props.onResolveConflict}
          onShowHistory={props.onShowHistory}
          onSaveCorrection={props.onSaveCorrection}
        />
      ))}
    </section>
  );
}
