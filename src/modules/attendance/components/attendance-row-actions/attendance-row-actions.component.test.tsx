import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceRosterRowView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceRowActions } from './attendance-row-actions.component';

function renderActions(row: ReturnType<typeof buildAttendanceRosterRowView>, isBusy = false) {
  const handlers = {
    onResolveConflict: vi.fn(),
    onShowHistory: vi.fn(),
    onSaveCorrection: vi.fn(),
  };
  render(
    <AttendanceRowActions
      row={row}
      resolveConflictLabel="Resolve conflict"
      isBusy={isBusy}
      {...handlers}
    />,
  );
  return handlers;
}

describe('AttendanceRowActions', () => {
  it('exposes resolve, history and save-correction actions for a conflicted locked row', () => {
    const view = renderActions(
      buildAttendanceRosterRowView({
        conflictMessage: 'The record changed since you loaded it',
        isLocked: true,
        canSaveCorrection: true,
      }),
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceResolveConflict));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceHistoryButton));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceSaveCorrection));

    expect(view.onResolveConflict).toHaveBeenCalledWith('m-1');
    expect(view.onShowHistory).toHaveBeenCalledWith('m-1');
    expect(view.onSaveCorrection).toHaveBeenCalledWith('m-1');
  });

  it('hides the conflict alert and correction save for a clean unlocked row', () => {
    renderActions(buildAttendanceRosterRowView({ conflictMessage: null, isLocked: false }));

    expect(screen.queryByTestId(TEST_IDS.attendanceConflict)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceSaveCorrection)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.attendanceHistoryButton)).toBeInTheDocument();
  });

  it('keeps the correction save present but guarded while the row cannot be saved yet', () => {
    renderActions(buildAttendanceRosterRowView({ isLocked: true, canSaveCorrection: false }), true);

    expect(screen.getByTestId(TEST_IDS.attendanceSaveCorrection)).toBeInTheDocument();
  });
});
