import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { buildMemberCardView } from '../../../../../tests/factories/members-view.factory';

import { MemberDirectoryList } from './member-directory-list.component';

describe('MemberDirectoryList', () => {
  it('renders virtualized member cards and selects on click', () => {
    const onSelect = vi.fn();
    render(
      <MemberDirectoryList
        items={[buildMemberCardView({ membershipId: 'mem-9', ariaLabel: 'Omar Hassan' })]}
        heightPx={480}
        rosterLabel="Member directory"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.membersList)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Omar Hassan' }));
    expect(onSelect).toHaveBeenCalledWith('mem-9');
  });
});
