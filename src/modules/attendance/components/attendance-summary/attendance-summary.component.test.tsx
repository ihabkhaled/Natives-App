import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceScreenView } from '../../../../../tests/factories/attendance-view.factory';
import { AttendanceSummary } from './attendance-summary.component';

describe('AttendanceSummary', () => {
  it('renders the roster headline, session label and status badges', () => {
    render(<AttendanceSummary {...buildAttendanceScreenView({ finalizedLabel: null })} />);

    expect(screen.getByTestId(TEST_IDS.attendanceSummary)).toBeInTheDocument();
    expect(screen.getByText('Coach roster')).toBeInTheDocument();
    expect(screen.getByText('Tuesday practice')).toBeInTheDocument();
    expect(screen.getByText('3 of 4 marked')).toBeInTheDocument();
  });

  it('reveals the finalized note only when the sheet has been finalized', () => {
    render(
      <AttendanceSummary {...buildAttendanceScreenView({ finalizedLabel: 'Finalized July 18' })} />,
    );

    expect(screen.getByText('Finalized July 18')).toBeInTheDocument();
  });
});
