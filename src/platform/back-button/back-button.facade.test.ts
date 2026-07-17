import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exitApp, subscribeToHardwareBackButton } from '@/packages/capacitor-app';

import { registerHardwareBackHandler } from './back-button.facade';

vi.mock('@/packages/capacitor-app', () => ({
  exitApp: vi.fn(),
  subscribeToHardwareBackButton: vi.fn(),
}));

const subscribeToHardwareBackButtonMock = vi.mocked(subscribeToHardwareBackButton);
const exitAppMock = vi.mocked(exitApp);

function pressBackButton(): void {
  subscribeToHardwareBackButtonMock.mock.calls[0]![0](true);
}

beforeEach(() => {
  vi.clearAllMocks();
  subscribeToHardwareBackButtonMock.mockReturnValue(vi.fn());
});

describe('registerHardwareBackHandler', () => {
  it('navigates back while history remains', () => {
    const goBack = vi.fn();

    registerHardwareBackHandler({ canGoBack: () => true, goBack });
    pressBackButton();

    expect(goBack).toHaveBeenCalledOnce();
    expect(exitAppMock).not.toHaveBeenCalled();
  });

  it('exits the app once history is exhausted', () => {
    const goBack = vi.fn();

    registerHardwareBackHandler({ canGoBack: () => false, goBack });
    pressBackButton();

    expect(exitAppMock).toHaveBeenCalledOnce();
    expect(goBack).not.toHaveBeenCalled();
  });

  it('re-checks history on every press', () => {
    const canGoBack = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    const goBack = vi.fn();

    registerHardwareBackHandler({ canGoBack, goBack });
    const listener = subscribeToHardwareBackButtonMock.mock.calls[0]![0];
    listener(true);
    listener(false);

    expect(goBack).toHaveBeenCalledOnce();
    expect(exitAppMock).toHaveBeenCalledOnce();
  });

  it('registers exactly one native listener and returns its cleanup', () => {
    const cleanup = vi.fn();
    subscribeToHardwareBackButtonMock.mockReturnValue(cleanup);

    const unsubscribe = registerHardwareBackHandler({ canGoBack: () => true, goBack: vi.fn() });

    expect(subscribeToHardwareBackButtonMock).toHaveBeenCalledOnce();
    expect(unsubscribe).toBe(cleanup);
  });
});
