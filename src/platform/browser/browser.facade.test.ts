import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openInAppBrowser } from '@/packages/capacitor-browser';

import { openUrlInAppBrowser } from './browser.facade';

vi.mock('@/packages/capacitor-browser', () => ({ openInAppBrowser: vi.fn() }));

const openInAppBrowserMock = vi.mocked(openInAppBrowser);

beforeEach(() => {
  vi.clearAllMocks();
  openInAppBrowserMock.mockResolvedValue(undefined);
});

describe('openUrlInAppBrowser', () => {
  it('serializes the URL for the in-app browser plugin', async () => {
    await openUrlInAppBrowser(new URL('https://example.com/docs?page=2#top'));

    expect(openInAppBrowserMock).toHaveBeenCalledExactlyOnceWith(
      'https://example.com/docs?page=2#top',
    );
  });

  it('passes the normalized URL string', async () => {
    await openUrlInAppBrowser(new URL('https://EXAMPLE.com'));

    expect(openInAppBrowserMock).toHaveBeenCalledExactlyOnceWith('https://example.com/');
  });

  it('awaits the plugin call', async () => {
    let settled = false;
    openInAppBrowserMock.mockImplementation(() =>
      Promise.resolve().then(() => {
        settled = true;
      }),
    );

    await openUrlInAppBrowser(new URL('https://example.com'));

    expect(settled).toBe(true);
  });
});
