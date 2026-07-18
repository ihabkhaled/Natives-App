import { useRouteChrome } from './hooks/use-route-chrome.hook';

/** Null-rendering provider that owns per-route document title and focus. */
export function RouteChrome(): null {
  useRouteChrome();
  return null;
}
