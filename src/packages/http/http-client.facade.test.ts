import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  configureAppHttpClient,
  getAppHttpClient,
  resetAppHttpClientForTesting,
} from './http-client.facade';
import type { HttpClient } from './interfaces/http.interfaces';

function createHttpClientDouble(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    postMultipart: vi.fn(),
    download: vi.fn(),
  };
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('getAppHttpClient', () => {
  it('fails loudly when startup never wired a client', () => {
    expect(() => getAppHttpClient()).toThrow(
      'HTTP client is not configured. Call configureAppHttpClient at startup.',
    );
  });

  it('resolves the configured client', () => {
    const client = createHttpClientDouble();
    configureAppHttpClient(client);

    expect(getAppHttpClient()).toBe(client);
  });

  it('resolves the same instance on every call', () => {
    configureAppHttpClient(createHttpClientDouble());

    expect(getAppHttpClient()).toBe(getAppHttpClient());
  });
});

describe('configureAppHttpClient', () => {
  it('replaces a previously wired client', () => {
    const first = createHttpClientDouble();
    const second = createHttpClientDouble();

    configureAppHttpClient(first);
    configureAppHttpClient(second);

    expect(getAppHttpClient()).toBe(second);
  });
});

describe('resetAppHttpClientForTesting', () => {
  it('unwires the client again', () => {
    configureAppHttpClient(createHttpClientDouble());

    resetAppHttpClientForTesting();

    expect(() => getAppHttpClient()).toThrow(/not configured/u);
  });
});
