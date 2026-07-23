import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { changeAppLocale } from '@/packages/i18n';
import { APP_LOCALE } from '@/shared/enums';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { submitSetPasswordForm } from '../../../../tests/setup/set-password-form.driver';
import {
  useAcceptInvitationMutation,
  type AcceptInvitationMutationView,
} from '../mutations/use-accept-invitation-mutation.hook';
import { getInvitation } from '../services/get-invitation.service';
import { useAcceptInvitationScreen } from './use-accept-invitation-screen.hook';

vi.mock('../services/get-invitation.service', () => ({ getInvitation: vi.fn() }));
vi.mock('../mutations/use-accept-invitation-mutation.hook', () => ({
  useAcceptInvitationMutation: vi.fn(),
}));

const STRONG = 'Ranger#Strong1234';
const DETAILS = {
  email: 'invitee@example.com',
  role: 'user' as const,
  inviterName: 'Coach Nadia',
  teamRole: 'coach',
  teamName: 'Cairo Natives',
  expiresAtIso: '2026-08-01T12:00:00.000Z',
};

function mockMutation(
  overrides: Partial<AcceptInvitationMutationView> = {},
): AcceptInvitationMutationView {
  const view: AcceptInvitationMutationView = {
    accept: vi.fn(),
    isSubmitting: false,
    error: null,
    ...overrides,
  };
  vi.mocked(useAcceptInvitationMutation).mockReturnValue(view);
  return view;
}

function renderScreen(initialPath: string) {
  return renderHookWithProviders(() => useAcceptInvitationScreen(), { initialPath });
}

/** Resolve one invitation variant and return the intro the screen builds. */
async function introFor(overrides: Partial<typeof DETAILS>): Promise<string | undefined> {
  mockMutation();
  vi.mocked(getInvitation).mockResolvedValue({ ...DETAILS, ...overrides });
  const { result } = renderScreen('/accept-invitation?token=abc');
  await waitFor(() => {
    expect(result.current.invitationEmail).toBe('invitee@example.com');
  });
  return result.current.introMessage;
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(async () => {
  await changeAppLocale(APP_LOCALE.English);
  vi.clearAllMocks();
});

describe('useAcceptInvitationScreen', () => {
  it('shows the invitation details once the lookup resolves', async () => {
    mockMutation();
    vi.mocked(getInvitation).mockResolvedValue(DETAILS);

    const { result } = renderScreen('/accept-invitation?token=abc');

    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    expect(result.current.isInvitationInvalid).toBe(false);
    expect(result.current.introMessage).toBe(
      'Coach Nadia invited you to join Cairo Natives as Coach. Set a password to activate your account.',
    );
    expect(result.current.labels.fields.submit).toBe('Create account');
  });

  it('names the team and role without an inviter display name', async () => {
    await expect(introFor({ inviterName: null })).resolves.toBe(
      "You've been invited to join Cairo Natives as Coach. Set a password to activate your account.",
    );
  });

  it('falls back to the branded team-less line for a platform-scoped invite', async () => {
    await expect(introFor({ inviterName: null, teamRole: 'member', teamName: null })).resolves.toBe(
      'The Ultimate Natives team invited you to join as Member. Set a password to activate your account.',
    );
  });

  it('humanizes an unseen role slug instead of crashing the intro', async () => {
    await expect(introFor({ inviterName: null, teamRole: 'physio_lead' })).resolves.toContain(
      'as Physio Lead',
    );
  });

  it('localizes the team-and-role intro in Arabic', async () => {
    await changeAppLocale(APP_LOCALE.Arabic);
    await expect(introFor({ inviterName: null })).resolves.toBe(
      'تمت دعوتك للانضمام إلى Cairo Natives بدور مدرّب. عيّن كلمة مرور لتفعيل حسابك.',
    );
  });

  it('marks a missing token invalid without fetching', () => {
    mockMutation();

    const { result } = renderScreen('/accept-invitation');

    expect(result.current.isInvitationInvalid).toBe(true);
    expect(getInvitation).not.toHaveBeenCalled();
  });

  it('marks a failed lookup as invalid', async () => {
    mockMutation();
    vi.mocked(getInvitation).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }),
    );

    const { result } = renderScreen('/accept-invitation?token=bad');

    await waitFor(() => {
      expect(result.current.isInvitationInvalid).toBe(true);
    });
  });

  it('translates a submit failure into sanitized copy', async () => {
    mockMutation({ error: new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }) });
    vi.mocked(getInvitation).mockResolvedValue(DETAILS);

    const { result } = renderScreen('/accept-invitation?token=abc');

    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    expect(result.current.submitErrorMessage).toBe(
      'This link is invalid or has expired. Request a new one.',
    );
  });

  it('accepts the invitation with the token and chosen password', async () => {
    const view = mockMutation();
    vi.mocked(getInvitation).mockResolvedValue(DETAILS);

    const { result } = renderScreen('/accept-invitation?token=abc');
    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    await submitSetPasswordForm(result.current.form, STRONG);

    expect(view.accept).toHaveBeenCalledExactlyOnceWith({
      token: 'abc',
      password: STRONG,
      displayName: '',
    });
  });

  it('sends the trimmed display name the invitee typed with the acceptance', async () => {
    const view = mockMutation();
    vi.mocked(getInvitation).mockResolvedValue(DETAILS);

    const { result } = renderScreen('/accept-invitation?token=abc');
    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    act(() => {
      result.current.displayNameField.onChange('  Omar the Handler ');
    });
    await submitSetPasswordForm(result.current.form, STRONG);

    expect(view.accept).toHaveBeenCalledExactlyOnceWith({
      token: 'abc',
      password: STRONG,
      displayName: 'Omar the Handler',
    });
  });
});
