import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { WELCOME_VIEW_TEST_IDS } from '../components/welcome-view/welcome-view.constants';
import { useWelcomeScreen } from '../hooks/use-welcome-screen.hook';
import { WelcomeContainer } from './welcome.container';

vi.mock('../hooks/use-welcome-screen.hook', () => ({ useWelcomeScreen: vi.fn() }));

const onLoginClick = vi.fn();

beforeEach(() => {
  vi.mocked(useWelcomeScreen).mockReturnValue({
    title: 'Welcome to Ultimate Natives',
    subtitle: 'Manage practices, attendance, and player performance for your team.',
    tagline: 'Elite ultimate. One community.',
    logoLabel: 'Ultimate Natives logo',
    loginCta: 'Sign in',
    onLoginClick,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('WelcomeContainer', () => {
  it('renders the welcome page shell', () => {
    render(<WelcomeContainer />);

    expect(screen.getByTestId(TEST_IDS.welcomePage)).toBeInTheDocument();
  });

  it('uses an immersive heading without a duplicate toolbar', () => {
    render(<WelcomeContainer />);

    expect(screen.getAllByText('Welcome to Ultimate Natives')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome to Ultimate Natives',
    );
  });

  it('feeds the view model into the welcome view', () => {
    render(<WelcomeContainer />);

    expect(
      screen.getByText('Manage practices, attendance, and player performance for your team.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId(WELCOME_VIEW_TEST_IDS.loginCta)).toHaveTextContent('Sign in');
  });

  it('wires the call to action back to the screen hook', async () => {
    render(<WelcomeContainer />);

    await userEvent.click(screen.getByTestId(WELCOME_VIEW_TEST_IDS.loginCta));

    expect(onLoginClick).toHaveBeenCalledOnce();
  });
});
