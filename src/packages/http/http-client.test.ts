import { CanceledError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { schemaBuilder } from '@/packages/schema';

import { buildTokenPair, createMemoryTokenStore } from '../../../tests/factories/http.factory';
import { createTestAdapter, type TestRoute } from './adapters/test.adapter';
import { HTTP_ERROR_KIND } from './constants/http-error-kind.constants';
import { createHttpClient } from './http-client.factory';
import type { HttpClient } from './interfaces/http.interfaces';

const echoSchema = schemaBuilder.object({ ok: schemaBuilder.boolean() });

interface RecordedRequest {
  config?: InternalAxiosRequestConfig;
}

function clientWith(adapter: AxiosAdapter): HttpClient {
  return createHttpClient({
    config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
    tokenStore: createMemoryTokenStore(buildTokenPair()),
    adapter,
  });
}

function clientFor(routes: readonly TestRoute[]): HttpClient {
  return clientWith(createTestAdapter(routes));
}

/** Captures the outgoing config and replies with a canned body. */
function recordingAdapter(data: unknown): { adapter: AxiosAdapter; recorded: RecordedRequest } {
  const recorded: RecordedRequest = {};
  const adapter: AxiosAdapter = (config) => {
    recorded.config = config;
    return Promise.resolve({ status: 200, statusText: 'OK', data, headers: {}, config });
  };
  return { adapter, recorded };
}

const OK_ROUTE_RESPONSE = { status: 200, data: { ok: true } };

describe('AxiosHttpClient', () => {
  it('gets and validates a body against the schema', async () => {
    const client = clientFor([{ method: 'GET', url: '/things', respond: () => OK_ROUTE_RESPONSE }]);

    await expect(client.get('/things', echoSchema)).resolves.toEqual({ ok: true });
  });

  it('posts a json body and validates the reply', async () => {
    let received: unknown;
    const client = clientFor([
      {
        method: 'POST',
        url: '/things',
        respond: ({ data }) => {
          received = data;
          return OK_ROUTE_RESPONSE;
        },
      },
    ]);

    await expect(client.post('/things', { name: 'Sam' }, echoSchema)).resolves.toEqual({
      ok: true,
    });
    expect(received).toEqual({ name: 'Sam' });
  });

  it('puts a json body and validates the reply', async () => {
    let received: unknown;
    const client = clientFor([
      {
        method: 'PUT',
        url: '/things/1',
        respond: ({ data }) => {
          received = data;
          return OK_ROUTE_RESPONSE;
        },
      },
    ]);

    await expect(client.put('/things/1', { name: 'Sam' }, echoSchema)).resolves.toEqual({
      ok: true,
    });
    expect(received).toEqual({ name: 'Sam' });
  });

  it('patches a json body and validates the reply', async () => {
    let received: unknown;
    const client = clientFor([
      {
        method: 'PATCH',
        url: '/things/1',
        respond: ({ data }) => {
          received = data;
          return OK_ROUTE_RESPONSE;
        },
      },
    ]);

    await expect(client.patch('/things/1', { name: 'Sam' }, echoSchema)).resolves.toEqual({
      ok: true,
    });
    expect(received).toEqual({ name: 'Sam' });
  });

  it('deletes without demanding a response body', async () => {
    let calls = 0;
    const client = clientFor([
      {
        method: 'DELETE',
        url: '/things/1',
        respond: () => {
          calls += 1;
          return { status: 204, data: null };
        },
      },
    ]);

    await expect(client.delete('/things/1')).resolves.toBeUndefined();
    expect(calls).toBe(1);
  });

  it('posts multipart form data without json-encoding it', async () => {
    const { adapter, recorded } = recordingAdapter({ ok: true });
    const form = new FormData();
    form.append('file', new Blob(['hi'], { type: 'text/plain' }), 'note.txt');

    await expect(clientWith(adapter).postMultipart('/uploads', form, echoSchema)).resolves.toEqual({
      ok: true,
    });
    expect(recorded.config?.method).toBe('post');
    expect(recorded.config?.data).toBe(form);
  });

  it('downloads a blob without schema validation', async () => {
    const { adapter, recorded } = recordingAdapter(new Blob(['report'], { type: 'text/csv' }));

    const blob = await clientWith(adapter).download('/reports/1.csv');

    expect(recorded.config?.responseType).toBe('blob');
    await expect(blob.text()).resolves.toBe('report');
  });

  it('forwards request options onto the outgoing config', async () => {
    const { adapter, recorded } = recordingAdapter({ ok: true });

    await clientWith(adapter).get('/things', echoSchema, {
      params: { page: 2 },
      headers: { 'X-Trace': 'trace-1' },
      timeoutMs: 250,
    });

    expect(recorded.config?.params).toEqual({ page: 2 });
    expect(recorded.config?.headers.get('X-Trace')).toBe('trace-1');
    expect(recorded.config?.timeout).toBe(250);
  });

  it('rejects a body that violates the response contract', async () => {
    const client = clientFor([
      { method: 'GET', url: '/things', respond: () => ({ status: 200, data: { ok: 'yes' } }) },
    ]);

    await expect(client.get('/things', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.ResponseContract,
    });
  });

  it('maps an unmatched route onto a not-found error', async () => {
    const client = clientFor([]);

    await expect(client.get('/missing', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.NotFound,
      status: 404,
    });
  });
});

describe('the client error pipeline', () => {
  it('reports a cancelled request without logging it as a failure', async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: () => Promise.reject(new CanceledError()),
      logger,
    });

    await expect(client.get('/things', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Cancelled,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('surfaces the 401 without a replay when the refresh itself fails', async () => {
    let attempts = 0;
    const refreshExecutor = vi.fn().mockRejectedValue(new Error('refresh rejected'));
    const onAuthFailure = vi.fn();
    const client = createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter([
        {
          method: 'GET',
          url: '/secure',
          respond: () => {
            attempts += 1;
            return { status: 401, data: { statusCode: 401 } };
          },
        },
      ]),
      refreshExecutor,
      onAuthFailure,
    });

    await expect(client.get('/secure', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Unauthorized,
    });
    expect(attempts).toBe(1);
    expect(refreshExecutor).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('leaves a 401 alone when no refresh executor is wired', async () => {
    const client = clientFor([
      {
        method: 'GET',
        url: '/secure',
        respond: () => ({ status: 401, data: { statusCode: 401 } }),
      },
    ]);

    await expect(client.get('/secure', echoSchema)).rejects.toMatchObject({
      kind: HTTP_ERROR_KIND.Unauthorized,
    });
  });
});
