import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useSessionsScreen, type SessionsScreenView } from '../hooks/use-sessions-screen.hook';
import { SessionsContainer } from './sessions.container';

vi.mock('../hooks/use-sessions-screen.hook', () => ({ useSessionsScreen: vi.fn() }));

const onRetry = vi.fn();
const onRevoke = vi.fn();

function mockScreen(overrides: Partial<SessionsScreenView> = {}): SessionsScreenView {
  const view: SessionsScreenView = {
    labels: {
      title: 'Active sessions',
      intro: 'These devices are signed in.',
      current: 'This device',
      revoke: 'Sign out',
      revokeOthers: 'Sign out all other devices',
      emptyTitle: 'No other sessions',
      emptyMessage: 'You are only signed in here.',
      errorTitle: 'Something went wrong',
      retry: 'Try again',
      loading: 'Loading…',
    },
    rows: [
      {
        id: 'current',
        device: 'Chrome on macOS',
        location: 'Cairo, EG',
        lastActiveText: 'Last active today',
        isCurrent: true,
      },
      {
        id: 'tablet',
        device: 'Safari on iPad',
        location: 'Alexandria, EG',
        lastActiveText: 'Last active yesterday',
        isCurrent: false,
      },
    ],
    hasOtherSessions: true,
    isLoading: false,
    errorMessage: undefined,
    isRevoking: false,
    onRevoke,
    onRevokeOthers: vi.fn(),
    onRetry,
    ...overrides,
  };
  vi.mocked(useSessionsScreen).mockReturnValue(view);
  return view;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('SessionsContainer', () => {
  it('renders the session list', () => {
    mockScreen();

    render(<SessionsContainer />);

    expect(screen.getByTestId(TEST_IDS.sessionsPage)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.sessionItem)).toHaveLength(2);
  });

  it('shows a loading state while sessions load', () => {
    mockScreen({ isLoading: true });

    render(<SessionsContainer />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toBeInTheDocument();
  });

  it('shows an error state with retry when the load fails', async () => {
    mockScreen({ errorMessage: 'Something went wrong on our side. Please try again.' });

    render(<SessionsContainer />);

    expect(screen.getByTestId(TEST_IDS.sessionsError)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when there are no sessions', () => {
    mockScreen({ rows: [], hasOtherSessions: false });

    render(<SessionsContainer />);

    expect(screen.getByTestId(TEST_IDS.sessionsEmpty)).toBeInTheDocument();
  });

  it('revokes a session from the list', async () => {
    mockScreen();

    render(<SessionsContainer />);
    await userEvent.click(screen.getByTestId(TEST_IDS.sessionRevokeButton));

    expect(onRevoke).toHaveBeenCalledExactlyOnceWith('tablet');
  });
});
