import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceRosterRowView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceRowIdentity } from './attendance-row-identity.component';

describe('AttendanceRowIdentity', () => {
  it('shows the player identity with the historical badge and toggles selection', () => {
    const onToggle = vi.fn();
    render(
      <AttendanceRowIdentity
        row={buildAttendanceRosterRowView({ isHistorical: true })}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText('Alex Ranger')).toBeInTheDocument();
    expect(screen.getByText('Historical player')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.attendancePlayerSelect));
    expect(onToggle).toHaveBeenCalledWith('m-1');
  });

  it.each([
    ['conflict', 'In conflict'],
    ['failed', 'Sync failed'],
    ['pending', 'Pending sync'],
    [null, 'Saved'],
  ] as const)('colours the sync badge for the %s queue state', (queueState, syncLabel) => {
    render(
      <AttendanceRowIdentity
        row={buildAttendanceRosterRowView({ queueState, syncLabel })}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText(syncLabel)).toBeInTheDocument();
  });
});
