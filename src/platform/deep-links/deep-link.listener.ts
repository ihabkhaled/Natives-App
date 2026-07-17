import { getLaunchUrl, subscribeToAppUrlOpen } from '@/packages/capacitor-app';

import { isNativeRuntime } from '../runtime/runtime.facade';
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
 *
 * Native only, by design. On web the browser URL *is* the route and the
 * router already owns it; Capacitor's web shim resolves getLaunchUrl() to
 * the current page URL, so running this on web would re-parse every normal
 * page load as a deep link and reject it against the native allowlist.
 */
export function startDeepLinkListener(options: DeepLinkListenerOptions): () => void {
  if (!isNativeRuntime()) {
    return () => {
      // No native listener was registered on web; nothing to tear down.
    };
  }
  void getLaunchUrl().then((launchUrl) => {
    if (launchUrl !== null) {
      handleUrl(launchUrl, options);
    }
  });
  return subscribeToAppUrlOpen((url) => {
    handleUrl(url, options);
  });
}
