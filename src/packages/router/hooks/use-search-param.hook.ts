import { useLocation } from 'react-router-dom';

/**
 * The single owner of query-string access. Reads one parameter from the
 * current URL and returns null when it is absent, so feature hooks never
 * touch `window.location` or react-router internals directly.
 */
export function useSearchParam(name: string): string | null {
  const { search } = useLocation();
  return new URLSearchParams(search).get(name);
}
