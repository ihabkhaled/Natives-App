import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { buildMembersDirectoryView } from '../../../../../tests/factories/members-view.factory';

import { MembersDirectoryView } from './members-directory-view.component';
import type { MembersDirectoryStatus } from '../../types/members-view.types';

const STATE_TEST_IDS: Record<MembersDirectoryStatus, string> = {
  loading: TEST_IDS.membersLoading,
  error: TEST_IDS.membersError,
  offline: TEST_IDS.membersOffline,
  forbidden: TEST_IDS.membersForbidden,
  empty: TEST_IDS.membersEmpty,
  noMatches: TEST_IDS.membersNoMatches,
  ready: TEST_IDS.membersList,
};

describe('MembersDirectoryView', () => {
  it.each(Object.entries(STATE_TEST_IDS))('renders the %s state', (status, testId) => {
    render(
      <MembersDirectoryView
        {...buildMembersDirectoryView({ status: status as MembersDirectoryStatus })}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.membersPage)).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('shows the count and retries from the error state', () => {
    const onRetry = vi.fn();
    render(<MembersDirectoryView {...buildMembersDirectoryView({ status: 'ready' })} />);
    expect(screen.getByText('1 of 1 members')).toBeInTheDocument();
    render(<MembersDirectoryView {...buildMembersDirectoryView({ status: 'error', onRetry })} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
