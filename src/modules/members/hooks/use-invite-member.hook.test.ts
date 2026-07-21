import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { invitePersonByEmail } from '../services/invite-member-by-email.service';
import { useInviteMember } from './use-invite-member.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast, copyTextToClipboard } = vi.hoisted(() => ({
  showToast: vi.fn(),
  copyTextToClipboard: vi.fn(),
}));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('@/platform', () => ({ copyTextToClipboard }));
vi.mock('../services/invite-member-by-email.service', () => ({ invitePersonByEmail: vi.fn() }));

const DELIVERY = {
  id: 'inv-1',
  email: 'recruit@example.com',
  role: 'user' as const,
  status: 'pending' as const,
  expiresAt: '2026-07-28T13:38:53.984Z',
  acceptUrl: 'http://localhost/accept-invitation?token=abc',
};

function renderInvite() {
  return renderHookWithProviders(() => useInviteMember('team-1', true));
}

interface InviteResult {
  readonly current: ReturnType<typeof useInviteMember>;
}

function fillValidForm(result: InviteResult): void {
  act(() => {
    result.current.onEmailChange('recruit@example.com');
  });
  act(() => {
    result.current.onFullNameChange('New Recruit');
  });
}

/** Fill the form, submit it, and wait for the refusal the server sent back. */
async function submitAndFail(result: InviteResult): Promise<void> {
  fillValidForm(result);
  act(() => {
    result.current.onSubmit();
  });
  await waitFor(() => {
    expect(result.current.errorMessage).not.toBeNull();
  });
}

/** Fill the form, submit it, and wait until the invitation actually exists. */
async function submitAndAwaitReceipt(result: InviteResult): Promise<void> {
  fillValidForm(result);
  act(() => {
    result.current.onSubmit();
  });
  await waitFor(() => {
    expect(result.current.sent).not.toBeNull();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  copyTextToClipboard.mockResolvedValue(true);
  vi.mocked(invitePersonByEmail).mockResolvedValue(DELIVERY);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useInviteMember', () => {
  it('flags a blank email and a blank name, and does not submit either way', () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });
    act(() => {
      result.current.onSubmit();
    });

    expect(invitePersonByEmail).not.toHaveBeenCalled();
    expect(result.current.emailError).not.toBeNull();
    expect(result.current.fullNameError).not.toBeNull();
  });

  it('refuses a malformed email rather than letting the server reject it', () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onEmailChange('not-an-email');
    });
    act(() => {
      result.current.onFullNameChange('New Recruit');
    });
    act(() => {
      result.current.onSubmit();
    });

    expect(invitePersonByEmail).not.toHaveBeenCalled();
    expect(result.current.emailError).not.toBeNull();
  });

  it('sends the account invitation and the roster profile together', async () => {
    const { result } = renderInvite();
    fillValidForm(result);
    act(() => {
      result.current.onRoleChange('admin');
    });
    act(() => {
      result.current.onSubmit();
    });

    await waitFor(() => {
      expect(invitePersonByEmail).toHaveBeenCalledWith('team-1', {
        email: 'recruit@example.com',
        role: 'admin',
        profile: { fullName: 'New Recruit', nickname: null, jerseyNumber: null },
      });
    });
  });

  it('reports where the invitation went and offers the accept link as a fallback', async () => {
    const { result } = renderInvite();
    await submitAndAwaitReceipt(result);

    expect(result.current.sent?.message).toContain('recruit@example.com');
    expect(result.current.sent?.acceptUrl).toBe(DELIVERY.acceptUrl);
  });

  it('copies the accept link and confirms it', async () => {
    const { result } = renderInvite();
    await submitAndAwaitReceipt(result);

    act(() => {
      result.current.sent?.onCopy();
    });

    await waitFor(() => {
      expect(copyTextToClipboard).toHaveBeenCalledWith(DELIVERY.acceptUrl);
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
  });

  it('keeps the link visible and says so when the clipboard refuses', async () => {
    copyTextToClipboard.mockResolvedValue(false);
    const { result } = renderInvite();
    await submitAndAwaitReceipt(result);

    act(() => {
      result.current.sent?.onCopy();
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
    expect(result.current.sent?.acceptUrl).toBe(DELIVERY.acceptUrl);
  });

  it('clears the panel and the form when the administrator is done', async () => {
    const { result } = renderInvite();
    await submitAndAwaitReceipt(result);

    act(() => {
      result.current.sent?.onDone();
    });

    expect(result.current.sent).toBeNull();
    expect(result.current.email).toBe('');
    expect(result.current.fullName).toBe('');
  });

  it('states the real reason a duplicate email was refused', async () => {
    vi.mocked(invitePersonByEmail).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Conflict,
        messageKey: 'errors.identity.invitationAlreadyExists',
      }),
    );
    const { result } = renderInvite();
    await submitAndFail(result);

    expect(result.current.errorMessage).toContain('already has an account');
    expect(result.current.sent).toBeNull();
  });

  it('falls back to the generic failure line for an unmapped error', async () => {
    vi.mocked(invitePersonByEmail).mockRejectedValue(new Error('boom'));
    const { result } = renderInvite();
    await submitAndFail(result);

    expect(result.current.errorMessage).toContain('could not be sent');
  });

  it('clears everything when the form is dismissed', async () => {
    const { result } = renderInvite();
    fillValidForm(result);
    act(() => {
      result.current.onOpen();
    });
    act(() => {
      result.current.onClose();
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
    });
    expect(result.current.email).toBe('');
    expect(result.current.errorMessage).toBeNull();
  });
});
