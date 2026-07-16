import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeToAppStateChange } from '@/packages/capacitor-app';

import { subscribeToAppLifecycle } from './app-state.facade';

vi.mock('@/packages/capacitor-app', () => ({ subscribeToAppStateChange: vi.fn() }));

const subscribeToAppStateChangeMock = vi.mocked(subscribeToAppStateChange);

function captureStateListener(): (isActive: boolean) => void {
  return subscribeToAppStateChangeMock.mock.calls[0]![0];
}

beforeEach(() => {
  vi.clearAllMocks();
  subscribeToAppStateChangeMock.mockReturnValue(vi.fn());
});

describe('subscribeToAppLifecycle', () => {
  it('runs the foreground callback when the app becomes active', () => {
    const onForeground = vi.fn();
    const onBackground = vi.fn();

    subscribeToAppLifecycle({ onForeground, onBackground });
    captureStateListener()(true);

    expect(onForeground).toHaveBeenCalledOnce();
    expect(onBackground).not.toHaveBeenCalled();
  });

  it('runs the background callback when the app is suspended', () => {
    const onForeground = vi.fn();
    const onBackground = vi.fn();

    subscribeToAppLifecycle({ onForeground, onBackground });
    captureStateListener()(false);

    expect(onBackground).toHaveBeenCalledOnce();
    expect(onForeground).not.toHaveBeenCalled();
  });

  it('tolerates omitted callbacks in both directions', () => {
    subscribeToAppLifecycle({});
    const listener = captureStateListener();

    expect(() => {
      listener(true);
      listener(false);
    }).not.toThrow();
  });

  it('returns the native cleanup untouched', () => {
    const cleanup = vi.fn();
    subscribeToAppStateChangeMock.mockReturnValue(cleanup);

    const unsubscribe = subscribeToAppLifecycle({});

    expect(unsubscribe).toBe(cleanup);
    expect(subscribeToAppStateChangeMock).toHaveBeenCalledOnce();
  });
});
