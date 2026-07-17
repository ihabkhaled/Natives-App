export interface ExternalUrlPolicy {
  readonly allowedProtocols: readonly string[];
  readonly blockedHosts: readonly string[];
}

export const DEFAULT_EXTERNAL_URL_POLICY: ExternalUrlPolicy = {
  allowedProtocols: ['https:'],
  blockedHosts: [],
};

export function parseUrlSafely(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

export function isAllowedExternalUrl(
  rawUrl: string,
  policy: ExternalUrlPolicy = DEFAULT_EXTERNAL_URL_POLICY,
): boolean {
  const url = parseUrlSafely(rawUrl);
  if (url === null) {
    return false;
  }
  if (!policy.allowedProtocols.includes(url.protocol)) {
    return false;
  }
  if (url.username !== '' || url.password !== '') {
    return false;
  }
  return !policy.blockedHosts.includes(url.hostname);
}
