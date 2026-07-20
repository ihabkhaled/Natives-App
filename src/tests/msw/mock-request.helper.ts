import { getEnvironment } from '@/packages/environment';

import { nestErrorResponse } from './nest-error.helper';

/** Absolute mock-mode API URL for a path. */
export function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

/** Bearer presence is enough for the mock; the real API verifies the JWT. */
export function isAuthorized(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}

/** NestJS-shaped failure envelope for a mock route. */
export function failRequest(status: number, code: string, path: string): Response {
  return nestErrorResponse({ statusCode: status, code, message: code, path: `/api/v1${path}` });
}

/** One path parameter as a string; MSW hands them over untyped. */
export function pathParam(params: Record<string, unknown>, key: string): string {
  return String(params[key]);
}

/** Bounded paging, defaulting to the same window the real API defaults to. */
export function readPaging(request: Request): { limit: number; offset: number } {
  const url = new URL(request.url);
  return {
    limit: Number.parseInt(url.searchParams.get('limit') ?? '20', 10),
    offset: Number.parseInt(url.searchParams.get('offset') ?? '0', 10),
  };
}

/** A malformed body is an empty body; the handler validates what it needs. */
export async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
}
