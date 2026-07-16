import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openInAppBrowser } from './capacitor-browser.facade';

const { open } = vi.hoisted(() => ({
  open: vi.fn<(options: { url: string }) => Promise<void>>(),
}));

vi.mock('@capacitor/browser', () => ({ Browser: { open } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('openInAppBrowser', () => {
  it('opens the url through the plugin', async () => {
    await openInAppBrowser('https://example.com/docs');

    expect(open).toHaveBeenCalledExactlyOnceWith({ url: 'https://example.com/docs' });
  });

  it('waits for the plugin before resolving', async () => {
    let opened = false;
    open.mockImplementation(() => {
      opened = true;
      return Promise.resolve();
    });

    await openInAppBrowser('https://example.com');

    expect(opened).toBe(true);
  });

  it('propagates a plugin failure to the caller', async () => {
    open.mockRejectedValue(new Error('no browser available'));

    await expect(openInAppBrowser('https://example.com')).rejects.toThrow('no browser available');
  });
});
