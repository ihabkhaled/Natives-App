import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useGovernanceScreen } from '../hooks/use-governance-screen.hook';
import { GovernanceContainer } from './governance.container';

vi.mock('../hooks/use-governance-screen.hook', () => ({ useGovernanceScreen: vi.fn() }));

describe('GovernanceContainer', () => {
  it('composes the screen hook with the presentational view', () => {
    vi.mocked(useGovernanceScreen).mockReturnValue({
      path: '/governance',
      pageTitle: 'Governance',
      status: 'empty',
      meetingsHeading: 'Meetings',
      meetingsIntro: 'Soonest first.',
      meetingCountLabel: '0 meetings',
      meetings: [],
      tasksHeading: 'Tasks',
      tasksIntro: 'Most urgent first.',
      taskCountLabel: '0 tasks',
      tasks: [],
      loadingLabel: 'Loading…',
      errorTitle: 'Error',
      errorMessage: 'Error',
      retryLabel: 'Retry',
      onRetry: vi.fn(),
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'Forbidden',
      forbiddenMessage: 'Forbidden',
      emptyTitle: 'No board records yet',
      emptyMessage: 'Nothing recorded.',
    });

    render(<GovernanceContainer />);

    expect(screen.getByTestId(TEST_IDS.governanceView)).toBeInTheDocument();
    expect(screen.getByText('No board records yet')).toBeInTheDocument();
  });
});
