import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WelcomeView } from './welcome-view.component';
import { WELCOME_VIEW_TEST_IDS } from './welcome-view.constants';

const PROPS = {
  title: 'Welcome to Ultimate Natives',
  subtitle: 'Manage practices, attendance, and player performance for your team.',
  tagline: 'Elite ultimate. One community.',
  logoLabel: 'Ultimate Natives logo',
  loginCta: 'Sign in',
};

function mountWelcome(onLoginClick: () => void = vi.fn()): void {
  render(<WelcomeView {...PROPS} onLoginClick={onLoginClick} />);
}

describe('WelcomeView', () => {
  it('renders the title as the page heading', () => {
    mountWelcome();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome to Ultimate Natives',
    );
  });

  it('renders the brand logo with accessible alt text', () => {
    mountWelcome();

    expect(screen.getByRole('img', { name: PROPS.logoLabel })).toBeInTheDocument();
  });

  it('renders the subtitle and the brand tagline', () => {
    mountWelcome();

    expect(screen.getByText(PROPS.subtitle)).toBeInTheDocument();
    expect(screen.getByText(PROPS.tagline)).toBeInTheDocument();
  });

  it('renders the call to action under its test id', () => {
    mountWelcome();

    expect(screen.getByTestId(WELCOME_VIEW_TEST_IDS.loginCta)).toHaveTextContent('Sign in');
  });

  it('forwards a call-to-action click', async () => {
    const onLoginClick = vi.fn();
    mountWelcome(onLoginClick);

    await userEvent.click(screen.getByTestId(WELCOME_VIEW_TEST_IDS.loginCta));

    expect(onLoginClick).toHaveBeenCalledOnce();
  });
});
