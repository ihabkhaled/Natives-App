import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { ParticipationCardView } from '../../types/attendance-view.types';
import { ParticipationSummaryCard } from './participation-summary-card.component';

function buildView(overrides: Partial<ParticipationCardView> = {}): ParticipationCardView {
  return {
    title: 'Participation',
    rateLabel: 'Attendance rate',
    rateText: '90.9%',
    hasRate: true,
    breakdown: [
      { key: 'onTime', label: 'Present', valueText: '8' },
      { key: 'late', label: 'Late', valueText: '2' },
    ],
    ruleNotice: 'Based on finalized sessions only · rule attendance-2026-1',
    candidateNotice: 'Provisional rule attendance-2026-1 — pending approval',
    isNotConfigured: false,
    notConfiguredMessage: 'Attendance scoring is not configured yet.',
    ...overrides,
  };
}

describe('ParticipationSummaryCard', () => {
  it('renders the rate, breakdown, and both rule notices', () => {
    render(<ParticipationSummaryCard view={buildView()} />);

    expect(screen.getByTestId(TEST_IDS.myAttendanceParticipationRate)).toHaveTextContent('90.9%');
    expect(screen.getByTestId(TEST_IDS.myAttendanceParticipationBreakdown)).toHaveTextContent(
      'Late',
    );
    expect(screen.getByTestId(TEST_IDS.myAttendanceRuleNotice)).toHaveTextContent(
      'pending approval',
    );
  });

  it('renders the honest not-enough-data body without a candidate caveat', () => {
    render(
      <ParticipationSummaryCard
        view={buildView({
          hasRate: false,
          rateText: 'Not enough data yet',
          candidateNotice: null,
        })}
      />,
    );

    expect(screen.getByText('Not enough data yet')).toBeInTheDocument();
    expect(screen.queryByText(/pending approval/u)).not.toBeInTheDocument();
  });

  it('shows only the calm not-configured message when no rule is approved', () => {
    render(<ParticipationSummaryCard view={buildView({ isNotConfigured: true })} />);

    expect(screen.getByTestId(TEST_IDS.myAttendanceRuleNotice)).toHaveTextContent(
      'not configured yet',
    );
    expect(
      screen.queryByTestId(TEST_IDS.myAttendanceParticipationBreakdown),
    ).not.toBeInTheDocument();
  });
});
