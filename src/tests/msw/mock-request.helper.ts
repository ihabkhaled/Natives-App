import { getEnvironment } from '@/packages/environment';

/** Absolute mock-mode API URL for a path. */
export function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

/** Bearer presence is enough for the mock; the real API verifies the JWT. */
export function isAuthorized(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}
