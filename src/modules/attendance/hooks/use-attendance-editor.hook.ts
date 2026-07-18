import type { AttendanceStatus } from '../constants/attendance.constants';
import type { AttendanceQueuedOperation, AttendanceRosterEntry } from '../types/attendance.types';
import { useAttendanceDrafts, type AttendanceDraftsView } from './use-attendance-drafts.hook';
import { useAttendanceFilters, type AttendanceFiltersView } from './use-attendance-filters.hook';
import {
  useAttendanceSelection,
  type AttendanceSelectionView,
} from './use-attendance-selection.hook';

export interface AttendanceEditorView
  extends
    Omit<AttendanceDraftsView, 'markMembers'>,
    Omit<AttendanceSelectionView, 'clearSelection'>,
    AttendanceFiltersView {
  readonly markSelected: (status: AttendanceStatus) => void;
}

export function useAttendanceEditor(
  entries: readonly AttendanceRosterEntry[],
  queued: readonly AttendanceQueuedOperation[],
): AttendanceEditorView {
  const drafts = useAttendanceDrafts(entries, queued);
  const selection = useAttendanceSelection();
  const filters = useAttendanceFilters();
  return {
    ...drafts,
    ...selection,
    ...filters,
    markSelected: (status) => {
      drafts.markMembers(selection.selectedIds, status);
    },
    acceptChanges: () => {
      drafts.acceptChanges();
      selection.clearSelection();
    },
  };
}
