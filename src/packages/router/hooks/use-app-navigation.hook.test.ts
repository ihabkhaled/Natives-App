import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

import { useAppNavigation } from './use-app-navigation.hook';

function renderNavigation(initialPath = '/') {
  return renderHookWithProviders(() => useAppNavigation(), { initialPath });
}

describe('useAppNavigation', () => {
  it('exposes the current path', () => {
    const { result } = renderNavigation('/settings');

    expect(result.current.currentPath).toBe('/settings');
  });

  it('pushes a new entry onto the history stack', () => {
    const { result } = renderNavigation('/start');

    act(() => {
      result.current.push('/next');
    });

    expect(result.current.currentPath).toBe('/next');
  });

  it('goes back to the previous entry after a push', () => {
    const { result } = renderNavigation('/start');

    act(() => {
      result.current.push('/next');
    });
    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentPath).toBe('/start');
  });

  it('replaces the current entry without growing the stack', () => {
    const { result } = renderNavigation('/start');

    act(() => {
      result.current.push('/next');
    });
    act(() => {
      result.current.replace('/replaced');
    });

    expect(result.current.currentPath).toBe('/replaced');

    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentPath).toBe('/start');
  });

  it('reports the path only, without the query string', () => {
    const { result } = renderNavigation('/start');

    act(() => {
      result.current.push('/search?q=ranger');
    });

    expect(result.current.currentPath).toBe('/search');
  });
});
