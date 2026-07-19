import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceRosterRowView } from '../../../../../tests/factories/attendance-view.factory';
import { fireIonChange, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { AttendanceRowEditor } from './attendance-row-editor.component';

function renderEditor(row: ReturnType<typeof buildAttendanceRosterRowView>, isBusy = false) {
  const handlers = {
    onStatusChange: vi.fn(),
    onLatenessChange: vi.fn(),
    onExcuseChange: vi.fn(),
    onCorrectionReasonChange: vi.fn(),
  };
  render(<AttendanceRowEditor row={row} isBusy={isBusy} {...handlers} />);
  return handlers;
}

describe('AttendanceRowEditor', () => {
  it('edits status, lateness, excuse and correction reason for a fully expanded row', () => {
    const view = renderEditor(
      buildAttendanceRosterRowView({
        showLateness: true,
        showExcuse: true,
        isLocked: true,
        excuseCategory: 'illness',
      }),
    );

    fireIonChange(screen.getByTestId(TEST_IDS.attendanceStatusSelect), 'absent');
    fireIonInput(screen.getByTestId(TEST_IDS.attendanceLatenessInput), '12');
    fireIonChange(screen.getByTestId(TEST_IDS.attendanceExcuseSelect), 'work');
    fireIonChange(screen.getByTestId(TEST_IDS.attendanceExcuseSelect), 'none');
    fireIonInput(screen.getByTestId(TEST_IDS.attendanceCorrectionReason), 'fix the scan');

    expect(view.onStatusChange).toHaveBeenCalledWith('m-1', 'absent');
    expect(view.onLatenessChange).toHaveBeenCalledWith('m-1', '12');
    expect(view.onExcuseChange).toHaveBeenCalledWith('m-1', 'work');
    expect(view.onExcuseChange).toHaveBeenLastCalledWith('m-1', null);
    expect(view.onCorrectionReasonChange).toHaveBeenCalledWith('m-1', 'fix the scan');
  });

  it('defaults the excuse select to the none sentinel when no excuse is chosen', () => {
    renderEditor(buildAttendanceRosterRowView({ showExcuse: true, excuseCategory: null }));

    expect(screen.getByTestId(TEST_IDS.attendanceExcuseSelect)).toBeInTheDocument();
  });

  it('hides the lateness, excuse and correction controls a plain row does not need', () => {
    renderEditor(buildAttendanceRosterRowView(), true);

    expect(screen.queryByTestId(TEST_IDS.attendanceLatenessInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceExcuseSelect)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceCorrectionReason)).not.toBeInTheDocument();
  });
});
