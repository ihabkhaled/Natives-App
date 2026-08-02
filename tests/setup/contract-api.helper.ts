import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getEnvironment } from '@/packages/environment';
import { MOCK_CREDENTIALS } from '@/tests/msw/mock-data.constants';

/** Absolute mock-mode API URL for a path (shared by contract tests). */
export function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

/** The one JSON sender every authenticated contract call goes through. */
function sendJson(
  method: 'POST' | 'PUT',
  path: string,
  token: string,
  body: unknown,
): Promise<Response> {
  return fetch(apiUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
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
  return sendJson('POST', path, token, body);
}

/** Authenticated PUT against a mock-mode path. */
export function authPut(path: string, token: string, body: unknown): Promise<Response> {
  return sendJson('PUT', path, token, body);
}

/** Authenticated DELETE against a mock-mode path. */
export function authDelete(path: string, token: string): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Team-scoped path builder shared by every team-scoped contract test. */
export function teamScopedPath(teamId: string, suffix: string): string {
  return `/teams/${teamId}${suffix}`;
}

const CONTRACT_PATH = fileURLToPath(new URL('../../contracts/openapi.json', import.meta.url));

/** Only the slice of the OpenAPI document the contract specs assert against. */
export interface OpenApiContract {
  readonly paths: Record<
    string,
    { readonly get?: { readonly parameters?: readonly { readonly name: string }[] } }
  >;
  readonly components: {
    readonly schemas: Record<
      string,
      { readonly properties?: Record<string, { readonly enum?: readonly string[] }> }
    >;
  };
}

/** Re-reads the committed contract each call, so a spec never asserts on a stale copy. */
export function readOpenApiContract(): OpenApiContract {
  return JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as OpenApiContract;
}
