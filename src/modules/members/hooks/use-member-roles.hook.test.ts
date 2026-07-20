import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MEMBER_ROLE } from '../constants/members.constants';
import { assignMemberRoles } from '../services/assign-member-roles.service';
import { getMemberRoles } from '../services/get-member-roles.service';
import { useMemberRoles } from './use-member-roles.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('../services/get-member-roles.service', () => ({ getMemberRoles: vi.fn() }));
vi.mock('../services/assign-member-roles.service', () => ({ assignMemberRoles: vi.fn() }));

const rolesState = {
  membershipId: 'm',
  roles: [MEMBER_ROLE.member],
  assignableRoles: [MEMBER_ROLE.member, MEMBER_ROLE.coach, MEMBER_ROLE.analyst],
};

function renderRoles() {
  return renderHookWithProviders(() => useMemberRoles('t', 'm', true));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(getMemberRoles).mockResolvedValue(rolesState);
  vi.mocked(assignMemberRoles).mockResolvedValue({
    ...rolesState,
    roles: [MEMBER_ROLE.member, MEMBER_ROLE.coach],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberRoles', () => {
  it('toggles a role, becomes dirty, and saves', async () => {
    const { result } = renderRoles();
    await waitFor(() => {
      expect(result.current.roles.length).toBeGreaterThan(0);
    });
    act(() => {
      result.current.onToggle(MEMBER_ROLE.coach);
    });
    expect(result.current.isDirty).toBe(true);
    act(() => {
      result.current.onSave();
    });
    await waitFor(() => {
      expect(assignMemberRoles).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
  });

  it('toasts an error when saving roles fails', async () => {
    vi.mocked(assignMemberRoles).mockRejectedValue(new Error('boom'));
    const { result } = renderRoles();
    await waitFor(() => {
      expect(result.current.roles.length).toBeGreaterThan(0);
    });
    act(() => {
      result.current.onToggle(MEMBER_ROLE.coach);
    });
    act(() => {
      result.current.onSave();
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
