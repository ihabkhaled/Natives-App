import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceScreenView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceStateView } from './attendance-state-view.component';

describe('AttendanceStateView', () => {
  it.each([
    ['loading', TEST_IDS.attendanceLoading],
    ['offline', TEST_IDS.attendanceOffline],
    ['forbidden', TEST_IDS.attendanceError],
    ['empty', TEST_IDS.attendanceEmpty],
  ] as const)('renders the %s placeholder for that status', (status, testId) => {
    render(<AttendanceStateView {...buildAttendanceScreenView({ status })} />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders the error placeholder and forwards the retry action', () => {
    const view = buildAttendanceScreenView({ status: 'error' });
    render(<AttendanceStateView {...view} />);

    expect(screen.getByTestId(TEST_IDS.attendanceError)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try again'));
    expect(view.onRetry).toHaveBeenCalledOnce();
  });

  it('renders nothing chrome-worthy once the roster is ready', () => {
    render(<AttendanceStateView {...buildAttendanceScreenView({ status: 'ready' })} />);

    expect(screen.queryByTestId(TEST_IDS.attendanceLoading)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.attendanceEmpty)).not.toBeInTheDocument();
  });
});
