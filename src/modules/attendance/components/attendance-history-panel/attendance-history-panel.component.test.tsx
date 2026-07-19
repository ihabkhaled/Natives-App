import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAttendanceRevisionView,
  buildAttendanceScreenView,
} from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceHistoryPanel } from './attendance-history-panel.component';

describe('AttendanceHistoryPanel', () => {
  it('lists revisions and shows the reason only when one was recorded', () => {
    const view = buildAttendanceScreenView({
      historyMembershipId: 'm-1',
      historyItems: [
        buildAttendanceRevisionView({ id: 'rev-1', reason: 'Late scan' }),
        buildAttendanceRevisionView({
          id: 'rev-2',
          transitionLabel: 'Present to Absent',
          reason: null,
        }),
      ],
    });
    render(<AttendanceHistoryPanel {...view} />);

    expect(screen.getByTestId(TEST_IDS.attendanceHistoryPanel)).toBeInTheDocument();
    expect(screen.getByText('Late scan')).toBeInTheDocument();
    expect(screen.getByText('Present to Absent')).toBeInTheDocument();
  });

  it('shows the loading note while history is being fetched', () => {
    render(
      <AttendanceHistoryPanel
        {...buildAttendanceScreenView({
          historyMembershipId: 'm-1',
          isHistoryLoading: true,
          historyItems: [],
        })}
      />,
    );

    expect(screen.getByText('Loading history')).toBeInTheDocument();
  });

  it('shows the empty note when a member has no recorded changes', () => {
    render(
      <AttendanceHistoryPanel
        {...buildAttendanceScreenView({
          historyMembershipId: 'm-1',
          isHistoryLoading: false,
          historyItems: [],
        })}
      />,
    );

    expect(screen.getByText('No changes recorded yet.')).toBeInTheDocument();
  });
});
