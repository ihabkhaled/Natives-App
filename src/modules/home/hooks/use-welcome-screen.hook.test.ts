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

    expect(result.current.screen.title).toBe('Welcome to Capacitor Ranger');
    expect(result.current.screen.subtitle).toBe(
      'A strict Ionic React and Capacitor starter with enforced architecture.',
    );
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
