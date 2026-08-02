import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPublicNavView } from '../../../../../tests/factories/public-nav-view.factory';

import type { PublicNavView } from '../public-nav.types';
import { PublicNav } from './public-nav.component';

function view(overrides: Partial<PublicNavView> = {}): PublicNavView {
  return buildPublicNavView(overrides);
}

describe('PublicNav', () => {
  it('renders nothing while hidden', () => {
    render(<PublicNav {...view({ isVisible: false })} />);

    expect(screen.queryByTestId(TEST_IDS.publicNav)).not.toBeInTheDocument();
  });

  it('shows the brand and every primary link', () => {
    render(<PublicNav {...view()} />);

    expect(screen.getByTestId(TEST_IDS.publicNav)).toBeInTheDocument();
    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.publicNavLink}-about`)).toHaveTextContent('About');
  });

  it('marks the active destination with aria-current', () => {
    render(<PublicNav {...view()} />);

    expect(screen.getByTestId(`${TEST_IDS.publicNavLink}-home`)).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId(`${TEST_IDS.publicNavLink}-about`)).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates when a link is activated', async () => {
    const onNavigate = vi.fn();
    render(<PublicNav {...view({ onNavigate })} />);

    await userEvent.click(screen.getByTestId(`${TEST_IDS.publicNavLink}-contact`));

    expect(onNavigate).toHaveBeenCalledWith('/contact');
  });

  it('navigates home when the brand mark is activated', async () => {
    const onNavigate = vi.fn();
    render(<PublicNav {...view({ onNavigate })} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.publicNavBrand));

    expect(onNavigate).toHaveBeenCalledWith('/');
  });

  it('routes to sign-in from the call to action', async () => {
    const onSignIn = vi.fn();
    render(<PublicNav {...view({ onSignIn })} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.publicNavSignIn));

    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it('exposes the theme and locale switches as labelled, pressable toggles', async () => {
    const onToggleTheme = vi.fn();
    const onToggleLocale = vi.fn();
    render(<PublicNav {...view({ onToggleTheme, onToggleLocale })} />);

    const themeToggle = screen.getByTestId(TEST_IDS.publicNavThemeToggle);
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(themeToggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(themeToggle);
    expect(onToggleTheme).toHaveBeenCalledOnce();

    const localeToggle = screen.getByTestId(TEST_IDS.publicNavLocaleToggle);
    expect(localeToggle).toHaveAttribute('aria-label', 'View in Arabic');
    await userEvent.click(localeToggle);
    expect(onToggleLocale).toHaveBeenCalledOnce();
  });

  it('marks the theme switch pressed once dark mode is active', () => {
    render(<PublicNav {...view({ isDark: true })} />);

    expect(screen.getByTestId(TEST_IDS.publicNavThemeToggle)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the drawer closed until the menu button is used', async () => {
    const onToggleMenu = vi.fn();
    render(<PublicNav {...view({ onToggleMenu })} />);

    expect(screen.queryByTestId(TEST_IDS.publicNavDrawer)).not.toBeInTheDocument();
    const menuButton = screen.getByTestId(TEST_IDS.publicNavMenuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(menuButton);
    expect(onToggleMenu).toHaveBeenCalledOnce();
  });

  it('renders the drawer with every link and a sign-in action once open', async () => {
    const onNavigate = vi.fn();
    const onSignIn = vi.fn();
    render(<PublicNav {...view({ isMenuOpen: true, onNavigate, onSignIn })} />);

    const drawer = screen.getByTestId(TEST_IDS.publicNavDrawer);
    expect(drawer).toHaveAttribute('role', 'dialog');
    expect(screen.getByTestId(TEST_IDS.publicNavMenuButton)).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await userEvent.click(screen.getByTestId(`${TEST_IDS.publicNavLink}-drawer-about`));
    expect(onNavigate).toHaveBeenCalledWith('/about');

    await userEvent.click(screen.getByTestId(TEST_IDS.publicNavSignInDrawer));
    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it('offers self-signup as its own call to action in the bar', async () => {
    const onSignUp = vi.fn();
    render(<PublicNav {...view({ onSignUp })} />);

    const signUp = screen.getByTestId(TEST_IDS.publicNavSignUp);
    expect(signUp).toHaveTextContent('Create an account');
    await userEvent.click(signUp);

    expect(onSignUp).toHaveBeenCalledOnce();
  });

  it('carries the sign-up action into the drawer', async () => {
    const onSignUp = vi.fn();
    render(<PublicNav {...view({ isMenuOpen: true, onSignUp })} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.publicNavSignUpDrawer));

    expect(onSignUp).toHaveBeenCalledOnce();
  });
});
