import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceRosterRowView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceRosterRow } from './attendance-roster-row.component';

function renderRow(row: ReturnType<typeof buildAttendanceRosterRowView>) {
  render(
    <AttendanceRosterRow
      row={row}
      resolveConflictLabel="Resolve conflict"
      isBusy={false}
      onToggle={vi.fn()}
      onStatusChange={vi.fn()}
      onLatenessChange={vi.fn()}
      onExcuseChange={vi.fn()}
      onCorrectionReasonChange={vi.fn()}
      onResolveConflict={vi.fn()}
      onShowHistory={vi.fn()}
      onSaveCorrection={vi.fn()}
    />,
  );
}

describe('AttendanceRosterRow', () => {
  it('composes the identity, editor and actions for a clean row', () => {
    renderRow(buildAttendanceRosterRowView({ conflictMessage: null }));

    expect(screen.getByTestId(TEST_IDS.attendanceRosterRow)).toBeInTheDocument();
    expect(screen.getByText('Alex Ranger')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceConflict)).not.toBeInTheDocument();
  });

  it('emphasises a row that is carrying a sync conflict', () => {
    renderRow(buildAttendanceRosterRowView({ conflictMessage: 'The record changed' }));

    expect(screen.getByTestId(TEST_IDS.attendanceConflict)).toBeInTheDocument();
  });
});
