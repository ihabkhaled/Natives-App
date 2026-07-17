import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { HealthStatusCard } from './health-status-card.component';
import { HEALTH_CARD_TEST_IDS } from './health-status-card.constants';
import type { HealthStatusCardProps } from './health-status-card.types';

function buildProps(overrides: Partial<HealthStatusCardProps> = {}): HealthStatusCardProps {
  return {
    title: 'API health',
    isLoading: false,
    loadingLabel: 'Loading…',
    errorMessage: undefined,
    retryLabel: 'Try again',
    statusLabel: 'Operational',
    isHealthy: true,
    versionLabel: 'Version',
    version: '1.4.2',
    checkedAtLabel: 'Checked',
    checkedAtText: 'July 16, 2026 10:15 AM',
    onRefresh: vi.fn(),
    ...overrides,
  };
}

describe('HealthStatusCard', () => {
  it('always renders the card title under the shared test id', () => {
    render(<HealthStatusCard {...buildProps()} />);

    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
    expect(screen.getByText('API health')).toBeInTheDocument();
    expect(HEALTH_CARD_TEST_IDS.card).toBe(TEST_IDS.healthCard);
  });

  it('renders only the loading state while the probe is in flight', () => {
    render(<HealthStatusCard {...buildProps({ isLoading: true })} />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
    expect(screen.queryByTestId(TEST_IDS.healthStatus)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.errorState)).not.toBeInTheDocument();
  });

  it('renders only the error state when the probe failed', () => {
    render(
      <HealthStatusCard
        {...buildProps({ errorMessage: 'Something went wrong on our side. Please try again.' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.errorState)).toHaveTextContent(
      'Something went wrong on our side. Please try again.',
    );
    expect(screen.queryByTestId(TEST_IDS.healthStatus)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.loadingState)).not.toBeInTheDocument();
  });

  it('prefers the loading state over a stale error', () => {
    render(
      <HealthStatusCard {...buildProps({ isLoading: true, errorMessage: 'Stale failure' })} />,
    );

    expect(screen.getByTestId(TEST_IDS.loadingState)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.errorState)).not.toBeInTheDocument();
  });

  it('renders the healthy snapshot with a success badge', () => {
    render(<HealthStatusCard {...buildProps()} />);

    const badge = screen.getByTestId(TEST_IDS.healthStatus);
    expect(badge).toHaveTextContent('Operational');
    expect(badge).toHaveAttribute('color', 'success');
    expect(screen.getByText(/Version: 1\.4\.2/)).toBeInTheDocument();
    expect(screen.getByText(/Checked: July 16, 2026 10:15 AM/)).toBeInTheDocument();
  });

  it('renders an unhealthy snapshot with a danger badge', () => {
    render(<HealthStatusCard {...buildProps({ isHealthy: false, statusLabel: 'Unavailable' })} />);

    const badge = screen.getByTestId(TEST_IDS.healthStatus);
    expect(badge).toHaveTextContent('Unavailable');
    expect(badge).toHaveAttribute('color', 'danger');
  });

  it('refreshes from the card action', async () => {
    const onRefresh = vi.fn();
    render(<HealthStatusCard {...buildProps({ onRefresh })} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.healthRefreshButton));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('retries from the error state', async () => {
    const onRefresh = vi.fn();
    render(<HealthStatusCard {...buildProps({ errorMessage: 'Boom', onRefresh })} />);

    await userEvent.click(screen.getByText('Try again'));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
