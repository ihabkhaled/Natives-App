import { describe, expect, it } from 'vitest';

import { buildLandingSeamChrome, resolveLandingSeamStatus } from './landing-seam-copy.helper';

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
