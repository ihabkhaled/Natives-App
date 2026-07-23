import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { PlatformAdminsViewProps } from './platform-admins-view.types';
import { PlatformAdminsView } from './platform-admins-view.component';

function buildProps(overrides: Partial<PlatformAdminsViewProps> = {}): PlatformAdminsViewProps {
  return {
    loadingLabel: 'Loading platform administrators…',
    errorTitle: 'Could not load the roster',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'Offline',
    offlineMessage: 'Reconnect to continue.',
    offlineNoticeLabel: 'Offline',
    isOffline: false,
    forbiddenTitle: 'Platform access required',
    forbiddenMessage: 'Only a super administrator can view this.',
    emptyTitle: 'No super administrators',
    emptyMessage: 'Promote a user below.',
    title: 'Platform administrators',
    subtitle: 'The audited top-privilege roster.',
    status: 'ready',
    rosterHeading: 'Current super administrators',
    rosterIntro: 'Who holds the platform role.',
    auditNotice: 'Every change is recorded with actor, target, and reason.',
    rows: [
      {
        userId: 'user-1',
        name: 'Ranger One',
        email: 'root@example.com',
        sinceLabel: 'Since 5 Jan 2026',
        grantedByLabel: 'Seeded at platform setup',
        revokeLabel: 'Revoke',
        canRevoke: true,
        onRevoke: vi.fn(),
      },
    ],
    promoteHeading: 'Promote a user',
    promoteIntro: 'Only here, never via a team invite.',
    userIdLabel: 'User ID',
    userIdPlaceholder: 'The target user id',
    userIdValue: '',
    onUserIdChange: vi.fn(),
    reasonLabel: 'Reason (audited)',
    reasonPlaceholder: 'Why platform-wide access',
    reasonValue: '',
    onReasonChange: vi.fn(),
    validationMessage: null,
    promoteLabel: 'Promote to super administrator',
    isPromoting: false,
    canPromote: false,
    onPromote: vi.fn(),
    ...overrides,
  };
}

describe('PlatformAdminsView', () => {
  it('renders the roster with identity facts, audit notice, and a revoke', async () => {
    const props = buildProps();
    render(<PlatformAdminsView {...props} />);

    const roster = screen.getByTestId(TEST_IDS.adminPlatformRoster);
    expect(roster).toHaveTextContent('Ranger One');
    expect(roster).toHaveTextContent('root@example.com');
    expect(roster).toHaveTextContent('Every change is recorded');

    const row = screen.getByTestId(TEST_IDS.adminPlatformRow);
    await userEvent.click(within(row).getByTestId(TEST_IDS.adminPlatformRevoke));
    expect(props.rows[0]?.onRevoke).toHaveBeenCalledOnce();
  });

  it('keeps the promote action disabled until the hook says it may fire', () => {
    render(<PlatformAdminsView {...buildProps({ canPromote: false })} />);

    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(TEST_IDS.adminPlatformPromote)).toHaveProperty('disabled', true);
  });

  it('announces the reason validation next to the audited reason field', () => {
    render(
      <PlatformAdminsView
        {...buildProps({ validationMessage: 'State a reason of at least 8 characters.' })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters');
  });

  it('submits through the hook wiring when the promote button is pressed', async () => {
    const props = buildProps({ canPromote: true });
    render(<PlatformAdminsView {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.adminPlatformPromote));

    expect(props.onPromote).toHaveBeenCalledOnce();
  });

  it('shows the designed forbidden state instead of the panels', () => {
    render(<PlatformAdminsView {...buildProps({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.adminPlatformForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.adminPlatformRoster)).not.toBeInTheDocument();
  });
});
