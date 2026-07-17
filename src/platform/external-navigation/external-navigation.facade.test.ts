import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openInAppBrowser } from '@/packages/capacitor-browser';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import type * as UrlPolicyModule from '../security/url-policy.parser';
import { parseUrlSafely, type ExternalUrlPolicy } from '../security/url-policy.parser';
import { openExternalUrl } from './external-navigation.facade';

vi.mock('@/packages/capacitor-browser', () => ({ openInAppBrowser: vi.fn() }));
// The real policy check stays live; only the parser call the facade makes is
// swappable, so the "policy said yes but the URL will not parse" guard is reachable.
vi.mock('../security/url-policy.parser', async (importOriginal) => {
  const actual = await importOriginal<typeof UrlPolicyModule>();
  return { ...actual, parseUrlSafely: vi.fn(actual.parseUrlSafely) };
});

const openInAppBrowserMock = vi.mocked(openInAppBrowser);
const parseUrlSafelyMock = vi.mocked(parseUrlSafely);

beforeEach(() => {
  vi.clearAllMocks();
  openInAppBrowserMock.mockResolvedValue(undefined);
});

describe('openExternalUrl', () => {
  it('opens an https URL allowed by the default policy', async () => {
    await openExternalUrl('https://example.com/docs?page=2');

    expect(openInAppBrowserMock).toHaveBeenCalledExactlyOnceWith('https://example.com/docs?page=2');
  });

  it.each(['http://example.com', 'javascript:alert(1)', 'not a url'])(
    'rejects %s without reaching the browser',
    async (rawUrl) => {
      await expect(openExternalUrl(rawUrl)).rejects.toMatchObject({
        code: APP_ERROR_CODE.DeepLinkRejected,
        message: 'Blocked external URL',
      });
      expect(openInAppBrowserMock).not.toHaveBeenCalled();
    },
  );

  it('rejects a URL carrying credentials', async () => {
    await expect(openExternalUrl('https://user:secret@example.com')).rejects.toBeInstanceOf(
      AppError,
    );
    expect(openInAppBrowserMock).not.toHaveBeenCalled();
  });

  it('honours a custom policy that blocks a host', async () => {
    const policy: ExternalUrlPolicy = {
      allowedProtocols: ['https:'],
      blockedHosts: ['evil.example.com'],
    };

    await expect(openExternalUrl('https://evil.example.com/x', policy)).rejects.toBeInstanceOf(
      AppError,
    );
    expect(openInAppBrowserMock).not.toHaveBeenCalled();
  });

  it('honours a custom policy that widens the protocol allowlist', async () => {
    const policy: ExternalUrlPolicy = {
      allowedProtocols: ['https:', 'http:'],
      blockedHosts: [],
    };

    await openExternalUrl('http://example.com/legacy', policy);

    expect(openInAppBrowserMock).toHaveBeenCalledExactlyOnceWith('http://example.com/legacy');
  });

  it('refuses to open a URL the policy accepted but the parser cannot resolve', async () => {
    parseUrlSafelyMock.mockReturnValueOnce(null);

    await expect(openExternalUrl('https://example.com')).rejects.toMatchObject({
      code: APP_ERROR_CODE.DeepLinkRejected,
      message: 'Unparseable URL',
    });
    expect(openInAppBrowserMock).not.toHaveBeenCalled();
  });
});
