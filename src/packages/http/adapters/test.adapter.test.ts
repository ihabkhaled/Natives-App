import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import { createTestAdapter } from './test.adapter';

function buildConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {},
): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders(), ...overrides };
}

describe('createTestAdapter', () => {
  it('resolves a matching route', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/things', respond: () => ({ status: 200, data: { ok: true } }) },
    ]);

    const response = await adapter(buildConfig({ method: 'GET', url: '/things' }));

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: true });
    expect(response.statusText).toBe('200');
  });

  it('matches the method case-insensitively', async () => {
    const adapter = createTestAdapter([
      { method: 'get', url: '/things', respond: () => ({ status: 200, data: null }) },
    ]);

    await expect(adapter(buildConfig({ method: 'GET', url: '/things' }))).resolves.toMatchObject({
      status: 200,
    });
  });

  it('defaults a config without a method to GET', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/things', respond: () => ({ status: 200, data: { ok: true } }) },
    ]);

    await expect(adapter(buildConfig({ url: '/things' }))).resolves.toMatchObject({ status: 200 });
  });

  it('defaults a config without a url to the empty path', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '', respond: () => ({ status: 200, data: { ok: true } }) },
    ]);

    await expect(adapter(buildConfig())).resolves.toMatchObject({
      status: 200,
      data: { ok: true },
    });
  });

  it('hands the parsed body and headers to the route', async () => {
    let seen: { data?: unknown; headers?: Record<string, unknown> } = {};
    const adapter = createTestAdapter([
      {
        method: 'POST',
        url: '/things',
        respond: (config) => {
          seen = config;
          return { status: 201, data: null };
        },
      },
    ]);

    await adapter(
      buildConfig({
        method: 'POST',
        url: '/things',
        data: JSON.stringify({ name: 'Sam' }),
        headers: new AxiosHeaders({ 'X-Trace': 'trace-1' }),
      }),
    );

    expect(seen.data).toEqual({ name: 'Sam' });
    expect(seen.headers?.['X-Trace']).toBe('trace-1');
  });

  it('reports an undefined body as undefined rather than parsing it', async () => {
    let seen: unknown = 'untouched';
    const adapter = createTestAdapter([
      {
        method: 'GET',
        url: '/things',
        respond: ({ data }) => {
          seen = data;
          return { status: 200, data: null };
        },
      },
    ]);

    await adapter(buildConfig({ method: 'GET', url: '/things' }));

    expect(seen).toBeUndefined();
  });

  it('forwards the route response headers', async () => {
    const adapter = createTestAdapter([
      {
        method: 'GET',
        url: '/things',
        respond: () => ({ status: 200, data: null, headers: { 'X-Total': '2' } }),
      },
    ]);

    await expect(adapter(buildConfig({ method: 'GET', url: '/things' }))).resolves.toMatchObject({
      headers: { 'X-Total': '2' },
    });
  });

  it('rejects an unmatched route with a 404', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/things', respond: () => ({ status: 200, data: null }) },
    ]);

    const failure = await adapter(buildConfig({ method: 'GET', url: '/elsewhere' })).catch(
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(AxiosError);
    expect((failure as AxiosError).response?.status).toBe(404);
  });

  it('rejects a route that answers with a failure status', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/boom', respond: () => ({ status: 500, data: { statusCode: 500 } }) },
    ]);

    const failure = await adapter(buildConfig({ method: 'GET', url: '/boom' })).catch(
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(AxiosError);
    expect((failure as AxiosError).message).toBe('Request failed with status code 500');
    expect((failure as AxiosError).response?.data).toEqual({ statusCode: 500 });
  });

  it('resolves the whole 2xx range', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/created', respond: () => ({ status: 299, data: null }) },
    ]);

    await expect(adapter(buildConfig({ method: 'GET', url: '/created' }))).resolves.toMatchObject({
      status: 299,
    });
  });

  it('rejects a redirect status', async () => {
    const adapter = createTestAdapter([
      { method: 'GET', url: '/moved', respond: () => ({ status: 302, data: null }) },
    ]);

    await expect(adapter(buildConfig({ method: 'GET', url: '/moved' }))).rejects.toBeInstanceOf(
      AxiosError,
    );
  });
});
