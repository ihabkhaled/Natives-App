import type { AttendanceDraft, AttendanceEditorView, AttendanceStatus } from '@/modules/attendance';

interface EditorStubOverrides {
  readonly drafts?: Record<string, AttendanceDraft>;
  readonly dirtyIds?: readonly string[];
  readonly selectedIds?: readonly string[];
  readonly searchValue?: string;
  readonly filterValue?: AttendanceStatus | null;
  readonly canUndo?: boolean;
}

/**
 * Inert {@link AttendanceEditorView} used by the attendance view-model unit
 * tests; all behaviour lives in the drafts/selection/filter hooks that own it,
 * so the stub only carries readable state and no-op callbacks.
 */
export function buildAttendanceEditorStub(
  overrides: EditorStubOverrides = {},
): AttendanceEditorView {
  return {
    drafts: overrides.drafts ?? {},
    dirtyIds: overrides.dirtyIds ?? [],
    canUndo: overrides.canUndo ?? false,
    selectedIds: overrides.selectedIds ?? [],
    searchValue: overrides.searchValue ?? '',
    filterValue: overrides.filterValue ?? null,
    markAllPresent: () => undefined,
    setStatus: () => undefined,
    setLateness: () => undefined,
    setExcuse: () => undefined,
    setCorrectionReason: () => undefined,
    undo: () => undefined,
    acceptChanges: () => undefined,
    buildMarks: () => [],
    toggleMember: () => undefined,
    selectMembers: () => undefined,
    setSearchValue: () => undefined,
    setFilterValue: () => undefined,
    markSelected: () => undefined,
  };
}
