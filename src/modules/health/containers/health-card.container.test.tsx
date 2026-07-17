import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useHealthCard, type HealthCardView } from '../hooks/use-health-card.hook';
import { HealthCardContainer } from './health-card.container';

vi.mock('../hooks/use-health-card.hook', () => ({ useHealthCard: vi.fn() }));

function mockHealthCard(overrides: Partial<HealthCardView> = {}): HealthCardView['onRefresh'] {
  const onRefresh = vi.fn();
  vi.mocked(useHealthCard).mockReturnValue({
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
    onRefresh,
    ...overrides,
  });
  return onRefresh;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('HealthCardContainer', () => {
  it('renders the card from the view model', () => {
    mockHealthCard();

    render(<HealthCardContainer />);

    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
    expect(screen.getByText('API health')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.healthStatus)).toHaveTextContent('Operational');
  });

  it('passes the loading view straight through', () => {
    mockHealthCard({ isLoading: true });

    render(<HealthCardContainer />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
  });

  it('passes the error view straight through', () => {
    mockHealthCard({ errorMessage: 'You appear to be offline.' });

    render(<HealthCardContainer />);

    expect(screen.getByTestId(TEST_IDS.errorState)).toHaveTextContent('You appear to be offline.');
  });

  it('wires the refresh action to the hook', async () => {
    const onRefresh = mockHealthCard();

    render(<HealthCardContainer />);
    await userEvent.click(screen.getByTestId(TEST_IDS.healthRefreshButton));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
