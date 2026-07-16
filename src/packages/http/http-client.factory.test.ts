import { describe, expect, it, vi } from 'vitest';

import { schemaBuilder } from '@/packages/schema';

import { buildTokenPair, createMemoryTokenStore } from '../../../tests/factories/http.factory';
import { createTestAdapter, type TestRoute } from './adapters/test.adapter';
import { HTTP_ERROR_KIND } from './constants/http-error-kind.constants';
import { HttpError } from './errors/http.errors';
import { createHttpClient } from './http-client.factory';

const echoSchema = schemaBuilder.object({ ok: schemaBuilder.boolean() });

function buildClient(routes: readonly TestRoute[], overrides: Record<string, unknown> = {}) {
  const tokenStore = createMemoryTokenStore(buildTokenPair());
  const client = createHttpClient({
    config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
    tokenStore,
    adapter: createTestAdapter(routes),
    ...overrides,
  });
  return { client, tokenStore };
}

describe('createHttpClient', () => {
  it('injects the bearer token and a correlation id', async () => {
    let seenHeaders: Record<string, unknown> = {};
    const { client } = buildClient([
      {
        method: 'GET',
        url: '/echo',
        respond: ({ headers }) => {
          seenHeaders = headers;
          return { status: 200, data: { ok: true } };
        },
      },
    ]);

    await expect(client.get('/echo', echoSchema)).resolves.toEqual({ ok: true });
    expect(seenHeaders['Authorization']).toBe('Bearer access-1');
    expect(String(seenHeaders['X-Request-Id'])).not.toBe('');
  });

  it('skips auth injection when skipAuth is set', async () => {
    let seenHeaders: Record<string, unknown> = {};
    const { client } = buildClient([
      {
        method: 'GET',
        url: '/public',
        respond: ({ headers }) => {
          seenHeaders = headers;
          return { status: 200, data: { ok: true } };
        },
      },
    ]);

    await client.get('/public', echoSchema, { skipAuth: true });
    expect(seenHeaders['Authorization']).toBeUndefined();
  });

  it('refreshes on 401 and replays the request once', async () => {
    let attempts = 0;
    const refreshExecutor = vi
      .fn()
      .mockResolvedValue(buildTokenPair({ accessToken: 'access-2', refreshToken: 'refresh-2' }));
    const { client, tokenStore } = buildClient(
      [
        {
          method: 'GET',
          url: '/secure',
          respond: ({ headers }) => {
            attempts += 1;
            if (headers['Authorization'] === 'Bearer access-2') {
              return { status: 200, data: { ok: true } };
            }
            return { status: 401, data: { statusCode: 401 } };
          },
        },
      ],
      { refreshExecutor },
    );

    await expect(client.get('/secure', echoSchema)).resolves.toEqual({ ok: true });
    expect(attempts).toBe(2);
    expect(refreshExecutor).toHaveBeenCalledTimes(1);
    expect(tokenStore.snapshot()?.accessToken).toBe('access-2');
  });

  it('signals auth failure when the replayed request is still unauthorized', async () => {
    const onAuthFailure = vi.fn();
    const refreshExecutor = vi.fn().mockResolvedValue(buildTokenPair({ accessToken: 'access-2' }));
    const { client } = buildClient(
      [
        {
          method: 'GET',
          url: '/secure',
          respond: () => ({ status: 401, data: { statusCode: 401 } }),
        },
      ],
      { refreshExecutor, onAuthFailure },
    );

    await expect(client.get('/secure', echoSchema)).rejects.toBeInstanceOf(HttpError);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('never retries when skipRetryOnUnauthorized is set', async () => {
    const refreshExecutor = vi.fn();
    const { client } = buildClient(
      [
        {
          method: 'POST',
          url: '/auth/refresh',
          respond: () => ({ status: 401, data: { statusCode: 401 } }),
        },
      ],
      { refreshExecutor },
    );

    await expect(
      client.post('/auth/refresh', {}, echoSchema, {
        skipAuth: true,
        skipRetryOnUnauthorized: true,
      }),
    ).rejects.toMatchObject({ kind: HTTP_ERROR_KIND.Unauthorized });
    expect(refreshExecutor).not.toHaveBeenCalled();
  });

  it('normalizes NestJS validation envelopes into field errors', async () => {
    const { client } = buildClient([
      {
        method: 'POST',
        url: '/things',
        respond: () => ({
          status: 400,
          data: {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: [{ field: 'email', code: 'INVALID_EMAIL', message: 'bad' }],
            requestId: 'req-9',
          },
        }),
      },
    ]);

    const failure = await client.post('/things', {}, echoSchema).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(HttpError);
    const httpError = failure as HttpError;
    expect(httpError.kind).toBe(HTTP_ERROR_KIND.Validation);
    expect(httpError.requestId).toBe('req-9');
    expect(httpError.fieldErrors).toEqual([{ field: 'email', code: 'INVALID_EMAIL' }]);
  });

  it('rejects response bodies that violate the schema contract', async () => {
    const { client } = buildClient([
      { method: 'GET', url: '/echo', respond: () => ({ status: 200, data: { ok: 'yes' } }) },
    ]);

    await expect(client.get('/echo', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.ResponseContract,
    });
  });

  it('classifies adapter timeouts and network drops', async () => {
    const { AxiosError } = await import('axios');
    const timeoutClient = createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 10 },
      tokenStore: createMemoryTokenStore(null),
      adapter: () => Promise.reject(new AxiosError('timeout exceeded', 'ECONNABORTED')),
    });
    await expect(timeoutClient.get('/slow', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Timeout,
    });

    const offlineClient = createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 10 },
      tokenStore: createMemoryTokenStore(null),
      adapter: () => Promise.reject(new AxiosError('network down', 'ERR_NETWORK')),
    });
    await expect(offlineClient.get('/down', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Network,
    });
  });

  it('logs request and failure metadata through the injected logger', async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { client } = buildClient(
      [{ method: 'GET', url: '/boom', respond: () => ({ status: 500, data: {} }) }],
      { logger },
    );

    await expect(client.get('/boom', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Server,
    });
    expect(logger.debug).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('http request failed', {
      kind: HTTP_ERROR_KIND.Server,
      status: 500,
    });
  });
});
