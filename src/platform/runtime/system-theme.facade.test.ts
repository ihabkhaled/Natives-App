import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSystemPrefersDark, subscribeToSystemTheme } from './system-theme.facade';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type MediaQueryChangeListener = (event: { readonly matches: boolean }) => void;

function stubMatchMedia(matches: boolean) {
  const listeners = new Map<string, MediaQueryChangeListener>();
  const addEventListener = vi.fn((type: string, listener: MediaQueryChangeListener) => {
    listeners.set(type, listener);
  });
  const removeEventListener = vi.fn((type: string, listener: MediaQueryChangeListener) => {
    if (listeners.get(type) === listener) {
      listeners.delete(type);
    }
  });
  const matchMedia = vi.fn((query: string) => ({
    media: query,
    matches,
    addEventListener,
    removeEventListener,
  }));
  vi.stubGlobal('matchMedia', matchMedia);
  return { addEventListener, listeners, matchMedia, removeEventListener };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getSystemPrefersDark', () => {
  it('reports the dark-scheme media query match', () => {
    const { matchMedia } = stubMatchMedia(true);

    expect(getSystemPrefersDark()).toBe(true);
    expect(matchMedia).toHaveBeenCalledExactlyOnceWith(DARK_SCHEME_QUERY);
  });

  it('reports false when the system prefers light', () => {
    stubMatchMedia(false);

    expect(getSystemPrefersDark()).toBe(false);
  });
});

describe('subscribeToSystemTheme', () => {
  it('notifies the subscriber whenever the system theme flips', () => {
    const { listeners } = stubMatchMedia(false);
    const onChange = vi.fn();

    subscribeToSystemTheme(onChange);
    const listener = listeners.get('change')!;
    listener({ matches: true });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);

    listener({ matches: false });

    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('listens on the dark-scheme query only', () => {
    const { addEventListener, matchMedia } = stubMatchMedia(false);

    subscribeToSystemTheme(vi.fn());

    expect(matchMedia).toHaveBeenCalledExactlyOnceWith(DARK_SCHEME_QUERY);
    expect(addEventListener).toHaveBeenCalledOnce();
    expect(addEventListener.mock.calls[0]![0]).toBe('change');
  });

  it('removes the listener on cleanup', () => {
    const { listeners, removeEventListener } = stubMatchMedia(false);
    const onChange = vi.fn();

    const unsubscribe = subscribeToSystemTheme(onChange);
    const listener = listeners.get('change')!;
    unsubscribe();

    expect(removeEventListener).toHaveBeenCalledExactlyOnceWith('change', listener);
    expect(listeners.has('change')).toBe(false);
  });
});
