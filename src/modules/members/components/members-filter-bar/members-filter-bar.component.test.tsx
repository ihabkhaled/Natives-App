import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { fireIonChange, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';

import { MembersFilterBar } from './members-filter-bar.component';
import { MEMBERS_FILTER_ALL_VALUE } from './members-filter-bar.constants';
import type { MembersFilterView } from '../../types/members-view.types';

function buildFilter(overrides: Partial<MembersFilterView>): MembersFilterView {
  return {
    searchLabel: 'Search',
    searchPlaceholder: 'Search…',
    search: '',
    onSearchChange: vi.fn(),
    statusLabel: 'Status',
    allLabel: 'All',
    status: null,
    statusOptions: [{ value: 'active', label: 'Active' }],
    onStatusChange: vi.fn(),
    positionLabel: 'Position',
    position: null,
    positionOptions: ['handler'],
    onPositionChange: vi.fn(),
    ...overrides,
  };
}

describe('MembersFilterBar', () => {
  it('emits search input changes', () => {
    const onSearchChange = vi.fn();
    render(<MembersFilterBar filter={buildFilter({ onSearchChange })} />);
    fireIonInput(screen.getByTestId(TEST_IDS.membersSearch), 'omar');
    expect(onSearchChange).toHaveBeenCalledWith('omar');
  });

  it('maps status and position selects, including the all sentinel', () => {
    const onStatusChange = vi.fn();
    const onPositionChange = vi.fn();
    render(<MembersFilterBar filter={buildFilter({ onStatusChange, onPositionChange })} />);
    fireIonChange(screen.getByTestId(TEST_IDS.membersStatusFilter), 'active');
    expect(onStatusChange).toHaveBeenCalledWith('active');
    fireIonChange(screen.getByTestId(TEST_IDS.membersStatusFilter), MEMBERS_FILTER_ALL_VALUE);
    expect(onStatusChange).toHaveBeenCalledWith(null);
    fireIonChange(screen.getByTestId(TEST_IDS.membersPositionFilter), 'handler');
    expect(onPositionChange).toHaveBeenCalledWith('handler');
    fireIonChange(screen.getByTestId(TEST_IDS.membersPositionFilter), MEMBERS_FILTER_ALL_VALUE);
    expect(onPositionChange).toHaveBeenCalledWith(null);
  });
});
