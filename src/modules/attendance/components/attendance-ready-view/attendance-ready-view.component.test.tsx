import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAttendanceRevisionView,
  buildAttendanceScreenView,
} from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceReadyView } from './attendance-ready-view.component';

describe('AttendanceReadyView', () => {
  it('composes the summary, toolbar and roster without the history panel by default', () => {
    render(
      <AttendanceReadyView
        {...buildAttendanceScreenView({ isOffline: false, historyMembershipId: null })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.attendanceSummary)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.attendanceRoster)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.attendancePrivacyNotice)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceHistoryPanel)).not.toBeInTheDocument();
  });

  it('surfaces the offline banner and history panel when they are relevant', () => {
    render(
      <AttendanceReadyView
        {...buildAttendanceScreenView({
          isOffline: true,
          historyMembershipId: 'm-1',
          historyItems: [buildAttendanceRevisionView()],
        })}
      />,
    );

    expect(screen.getByText('Marks will sync when you reconnect.')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.attendanceHistoryPanel)).toBeInTheDocument();
  });
});
