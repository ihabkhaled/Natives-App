import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAttendanceRosterRowView,
  buildAttendanceScreenView,
} from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceRosterList } from './attendance-roster-list.component';

describe('AttendanceRosterList', () => {
  it('renders one card per roster entry', () => {
    const rows = [
      buildAttendanceRosterRowView({ membershipId: 'm-1' }),
      buildAttendanceRosterRowView({ membershipId: 'm-2', playerLabel: 'Sam Disc' }),
    ];
    render(<AttendanceRosterList {...buildAttendanceScreenView({ rows })} />);

    expect(screen.getAllByTestId(TEST_IDS.attendanceRosterRow)).toHaveLength(2);
  });

  it('shows the no-matches empty state when every player is filtered out', () => {
    render(<AttendanceRosterList {...buildAttendanceScreenView({ rows: [] })} />);

    expect(screen.getByTestId(TEST_IDS.attendanceEmpty)).toBeInTheDocument();
  });

  it.each(['isSubmitting', 'isCorrecting', 'isReplaying'] as const)(
    'keeps the roster mounted while %s is in flight',
    (flag) => {
      render(<AttendanceRosterList {...buildAttendanceScreenView({ [flag]: true })} />);

      expect(screen.getByTestId(TEST_IDS.attendanceRoster)).toBeInTheDocument();
    },
  );
});
