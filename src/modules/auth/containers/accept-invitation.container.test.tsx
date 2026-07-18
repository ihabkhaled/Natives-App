import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildSetPasswordFieldsLabelsFixture,
  buildSetPasswordFormView,
} from '../../../../tests/factories/auth-view.factory';
import {
  useAcceptInvitationScreen,
  type AcceptInvitationScreenView,
} from '../hooks/use-accept-invitation-screen.hook';
import { AcceptInvitationContainer } from './accept-invitation.container';

vi.mock('../hooks/use-accept-invitation-screen.hook', () => ({
  useAcceptInvitationScreen: vi.fn(),
}));

const onBackToLogin = vi.fn();

function mockScreen(
  overrides: Partial<AcceptInvitationScreenView> = {},
): AcceptInvitationScreenView {
  const view: AcceptInvitationScreenView = {
    labels: {
      title: 'Accept your invitation',
      emailLabel: 'Your email',
      backToLogin: 'Back to sign in',
      loading: 'Checking your invitation…',
      invalidTitle: 'Invitation unavailable',
      invalidMessage: 'This invitation is invalid or has expired.',
      fields: buildSetPasswordFieldsLabelsFixture({ submit: 'Create account' }),
    },
    form: buildSetPasswordFormView(),
    isLoadingInvitation: false,
    isInvitationInvalid: false,
    invitationEmail: 'invitee@example.com',
    introMessage: 'Coach Nadia invited you to join Cairo Natives.',
    isSubmitting: false,
    submitErrorMessage: undefined,
    onBackToLogin,
    ...overrides,
  };
  vi.mocked(useAcceptInvitationScreen).mockReturnValue(view);
  return view;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('AcceptInvitationContainer', () => {
  it('shows a loading state while the invitation is fetched', () => {
    mockScreen({ isLoadingInvitation: true });

    render(<AcceptInvitationContainer />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toBeInTheDocument();
  });

  it('shows the invalid state for a dead invitation', () => {
    mockScreen({ isInvitationInvalid: true, invitationEmail: undefined, introMessage: undefined });

    render(<AcceptInvitationContainer />);

    expect(screen.getByTestId(TEST_IDS.acceptInvitationStatus)).toHaveTextContent(
      'Invitation unavailable',
    );
  });

  it('renders the details and password form for a valid invitation', () => {
    mockScreen();

    render(<AcceptInvitationContainer />);

    expect(screen.getByTestId(TEST_IDS.acceptInvitationPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.acceptInvitationEmail)).toHaveTextContent(
      'invitee@example.com',
    );
    expect(screen.getByTestId(TEST_IDS.setPasswordSubmitButton)).toHaveTextContent(
      'Create account',
    );
  });

  it('returns to sign-in from the invalid state', async () => {
    mockScreen({ isInvitationInvalid: true, invitationEmail: undefined, introMessage: undefined });

    render(<AcceptInvitationContainer />);
    await userEvent.click(screen.getByTestId(TEST_IDS.authBackToLoginLink));

    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });
});
