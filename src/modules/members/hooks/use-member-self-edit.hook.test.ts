import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { updateMemberProfile } from '../services/update-member-profile.service';
import { useMemberSelfEdit } from './use-member-self-edit.hook';
import { buildMemberProfile } from '../../../../tests/factories/members.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('../services/update-member-profile.service', () => ({ updateMemberProfile: vi.fn() }));

const profile = buildMemberProfile();

function renderSelfEdit() {
  return renderHookWithProviders(() => useMemberSelfEdit('team-1', profile, true));
}

function openAndSubmit(api: { current: { onOpen: () => void; onSubmit: () => void } }): void {
  act(() => {
    api.current.onOpen();
  });
  act(() => {
    api.current.onSubmit();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(updateMemberProfile).mockResolvedValue(profile);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberSelfEdit', () => {
  it('does not submit a blank name', () => {
    const { result } = renderSelfEdit();
    act(() => {
      result.current.onFullNameChange('');
    });
    act(() => {
      result.current.onSubmit();
    });
    expect(updateMemberProfile).not.toHaveBeenCalled();
  });

  it('seeds, opens, and saves the profile optimistically', async () => {
    const { result } = renderSelfEdit();
    openAndSubmit(result);
    await waitFor(() => {
      expect(updateMemberProfile).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
    act(() => {
      result.current.onClose();
    });
  });

  it('rolls back and warns on a version conflict', async () => {
    vi.mocked(updateMemberProfile).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Conflict }),
    );
    const { result } = renderSelfEdit();
    openAndSubmit(result);
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'warning' }));
    });
  });

  it('defaults the expected version and tolerates an absent profile', async () => {
    const { result: absent } = renderHookWithProviders(() =>
      useMemberSelfEdit('team-1', undefined, false),
    );
    act(() => {
      absent.current.onOpen();
    });
    expect(absent.current.canEdit).toBe(false);

    const versionless = buildMemberProfile({ version: null });
    const { result } = renderHookWithProviders(() =>
      useMemberSelfEdit('team-1', versionless, true),
    );
    openAndSubmit(result);
    await waitFor(() => {
      expect(updateMemberProfile).toHaveBeenCalledWith(
        'team-1',
        'mem-1',
        expect.objectContaining({ expectedVersion: 1 }),
      );
    });
  });

  it('reports other failures as an error toast', async () => {
    vi.mocked(updateMemberProfile).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));
    const { result } = renderSelfEdit();
    openAndSubmit(result);
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
