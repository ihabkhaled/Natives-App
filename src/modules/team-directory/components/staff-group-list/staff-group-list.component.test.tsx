import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDirectoryCardView } from '../../../../../tests/factories/team-directory-view.factory';
import { StaffGroupList } from './staff-group-list.component';

const GROUPS = [
  { key: 'coach', heading: 'Coach', cards: [buildDirectoryCardView({ id: 'coach-3alamy' })] },
  {
    key: 'co-coach',
    heading: 'Co-Coach',
    cards: [
      buildDirectoryCardView({ id: 'co-coach-doda', displayName: 'Khaled Ossama' }),
      buildDirectoryCardView({ id: 'co-coach-roo', displayName: 'Rawan Elessawy' }),
    ],
  },
];

describe('StaffGroupList', () => {
  it('renders one titled band per responsibility', () => {
    render(<StaffGroupList groups={GROUPS} />);

    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryStaffGroup)).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Coach' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Co-Coach' })).toBeInTheDocument();
  });

  it('renders every member of every group', () => {
    render(<StaffGroupList groups={GROUPS} />);

    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryCard)).toHaveLength(3);
  });

  it('renders nothing when the board is empty', () => {
    render(<StaffGroupList groups={[]} />);

    expect(screen.queryByTestId(TEST_IDS.teamDirectoryStaffGroup)).not.toBeInTheDocument();
  });
});
