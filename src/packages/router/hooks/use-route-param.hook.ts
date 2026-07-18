import { useParams } from 'react-router-dom';

/**
 * The single owner of path-parameter access. Reads one named segment from the
 * matched route and returns null when it is absent, so feature hooks never
 * touch react-router internals directly.
 */
export function useRouteParam(name: string): string | null {
  const params = useParams<Record<string, string | undefined>>();
  return params[name] ?? null;
}
