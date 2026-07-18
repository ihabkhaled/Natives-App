import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDashboardBreakdownRowView } from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardBreakdown } from './dashboard-breakdown.component';

describe('DashboardBreakdown', () => {
  it('renders an accessible table with a caption and row headers', () => {
    render(
      <DashboardBreakdown
        caption="Attendance summary"
        rows={[
          buildDashboardBreakdownRowView({ key: 'present', label: 'Present', valueText: '8' }),
          buildDashboardBreakdownRowView({
            key: 'absent',
            label: 'Absent',
            valueText: 'Not recorded',
            hasValue: false,
          }),
        ]}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dashboardBreakdownTable)).toBeInTheDocument();
    expect(screen.getByText('Attendance summary')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Present' })).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });
});
