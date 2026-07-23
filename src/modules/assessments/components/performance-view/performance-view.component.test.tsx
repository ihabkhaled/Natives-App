import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';

import {
  buildPerformanceScoreCardView,
  buildPerformanceView,
} from '../../../../../tests/factories/assessments-view.factory';
import { PerformanceView } from './performance-view.component';

describe('PerformanceView', () => {
  it('renders both charts and the goals panel on the scores tab', () => {
    render(<PerformanceView {...buildPerformanceView()} />);

    expect(screen.getByTestId(TEST_IDS.performanceTrendChart)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.performanceRadarChart)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.developmentGoalsPanel)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.coachFeedbackPanel)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.performanceTabBar)).toBeInTheDocument();
  });

  it('renders the own score card on the scores tab when granted', () => {
    render(
      <PerformanceView {...buildPerformanceView({ scoreCard: buildPerformanceScoreCardView() })} />,
    );

    expect(screen.getByTestId(TEST_IDS.performanceScoreCard)).toBeInTheDocument();
  });

  it('deep-links to the measurements tab body', () => {
    render(<PerformanceView {...buildPerformanceView({ activeTab: 'measurements' })} />);

    expect(screen.getByTestId(TEST_IDS.measurementHistoryPanel)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceTrendChart)).not.toBeInTheDocument();
  });

  it('deep-links to the feedback tab with the acknowledgement panel', () => {
    render(<PerformanceView {...buildPerformanceView({ activeTab: 'feedback' })} />);

    expect(screen.getByTestId(TEST_IDS.coachFeedbackPanel)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.developmentGoalsPanel)).not.toBeInTheDocument();
  });

  it('forwards a segment change to the tab handler', () => {
    const view = buildPerformanceView();
    render(<PerformanceView {...view} />);

    fireIonChange(screen.getByTestId(TEST_IDS.performanceTabBar), 'feedback');

    expect(view.onTabChange).toHaveBeenCalledExactlyOnceWith('feedback');
  });

  it('hides the tab bar entirely when only the scores tab is permitted', () => {
    render(
      <PerformanceView
        {...buildPerformanceView({
          tabs: [{ id: 'scores', label: 'Scores', path: '/performance' }],
        })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.performanceTabBar)).not.toBeInTheDocument();
  });

  it('offers a metric switch and forwards the selection', () => {
    const view = buildPerformanceView();
    render(<PerformanceView {...view} />);

    fireIonChange(screen.getByTestId(TEST_IDS.performanceMetricSelect), 'metric-speed');

    expect(view.onSelectMetric).toHaveBeenCalledExactlyOnceWith('metric-speed');
  });

  it('shows the skeleton while loading', () => {
    render(<PerformanceView {...buildPerformanceView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.performanceLoading)).toBeInTheDocument();
  });

  it('shows the designed error state', () => {
    render(<PerformanceView {...buildPerformanceView({ status: 'error' })} />);

    expect(screen.getByTestId(TEST_IDS.performanceError)).toBeInTheDocument();
  });

  it('shows the offline state', () => {
    render(<PerformanceView {...buildPerformanceView({ status: 'offline' })} />);

    expect(screen.getByTestId(TEST_IDS.performanceOffline)).toBeInTheDocument();
  });

  it('shows the permission state and hides every chart', () => {
    render(<PerformanceView {...buildPerformanceView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.performanceForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceTrendChart)).not.toBeInTheDocument();
  });

  it('shows the empty state before anything is published', () => {
    render(<PerformanceView {...buildPerformanceView({ status: 'empty' })} />);

    expect(screen.getByTestId(TEST_IDS.performanceEmpty)).toBeInTheDocument();
  });

  it('omits the whole charts block when no chart can be drawn', () => {
    // A member cannot read the staff-scoped catalog: no chart AND no empty
    // metric select posing as a chart area — but the permitted panels stay.
    render(<PerformanceView {...buildPerformanceView({ trend: null, radar: null })} />);

    expect(screen.queryByTestId(TEST_IDS.performanceTrendChart)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceRadarChart)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceMetricSelect)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.developmentGoalsPanel)).toBeInTheDocument();
  });

  it('keeps the block with only the trend when the radar has no data', () => {
    render(<PerformanceView {...buildPerformanceView({ radar: null })} />);

    expect(screen.getByTestId(TEST_IDS.performanceTrendChart)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.performanceMetricSelect)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceRadarChart)).not.toBeInTheDocument();
  });

  it('keeps the block with only the radar when the trend has no data', () => {
    render(<PerformanceView {...buildPerformanceView({ trend: null })} />);

    expect(screen.getByTestId(TEST_IDS.performanceRadarChart)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceTrendChart)).not.toBeInTheDocument();
  });
});
