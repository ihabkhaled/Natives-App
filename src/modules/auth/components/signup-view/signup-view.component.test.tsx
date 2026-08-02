import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildSignupScreenView } from '../../../../../tests/factories/signup-screen-view.factory';
import { SignupView } from './signup-view.component';
import type { SignupViewProps } from './signup-view.types';

function mountView(overrides: Partial<SignupViewProps> = {}): SignupViewProps {
  const props = buildSignupScreenView(overrides);
  render(<SignupView {...props} />);
  return props;
}

describe('SignupView', () => {
  it('renders the branded panel with the request form', () => {
    mountView();

    expect(screen.getByTestId(TEST_IDS.signupPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Request an account');
    expect(screen.getByTestId(TEST_IDS.signupEmailInput)).toBeInTheDocument();
    expect(screen.getByText('Tell us who you are.')).toBeInTheDocument();
  });

  it('offers the sign-in shortcut to people who already have an account', () => {
    mountView();

    expect(screen.getByTestId(TEST_IDS.signupSignInLink)).toHaveTextContent(
      'Already have an account? Sign in',
    );
  });

  it('replaces the form with the awaiting-approval state after a successful request', () => {
    mountView({ isAwaitingApproval: true });

    expect(screen.queryByTestId(TEST_IDS.signupEmailInput)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.signupPending)).toHaveTextContent(
      'Request received — awaiting approval',
    );
    expect(screen.getByTestId(TEST_IDS.signupPending)).toHaveTextContent(
      'stays switched off until an administrator approves it',
    );
  });

  it('spells out what happens next instead of implying the user is signed in', () => {
    mountView({ isAwaitingApproval: true });

    const steps = screen.getByTestId(TEST_IDS.signupPendingSteps);
    expect(steps).toHaveTextContent('An administrator reviews it.');
    expect(steps).toHaveTextContent('We email you.');
    expect(steps).toHaveTextContent('Then you can sign in.');
    expect(screen.getByTestId(TEST_IDS.signupSignInLink)).toHaveTextContent('Back to sign in');
  });

  it('returns to sign-in from the awaiting-approval state', async () => {
    const props = mountView({ isAwaitingApproval: true });

    await userEvent.click(screen.getByTestId(TEST_IDS.signupSignInLink));

    expect(props.onBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('passes the submit failure down to the form', () => {
    mountView({ submitErrorMessage: 'That email is already registered.' });

    expect(screen.getByTestId(TEST_IDS.signupError)).toHaveTextContent('already registered');
  });
});
