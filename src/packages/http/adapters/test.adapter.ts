import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';

export interface TestRouteResponse {
  readonly status: number;
  readonly data: unknown;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface TestRoute {
  readonly method: string;
  readonly url: string;
  readonly respond: (config: {
    readonly data?: unknown;
    readonly headers: Record<string, unknown>;
  }) => TestRouteResponse;
}

/**
 * Deterministic Axios adapter for unit tests: no sockets, no MSW, no jsdom.
 * Unmatched requests return 404 with an empty body.
 */
export function createTestAdapter(routes: readonly TestRoute[]): AxiosAdapter {
  return (config) => {
    const method = (config.method ?? 'get').toUpperCase();
    const url = config.url ?? '';
    const route = routes.find(
      (candidate) => candidate.method.toUpperCase() === method && candidate.url === url,
    );
    const outcome: TestRouteResponse =
      route === undefined
        ? { status: 404, data: null }
        : route.respond({
            data: config.data === undefined ? undefined : JSON.parse(String(config.data)),
            headers: AxiosHeaders.from(config.headers).toJSON(),
          });
    const response: AxiosResponse = {
      status: outcome.status,
      statusText: String(outcome.status),
      data: outcome.data,
      headers: outcome.headers ?? {},
      config,
    };
    if (outcome.status >= 200 && outcome.status < 300) {
      return Promise.resolve(response);
    }
    return Promise.reject(
      new AxiosError(
        `Request failed with status code ${String(outcome.status)}`,
        String(outcome.status),
        config,
        null,
        response,
      ),
    );
  };
}
