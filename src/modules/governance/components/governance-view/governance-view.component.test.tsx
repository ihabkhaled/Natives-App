import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildMeetingCardView,
  buildTaskCardView,
} from '../../../../../tests/factories/governance-view.factory';
import { GovernanceView } from './governance-view.component';
import type { GovernanceViewProps } from './governance-view.types';

function props(overrides: Partial<GovernanceViewProps> = {}): GovernanceViewProps {
  return {
    path: '/governance',
    pageTitle: 'Governance',
    status: 'ready',
    meetingsHeading: 'Meetings',
    meetingsIntro: 'Soonest first.',
    meetingCountLabel: '2 meetings',
    meetings: [buildMeetingCardView()],
    tasksHeading: 'Tasks',
    tasksIntro: 'Most urgent first.',
    taskCountLabel: '3 tasks',
    tasks: [buildTaskCardView()],
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
    ...overrides,
  };
}

describe('GovernanceView', () => {
  it('shows both lists with their counts once ready', () => {
    render(<GovernanceView {...props()} />);

    expect(screen.getByText('2 meetings')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.governanceMeetingCard}-meeting-1`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.governanceTaskCard}-task-1`)).toBeInTheDocument();
  });

  it('renders neither list while the screen is not ready', () => {
    render(<GovernanceView {...props({ status: 'empty' })} />);

    expect(screen.queryByText('2 meetings')).not.toBeInTheDocument();
    expect(screen.getByText('No board records yet')).toBeInTheDocument();
  });

  it('presents the forbidden state to a principal without the grant', () => {
    render(<GovernanceView {...props({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.governanceForbidden)).toBeInTheDocument();
  });
});
