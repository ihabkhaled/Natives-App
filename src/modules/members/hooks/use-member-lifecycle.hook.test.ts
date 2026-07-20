import { waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { LIFECYCLE_ACTION } from '../constants/members.constants';
import { transitionMember } from '../services/transition-member.service';
import { useMemberLifecycle } from './use-member-lifecycle.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast, confirm } = vi.hoisted(() => ({ showToast: vi.fn(), confirm: vi.fn() }));

vi.mock('@/shared/ui', () => ({
  useAppToast: () => ({ showToast }),
  useConfirmAlert: () => ({ confirm }),
}));
vi.mock('../services/transition-member.service', () => ({ transitionMember: vi.fn() }));

const record = {
  id: 'm',
  teamId: 't',
  status: 'inactive' as const,
  statusReason: null,
  statusEffectiveAtIso: '2026-07-19T10:00:00.000Z',
  version: 2,
};

function renderLifecycle(status: 'active' | undefined) {
  return renderHookWithProviders(() => useMemberLifecycle('t', 'm', status, true));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  confirm.mockResolvedValue(true);
  vi.mocked(transitionMember).mockResolvedValue(record);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberLifecycle', () => {
  it('offers actions for a status and none when the status is unknown', () => {
    expect(renderLifecycle('active').result.current.actions.length).toBeGreaterThan(0);
    expect(renderLifecycle(undefined).result.current.actions).toEqual([]);
  });

  it('confirms then transitions with a success toast', async () => {
    const { result } = renderLifecycle('active');
    result.current.onAction(LIFECYCLE_ACTION.suspend);
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
    expect(transitionMember).toHaveBeenCalled();
  });

  it('does nothing when the confirm dialog is dismissed', async () => {
    confirm.mockResolvedValue(false);
    const { result } = renderLifecycle('active');
    result.current.onAction(LIFECYCLE_ACTION.archive);
    await waitFor(() => {
      expect(confirm).toHaveBeenCalled();
    });
    expect(transitionMember).not.toHaveBeenCalled();
  });

  it('surfaces a conflict as a warning toast', async () => {
    vi.mocked(transitionMember).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));
    const { result } = renderLifecycle('active');
    result.current.onAction(LIFECYCLE_ACTION.suspend);
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'warning' }));
    });
  });

  it('surfaces other failures as a danger toast', async () => {
    vi.mocked(transitionMember).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));
    const { result } = renderLifecycle('active');
    result.current.onAction(LIFECYCLE_ACTION.deactivate);
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
