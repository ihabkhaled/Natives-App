import type { Result } from '@/shared/types';

import { parseUrlSafely } from '../security/url-policy.parser';

export interface DeepLinkPolicy {
  readonly allowedSchemes: readonly string[];
  readonly allowedHosts: readonly string[];
  readonly allowedPathPrefixes: readonly string[];
}

export interface DeepLinkRejection {
  readonly reason: 'unparseable' | 'scheme' | 'host' | 'path';
}

/**
 * Strict deep-link allowlist parser. Anything not explicitly allowed is
 * rejected; the result is an internal route path, never a raw URL.
 */
export function parseDeepLink(
  rawUrl: string,
  policy: DeepLinkPolicy,
): Result<string, DeepLinkRejection> {
  const url = parseUrlSafely(rawUrl);
  if (url === null) {
    return { ok: false, error: { reason: 'unparseable' } };
  }
  const scheme = url.protocol.replace(/:$/, '');
  if (!policy.allowedSchemes.includes(scheme)) {
    return { ok: false, error: { reason: 'scheme' } };
  }
  if (!policy.allowedHosts.includes(url.hostname)) {
    return { ok: false, error: { reason: 'host' } };
  }
  const matchesPrefix = policy.allowedPathPrefixes.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
  if (!matchesPrefix) {
    return { ok: false, error: { reason: 'path' } };
  }
  return { ok: true, value: `${url.pathname}${url.search}` };
}
