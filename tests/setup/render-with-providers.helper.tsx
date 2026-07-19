import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  renderHook,
  type RenderHookResult,
  type RenderResult,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  });
}

interface ProviderOptions {
  readonly queryClient?: QueryClient;
  readonly initialPath?: string;
}

function buildWrapper(options: ProviderOptions) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  return function Wrapper(props: { readonly children: ReactNode }): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[options.initialPath ?? '/']}>{props.children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

/** Render UI with query + router providers (i18n must be initialized by the test). */
export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}): RenderResult {
  return render(ui, { wrapper: buildWrapper(options) });
}

/** Render a hook with query + router providers. */
export function renderHookWithProviders<Result>(
  callback: () => Result,
  options: ProviderOptions = {},
): RenderHookResult<Result, unknown> {
  return renderHook(callback, { wrapper: buildWrapper(options) });
}

/**
 * Render a hook with providers, then run one synchronous interaction against its
 * current value inside `act()`. Keeps the arrange+act ceremony in a single place
 * so mutation-hook tests stay assertion-only.
 */
export function actOnHook<Result>(
  callback: () => Result,
  interact: (api: Result) => void,
  options: ProviderOptions = {},
): RenderHookResult<Result, unknown> {
  const rendered = renderHookWithProviders(callback, options);
  act(() => {
    interact(rendered.result.current);
  });
  return rendered;
}
