import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceScreenView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceActionBar } from './attendance-action-bar.component';

describe('AttendanceActionBar', () => {
  it('runs the enabled save, finalize and retry-queue actions', () => {
    const view = buildAttendanceScreenView({
      canRetryQueue: true,
      canSubmit: true,
      canFinalize: true,
    });
    render(<AttendanceActionBar {...view} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceRetryQueue));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceSubmit));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceFinalize));

    expect(view.onRetryQueue).toHaveBeenCalledOnce();
    expect(view.onSubmit).toHaveBeenCalledOnce();
    expect(view.onFinalize).toHaveBeenCalledOnce();
  });

  it('hides the retry-queue button when there is nothing queued to retry', () => {
    render(<AttendanceActionBar {...buildAttendanceScreenView({ canRetryQueue: false })} />);

    expect(screen.queryByTestId(TEST_IDS.attendanceRetryQueue)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.attendanceSubmit)).toBeInTheDocument();
  });

  it('never renders finalize for a session without the finalize grant', () => {
    render(<AttendanceActionBar {...buildAttendanceScreenView({ showFinalize: false })} />);

    expect(screen.queryByTestId(TEST_IDS.attendanceFinalize)).not.toBeInTheDocument();
  });
});
