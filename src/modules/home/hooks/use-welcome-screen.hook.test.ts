import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { useAppNavigation, type AppNavigation } from '@/packages/router';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useWelcomeScreen, type WelcomeScreenView } from './use-welcome-screen.hook';

interface WelcomeProbe {
  readonly screen: WelcomeScreenView;
  readonly navigation: AppNavigation;
}

function renderWelcome(): ReturnType<typeof renderHookWithProviders<WelcomeProbe>> {
  return renderHookWithProviders<WelcomeProbe>(
    () => ({ screen: useWelcomeScreen(), navigation: useAppNavigation() }),
    { initialPath: '/welcome' },
  );
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useWelcomeScreen', () => {
  it('exposes every label as translated English copy', () => {
    const { result } = renderWelcome();

    expect(result.current.screen.title).toBe('Welcome to Ultimate Natives');
    expect(result.current.screen.subtitle).toBe(
      'Manage practices, attendance, and player performance for your team.',
    );
    expect(result.current.screen.tagline).toBe('Elite ultimate. One community.');
    expect(result.current.screen.logoLabel).toBe('Ultimate Natives logo');
    expect(result.current.screen.loginCta).toBe('Sign in');
  });

  it('navigates to the login screen when the call to action fires', () => {
    const { result } = renderWelcome();

    act(() => {
      result.current.screen.onLoginClick();
    });

    expect(result.current.navigation.currentPath).toBe('/login');
  });

  it('pushes the login screen so the user can come back to welcome', () => {
    const { result } = renderWelcome();

    act(() => {
      result.current.screen.onLoginClick();
    });
    act(() => {
      result.current.navigation.goBack();
    });

    expect(result.current.navigation.currentPath).toBe('/welcome');
  });
});
