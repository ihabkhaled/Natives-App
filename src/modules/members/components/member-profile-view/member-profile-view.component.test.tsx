import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { buildMemberProfileView } from '../../../../../tests/factories/members-view.factory';

import { MemberProfileView } from './member-profile-view.component';
import type { MemberProfileStatus } from '../../types/members-view.types';

const STATE_TEST_IDS: Record<MemberProfileStatus, string> = {
  loading: TEST_IDS.memberProfileLoading,
  error: TEST_IDS.memberProfileError,
  offline: TEST_IDS.offlineState,
  forbidden: TEST_IDS.memberProfileForbidden,
  notFound: TEST_IDS.emptyState,
  ready: TEST_IDS.memberProfileFields,
};

describe('MemberProfileView', () => {
  it.each(Object.entries(STATE_TEST_IDS))('renders the %s state', (status, testId) => {
    render(
      <MemberProfileView {...buildMemberProfileView({ status: status as MemberProfileStatus })} />,
    );
    expect(screen.getByTestId(TEST_IDS.memberProfilePage)).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('navigates back', () => {
    const onBack = vi.fn();
    render(<MemberProfileView {...buildMemberProfileView({ onBack })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.memberProfileBack));
    expect(onBack).toHaveBeenCalled();
  });
});
