import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { inviteMember } from '../services/invite-member.service';
import { useInviteMember } from './use-invite-member.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('../services/invite-member.service', () => ({ inviteMember: vi.fn() }));

const record = {
  id: 'mem-new',
  teamId: 't',
  status: 'invited' as const,
  statusReason: null,
  statusEffectiveAtIso: '2026-07-19T10:00:00.000Z',
  version: 1,
};

function renderInvite() {
  return renderHookWithProviders(() => useInviteMember('team-1', true));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(inviteMember).mockResolvedValue(record);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useInviteMember', () => {
  it('flags a blank name and does not submit', () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });
    act(() => {
      result.current.onSubmit();
    });
    expect(inviteMember).not.toHaveBeenCalled();
    expect(result.current.fullNameError).not.toBeNull();
  });

  it('invites and toasts on success', async () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onFullNameChange('New Recruit');
    });
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(inviteMember).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
    act(() => {
      result.current.onClose();
    });
  });

  it('toasts an error when the invite fails', async () => {
    vi.mocked(inviteMember).mockRejectedValue(new Error('boom'));
    const { result } = renderInvite();
    act(() => {
      result.current.onFullNameChange('New Recruit');
    });
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
