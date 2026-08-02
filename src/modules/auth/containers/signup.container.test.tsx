import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildSignupScreenView } from '../../../../tests/factories/signup-screen-view.factory';
import { useSignupScreen } from '../hooks/use-signup-screen.hook';
import { SignupContainer } from './signup.container';

vi.mock('../hooks/use-signup-screen.hook', () => ({ useSignupScreen: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('SignupContainer', () => {
  it('renders the request form the screen hook prepared', () => {
    vi.mocked(useSignupScreen).mockReturnValue(buildSignupScreenView());

    render(<SignupContainer />);

    expect(screen.getByTestId(TEST_IDS.signupPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.signupSubmitButton)).toBeInTheDocument();
  });

  it('renders the awaiting-approval state once the request is accepted', () => {
    vi.mocked(useSignupScreen).mockReturnValue(buildSignupScreenView({ isAwaitingApproval: true }));

    render(<SignupContainer />);

    expect(screen.getByTestId(TEST_IDS.signupPending)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.signupSubmitButton)).not.toBeInTheDocument();
  });
});
