import type { AttendanceScreenView } from '../../types/attendance-view.types';

export type AttendanceToolbarProps = Pick<
  AttendanceScreenView,
  | 'searchLabel'
  | 'searchPlaceholder'
  | 'searchValue'
  | 'filterLabel'
  | 'filterAllLabel'
  | 'filterValue'
  | 'statusOptions'
  | 'selectedCountLabel'
  | 'selectAllVisibleLabel'
  | 'markAllPresentLabel'
  | 'markSelectedPresentLabel'
  | 'markSelectedAbsentLabel'
  | 'undoLabel'
  | 'canUndo'
  | 'onSearchChange'
  | 'onFilterChange'
  | 'onSelectAllVisible'
  | 'onMarkAllPresent'
  | 'onMarkSelectedPresent'
  | 'onMarkSelectedAbsent'
  | 'onUndo'
>;
