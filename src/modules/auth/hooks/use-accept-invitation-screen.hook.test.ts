import { waitFor } from '@testing-library/react';
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
      'Coach Nadia invited you to join Ultimate Natives as a member. Set a password to activate your account.',
    );
    expect(result.current.labels.fields.submit).toBe('Create account');
  });

  it('uses a truthful branded fallback when the inviter has no display name', async () => {
    mockMutation();
    vi.mocked(getInvitation).mockResolvedValue({
      ...DETAILS,
      role: 'admin',
      inviterName: null,
    });

    const { result } = renderScreen('/accept-invitation?token=abc');

    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    expect(result.current.introMessage).toBe(
      'The Ultimate Natives team invited you to join as an administrator. Set a password to activate your account.',
    );
  });

  it('localizes the role and branded fallback in Arabic', async () => {
    await changeAppLocale(APP_LOCALE.Arabic);
    mockMutation();
    vi.mocked(getInvitation).mockResolvedValue({
      ...DETAILS,
      inviterName: null,
    });

    const { result } = renderScreen('/accept-invitation?token=abc');

    await waitFor(() => {
      expect(result.current.invitationEmail).toBe('invitee@example.com');
    });
    expect(result.current.introMessage).toBe(
      'دعاك فريق Ultimate Natives للانضمام بصفتك عضو. عيّن كلمة مرور لتفعيل حسابك.',
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

    expect(view.accept).toHaveBeenCalledExactlyOnceWith({ token: 'abc', password: STRONG });
  });
});
