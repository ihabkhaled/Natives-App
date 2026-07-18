import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { SessionRowView } from '../../hooks/use-sessions-screen.hook';
import { SessionList } from './session-list.component';
import type { SessionListProps } from './session-list.types';

const ROWS: readonly SessionRowView[] = [
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
];

function renderList(overrides: Partial<SessionListProps> = {}): SessionListProps {
  const props: SessionListProps = {
    rows: ROWS,
    currentLabel: 'This device',
    revokeLabel: 'Sign out',
    revokeOthersLabel: 'Sign out all other devices',
    hasOtherSessions: true,
    isRevoking: false,
    onRevoke: vi.fn(),
    onRevokeOthers: vi.fn(),
    ...overrides,
  };
  render(<SessionList {...props} />);
  return props;
}

describe('SessionList', () => {
  it('renders one item per session and badges the current device', () => {
    renderList();

    expect(screen.getAllByTestId(TEST_IDS.sessionItem)).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.sessionsCurrentBadge)).toHaveTextContent('This device');
  });

  it('offers a revoke button only for non-current sessions', async () => {
    const view = renderList();

    const revokeButtons = screen.getAllByTestId(TEST_IDS.sessionRevokeButton);
    expect(revokeButtons).toHaveLength(1);

    await userEvent.click(revokeButtons[0]!);
    expect(view.onRevoke).toHaveBeenCalledExactlyOnceWith('tablet');
  });

  it('revokes all other sessions from the bulk action', async () => {
    const view = renderList();

    await userEvent.click(screen.getByTestId(TEST_IDS.sessionsRevokeOthersButton));

    expect(view.onRevokeOthers).toHaveBeenCalledTimes(1);
  });

  it('hides the bulk action when there are no other sessions', () => {
    renderList({ rows: [ROWS[0]!], hasOtherSessions: false });

    expect(screen.queryByTestId(TEST_IDS.sessionsRevokeOthersButton)).not.toBeInTheDocument();
  });

  it('disables the actions while a revoke is in flight', () => {
    renderList({ isRevoking: true });

    expect(screen.getByTestId(TEST_IDS.sessionsRevokeOthersButton)).toHaveProperty(
      'disabled',
      true,
    );
  });
});
