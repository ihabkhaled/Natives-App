import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { invitePersonByEmail } from '../services/invite-member-by-email.service';
import { listAssignableRoles } from '../services/list-assignable-roles.service';
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
vi.mock('../services/list-assignable-roles.service', () => ({ listAssignableRoles: vi.fn() }));

const DELIVERY = {
  id: 'inv-1',
  email: 'recruit@example.com',
  teamRole: 'coach',
  status: 'pending' as const,
  expiresAt: '2026-07-28T13:38:53.984Z',
  acceptUrl: 'http://localhost/accept-invitation?token=abc',
};

/** The server catalog: known slugs plus one the client has no copy for. */
const CATALOG = [
  { slug: 'member', displayName: 'Member', description: 'Reads their own data.' },
  { slug: 'coach', displayName: 'Coach', description: 'Manages practices and squads.' },
  { slug: 'physio', displayName: 'Physiotherapist', description: 'Reads wellness data.' },
];

function renderInvite() {
  return renderHookWithProviders(() => useInviteMember('team-1', true, 'Cairo Natives'));
}

interface InviteResult {
  readonly current: ReturnType<typeof useInviteMember>;
}

function fillValidForm(result: InviteResult): void {
  act(() => {
    result.current.onOpen();
  });
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
  vi.mocked(listAssignableRoles).mockResolvedValue(CATALOG);
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

  it('builds the role options from the server catalog, never from constants', async () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });

    await waitFor(() => {
      expect(result.current.roleOptions).toHaveLength(3);
    });
    expect(listAssignableRoles).toHaveBeenCalledWith('team-1');
    // Known slug → translated copy; unknown slug → the server display name.
    expect(result.current.roleOptions.map((option) => option.value)).toEqual([
      'member',
      'coach',
      'physio',
    ]);
    expect(result.current.roleOptions.find((option) => option.value === 'physio')?.label).toBe(
      'Physiotherapist',
    );
    expect(result.current.roleSelectDisabled).toBe(false);
    expect(result.current.roleOptionsNotice).toBeNull();
  });

  it('surfaces the selected role server description as the privilege hint', async () => {
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });
    await waitFor(() => {
      expect(result.current.roleOptions).toHaveLength(3);
    });

    act(() => {
      result.current.onRoleChange('coach');
    });

    expect(result.current.roleHint).toBe('Manages practices and squads.');
  });

  it('disables the select with an inline note while the catalog loads', () => {
    vi.mocked(listAssignableRoles).mockReturnValue(new Promise(() => undefined));
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });

    expect(result.current.roleSelectDisabled).toBe(true);
    expect(result.current.roleOptionsNotice).not.toBeNull();
  });

  it('states a failed catalog load instead of a spinner-forever select', async () => {
    vi.mocked(listAssignableRoles).mockRejectedValue(new Error('boom'));
    const { result } = renderInvite();
    act(() => {
      result.current.onOpen();
    });

    await waitFor(() => {
      expect(result.current.roleSelectDisabled).toBe(true);
      expect(result.current.roleOptionsNotice).toContain('could not be loaded');
    });
  });

  it('sends the chosen TEAM role with the invitation and the roster profile', async () => {
    const { result } = renderInvite();
    fillValidForm(result);
    await waitFor(() => {
      expect(result.current.roleOptions).toHaveLength(3);
    });
    act(() => {
      result.current.onRoleChange('coach');
    });
    act(() => {
      result.current.onSubmit();
    });

    await waitFor(() => {
      expect(invitePersonByEmail).toHaveBeenCalledWith('team-1', {
        email: 'recruit@example.com',
        teamRole: 'coach',
        profile: { fullName: 'New Recruit', nickname: null, jerseyNumber: null },
      });
    });
  });

  it('cannot double-fire the invitation from a double tap (P1-7)', async () => {
    let release: (value: typeof DELIVERY) => void = () => undefined;
    vi.mocked(invitePersonByEmail).mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    const { result } = renderInvite();
    fillValidForm(result);
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });
    act(() => {
      result.current.onSubmit();
    });
    act(() => {
      result.current.onSubmit();
    });

    release(DELIVERY);
    await waitFor(() => {
      expect(result.current.sent).not.toBeNull();
    });
    expect(invitePersonByEmail).toHaveBeenCalledTimes(1);
  });

  it('reports where the invitation went and offers the accept link as a fallback', async () => {
    const { result } = renderInvite();
    await submitAndAwaitReceipt(result);

    expect(result.current.sent?.message).toContain('recruit@example.com');
    expect(result.current.sent?.acceptUrl).toBe(DELIVERY.acceptUrl);
    expect(result.current.sent?.teamValue).toBe('Cairo Natives');
    expect(result.current.sent?.roleValue).toBe('Coach');
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

  it('states a ceiling refusal in privilege terms, never "try again" (P1-8)', async () => {
    vi.mocked(invitePersonByEmail).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Forbidden,
        messageKey: 'errors.rbac.escalationDenied',
      }),
    );
    const { result } = renderInvite();
    await submitAndFail(result);

    expect(result.current.errorMessage).toContain('role above your own');
    expect(result.current.errorMessage).not.toContain('try again');
  });

  it('states a missing invite permission plainly on a bare 403 (P1-8)', async () => {
    vi.mocked(invitePersonByEmail).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Forbidden }),
    );
    const { result } = renderInvite();
    await submitAndFail(result);

    expect(result.current.errorMessage).toContain('permission to invite');
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
      result.current.onClose();
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
    });
    expect(result.current.email).toBe('');
    expect(result.current.errorMessage).toBeNull();
  });
});
