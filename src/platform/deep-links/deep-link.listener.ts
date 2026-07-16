import { getLaunchUrl, subscribeToAppUrlOpen } from '@/packages/capacitor-app';

import { parseDeepLink, type DeepLinkPolicy } from './deep-link.parser';

export interface DeepLinkListenerOptions {
  readonly policy: DeepLinkPolicy;
  readonly onNavigate: (path: string) => void;
  readonly onRejected?: (rawUrl: string) => void;
}

function handleUrl(rawUrl: string, options: DeepLinkListenerOptions): void {
  const parsed = parseDeepLink(rawUrl, options.policy);
  if (parsed.ok) {
    options.onNavigate(parsed.value);
    return;
  }
  options.onRejected?.(rawUrl);
}

/**
 * Routes allowlisted deep links (cold start and runtime) into the app
 * router. Returns a cleanup that removes the native listener.
 */
export function startDeepLinkListener(options: DeepLinkListenerOptions): () => void {
  void getLaunchUrl().then((launchUrl) => {
    if (launchUrl !== null) {
      handleUrl(launchUrl, options);
    }
  });
  return subscribeToAppUrlOpen((url) => {
    handleUrl(url, options);
  });
}
