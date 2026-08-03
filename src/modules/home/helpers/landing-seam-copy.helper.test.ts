import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import {
  buildLandingSeamChrome,
  buildLiveSeamChrome,
  resolveLandingSeamStatus,
} from './landing-seam-copy.helper';

const t = (key: string): string => `t:${key}`;

describe('resolveLandingSeamStatus', () => {
  it('resolves ready when the seam has items', () => {
    expect(resolveLandingSeamStatus(true)).toBe('ready');
  });

  it('resolves empty when the seam has no items yet', () => {
    expect(resolveLandingSeamStatus(false)).toBe('empty');
  });
});

describe('buildLandingSeamChrome', () => {
  it('carries the empty-state copy from the caller-supplied keys', () => {
    const chrome = buildLandingSeamChrome(t, false, 'landing.emptyTitle', 'landing.emptyMessage');

    expect(chrome.status).toBe('empty');
    expect(chrome.emptyTitle).toBe('t:landing.emptyTitle');
    expect(chrome.emptyMessage).toBe('t:landing.emptyMessage');
  });

  it('resolves ready when items are present', () => {
    const chrome = buildLandingSeamChrome(t, true, 'landing.emptyTitle', 'landing.emptyMessage');

    expect(chrome.status).toBe('ready');
  });

  it('exposes a harmless no-op retry — the stub seam has nothing to retry yet', () => {
    const chrome = buildLandingSeamChrome(t, false, 'landing.emptyTitle', 'landing.emptyMessage');

    expect(() => {
      chrome.onRetry();
    }).not.toThrow();
  });
});

describe('buildLiveSeamChrome', () => {
  const seam = {
    isLoading: false,
    error: null,
    isOffline: false,
    onRetry: (): void => undefined,
  };

  it('reports loading while the query is in flight', () => {
    const chrome = buildLiveSeamChrome(
      t,
      { ...seam, isLoading: true },
      'landing.emptyTitle',
      'landing.emptyMessage',
    );

    expect(chrome.status).toBe('loading');
  });

  it('reports ready once the query resolves with items', () => {
    const chrome = buildLiveSeamChrome(
      t,
      { ...seam, hasData: true, hasItems: true },
      'landing.emptyTitle',
      'landing.emptyMessage',
    );

    expect(chrome.status).toBe('ready');
  });

  it('treats an unstated item count as empty rather than ready', () => {
    const chrome = buildLiveSeamChrome(
      t,
      { ...seam, hasData: true },
      'landing.emptyTitle',
      'landing.emptyMessage',
    );

    expect(chrome.status).toBe('empty');
    expect(chrome.emptyTitle).toBe('t:landing.emptyTitle');
  });

  it('surfaces the query error, and retries through the query it came from', () => {
    let retried = false;
    const chrome = buildLiveSeamChrome(
      t,
      {
        ...seam,
        error: new AppError({ code: APP_ERROR_CODE.Server }),
        onRetry: (): void => {
          retried = true;
        },
      },
      'landing.emptyTitle',
      'landing.emptyMessage',
    );

    expect(chrome.status).toBe('error');
    chrome.onRetry();
    expect(retried).toBe(true);
  });

  it('reports offline ahead of any other state', () => {
    const chrome = buildLiveSeamChrome(
      t,
      { ...seam, isOffline: true },
      'landing.emptyTitle',
      'landing.emptyMessage',
    );

    expect(chrome.status).toBe('offline');
  });
});
