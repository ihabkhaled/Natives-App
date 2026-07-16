import { describe, expect, it } from 'vitest';

import {
  DEFAULT_EXTERNAL_URL_POLICY,
  isAllowedExternalUrl,
  parseUrlSafely,
  type ExternalUrlPolicy,
} from './url-policy.parser';

describe('DEFAULT_EXTERNAL_URL_POLICY', () => {
  it('allows https only and blocks no host by default', () => {
    expect(DEFAULT_EXTERNAL_URL_POLICY).toEqual({
      allowedProtocols: ['https:'],
      blockedHosts: [],
    });
  });
});

describe('parseUrlSafely', () => {
  it('parses an absolute URL', () => {
    const url = parseUrlSafely('https://example.com/docs?page=2');

    expect(url?.hostname).toBe('example.com');
    expect(url?.pathname).toBe('/docs');
  });

  it('returns null instead of throwing on a malformed URL', () => {
    expect(parseUrlSafely('not a url')).toBeNull();
  });

  it('returns null for a relative path', () => {
    expect(parseUrlSafely('/settings')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseUrlSafely('')).toBeNull();
  });
});

describe('isAllowedExternalUrl', () => {
  it('allows an https URL under the default policy', () => {
    expect(isAllowedExternalUrl('https://example.com/docs')).toBe(true);
  });

  it('rejects an unparseable URL', () => {
    expect(isAllowedExternalUrl('not a url')).toBe(false);
  });

  it.each(['http://example.com', 'javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,x'])(
    'rejects %s because its protocol is not allowlisted',
    (rawUrl) => {
      expect(isAllowedExternalUrl(rawUrl)).toBe(false);
    },
  );

  it('rejects a URL carrying a username', () => {
    expect(isAllowedExternalUrl('https://attacker@example.com')).toBe(false);
  });

  it('rejects a URL carrying a password', () => {
    expect(isAllowedExternalUrl('https://:secret@example.com')).toBe(false);
  });

  it('rejects a URL carrying full credentials', () => {
    expect(isAllowedExternalUrl('https://user:secret@example.com')).toBe(false);
  });

  it('rejects a blocked host', () => {
    const policy: ExternalUrlPolicy = {
      allowedProtocols: ['https:'],
      blockedHosts: ['evil.example.com'],
    };

    expect(isAllowedExternalUrl('https://evil.example.com/path', policy)).toBe(false);
    expect(isAllowedExternalUrl('https://safe.example.com/path', policy)).toBe(true);
  });

  it('honours a custom protocol allowlist', () => {
    const policy: ExternalUrlPolicy = { allowedProtocols: ['mailto:'], blockedHosts: [] };

    expect(isAllowedExternalUrl('mailto:support@example.com', policy)).toBe(true);
    expect(isAllowedExternalUrl('https://example.com', policy)).toBe(false);
  });

  it('matches blocked hosts on the hostname, ignoring port and path', () => {
    const policy: ExternalUrlPolicy = {
      allowedProtocols: ['https:'],
      blockedHosts: ['evil.example.com'],
    };

    expect(isAllowedExternalUrl('https://evil.example.com:8443/anything', policy)).toBe(false);
  });
});
