import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMemberAvatar } from '../services/get-member-avatar.service';
import { updateMemberAvatar } from '../services/update-member-avatar.service';
import { useMemberAvatar } from './use-member-avatar.hook';
import { buildMemberProfile } from '../../../../tests/factories/members.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const showToast = vi.hoisted(() => vi.fn());

vi.mock('../services/get-member-avatar.service', () => ({ getMemberAvatar: vi.fn() }));
vi.mock('../services/update-member-avatar.service', () => ({ updateMemberAvatar: vi.fn() }));
vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));

const profile = buildMemberProfile({ hasAvatar: false });

function renderAvatar() {
  return renderHookWithProviders(() => useMemberAvatar('t', 'm', profile, true));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(getMemberAvatar).mockResolvedValue({ url: null, expiresAtIso: null });
  vi.mocked(updateMemberAvatar).mockResolvedValue(buildMemberProfile({ hasAvatar: true }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberAvatar', () => {
  it('uploads and toasts on success', async () => {
    const { result } = renderAvatar();
    act(() => {
      result.current.onUpload();
    });
    await waitFor(() => {
      expect(updateMemberAvatar).toHaveBeenCalledWith('t', 'm');
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
  });

  it('toasts an error when the upload fails', async () => {
    vi.mocked(updateMemberAvatar).mockRejectedValue(new Error('boom'));
    const { result } = renderAvatar();
    act(() => {
      result.current.onUpload();
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
