import { getEnvironment } from '@/packages/environment';
import { MOCK_CREDENTIALS } from '@/tests/msw/mock-data.constants';

/** Absolute mock-mode API URL for a path (shared by contract tests). */
export function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

/** Log a persona in and return its access token. */
export async function loginAs(email: string): Promise<string> {
  const response = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: MOCK_CREDENTIALS.password }),
  });
  const body = (await response.json()) as { tokens: { accessToken: string } };
  return body.tokens.accessToken;
}

/** Authenticated GET against a mock-mode path. */
export function authGet(path: string, token: string): Promise<Response> {
  return fetch(apiUrl(path), { headers: { Authorization: `Bearer ${token}` } });
}

/** Authenticated POST against a mock-mode path. */
export function authPost(path: string, token: string, body: unknown): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

/** Team-scoped path builder shared by every team-scoped contract test. */
export function teamScopedPath(teamId: string, suffix: string): string {
  return `/teams/${teamId}${suffix}`;
}
