import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { listMembers } from '../services/list-members.service';
import { useMembersDirectory } from './use-members-directory.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('../services/list-members.service', () => ({ listMembers: vi.fn() }));
vi.mock('./use-members-team-context.hook', () => ({
  useMembersTeamContext: () => ({
    teamId: 'team-1',
    isLoading: false,
    isError: false,
    permissions: [],
    canInvite: true,
    canManageLifecycle: false,
    canManageRoles: false,
    canManageAliases: false,
    canEditSelf: false,
  }),
}));

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(listMembers).mockResolvedValue({ items: [], total: 0, pageSize: 20, hasMore: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMembersDirectory', () => {
  it('builds the view and wires every filter and navigation handler', async () => {
    const { result } = renderHookWithProviders(() => useMembersDirectory());
    expect(result.current.title.length).toBeGreaterThan(0);

    act(() => {
      result.current.filter.onSearchChange('omar');
      result.current.filter.onStatusChange('active');
      result.current.filter.onPositionChange('handler');
    });
    expect(result.current.filter.search).toBe('omar');
    expect(result.current.filter.status).toBe('active');

    act(() => {
      result.current.onSelectMember('mem-1');
      result.current.onRetry();
    });
    await waitFor(() => {
      expect(result.current.filter.position).toBe('handler');
    });
  });

  it('surfaces a load error in the view', async () => {
    vi.mocked(listMembers).mockRejectedValue(new Error('boom'));
    const { result } = renderHookWithProviders(() => useMembersDirectory());
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });
});
