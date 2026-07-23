import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPerformanceScoreCardView } from '../../../../../tests/factories/assessments-view.factory';
import { PerformanceScoreCard } from './performance-score-card.component';

describe('PerformanceScoreCard', () => {
  it('renders the value, badges, explanation table, and rule reference', () => {
    render(<PerformanceScoreCard view={buildPerformanceScoreCardView()} />);

    expect(screen.getByTestId(TEST_IDS.performanceScoreValue)).toHaveTextContent('78.4');
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.performanceScoreExplanation)).toHaveTextContent('Excluded');
    expect(screen.getByText('Rule overall-2026 · v2')).toBeInTheDocument();
  });

  it('shows the honest not-computed body without badges or a table', () => {
    render(
      <PerformanceScoreCard
        view={buildPerformanceScoreCardView({
          hasValue: false,
          valueText: 'Not computed yet',
          components: [],
          ruleReference: '',
        })}
      />,
    );

    expect(screen.getByText('Not computed yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceScoreExplanation)).not.toBeInTheDocument();
    expect(screen.queryByText('Confidence')).not.toBeInTheDocument();
  });

  it('keeps a skeleton while loading and surfaces a calm failure line', () => {
    const { unmount } = render(
      <PerformanceScoreCard view={buildPerformanceScoreCardView({ isLoading: true })} />,
    );
    expect(screen.queryByTestId(TEST_IDS.performanceScoreValue)).not.toBeInTheDocument();
    unmount();

    render(
      <PerformanceScoreCard
        view={buildPerformanceScoreCardView({ unavailableMessage: 'Could not load.' })}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Could not load.');
  });
});
