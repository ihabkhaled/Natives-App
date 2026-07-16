import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { useAppNavigation, type AppNavigation } from '@/packages/router';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useNotFoundScreen, type NotFoundScreenView } from './use-not-found-screen.hook';

interface NotFoundProbe {
  readonly screen: NotFoundScreenView;
  readonly navigation: AppNavigation;
}

function renderNotFound(): ReturnType<typeof renderHookWithProviders<NotFoundProbe>> {
  return renderHookWithProviders<NotFoundProbe>(
    () => ({ screen: useNotFoundScreen(), navigation: useAppNavigation() }),
    { initialPath: '/does-not-exist' },
  );
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useNotFoundScreen', () => {
  it('exposes every label as translated English copy', () => {
    const { result } = renderNotFound();

    expect(result.current.screen.title).toBe('Page not found');
    expect(result.current.screen.message).toBe('The page you are looking for does not exist.');
    expect(result.current.screen.goHomeLabel).toBe('Go home');
  });

  it('sends the user back to the root route', () => {
    const { result } = renderNotFound();

    act(() => {
      result.current.screen.onGoHome();
    });

    expect(result.current.navigation.currentPath).toBe('/');
  });

  it('replaces the dead route so it never returns through history', () => {
    const { result } = renderNotFound();

    act(() => {
      result.current.screen.onGoHome();
    });
    act(() => {
      result.current.navigation.goBack();
    });

    expect(result.current.navigation.currentPath).not.toBe('/does-not-exist');
  });
});
