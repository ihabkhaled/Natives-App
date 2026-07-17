import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as EnvironmentPackage from '@/packages/environment';
import { getEnvironment, type AppEnvironment } from '@/packages/environment';
import type * as QueryPackage from '@/packages/query';
import { useQueryClient } from '@/packages/query';

import {
  getAppQueryClient,
  resetAppQueryClientForTesting,
} from '../bootstrap/query-client.factory';
import { AppProviders } from './app-providers.provider';

vi.mock('./appearance-sync.provider', () => ({
  AppearanceSync: () => <div data-testid="appearance-sync" />,
}));

// The real devtools render nothing in jsdom, so stand in a marker instead.
vi.mock('@/packages/query', async (importOriginal) => ({
  ...(await importOriginal<typeof QueryPackage>()),
  ReactQueryDevtools: () => <div data-testid="query-devtools" />,
}));

vi.mock('@/packages/environment', async (importOriginal) => ({
  ...(await importOriginal<typeof EnvironmentPackage>()),
  getEnvironment: vi.fn(),
}));

const { getEnvironment: readRealEnvironment } =
  await vi.importActual<typeof EnvironmentPackage>('@/packages/environment');
const REAL_ENVIRONMENT = readRealEnvironment();

function mockEnvironment(overrides: Partial<AppEnvironment> = {}): void {
  vi.mocked(getEnvironment).mockReturnValue({ ...REAL_ENVIRONMENT, ...overrides });
}

function QueryClientProbe(): React.JSX.Element {
  const client = useQueryClient();
  return <div data-testid="query-client-probe">{String(client === getAppQueryClient())}</div>;
}

beforeEach(() => {
  mockEnvironment();
});

afterEach(() => {
  vi.clearAllMocks();
  resetAppQueryClientForTesting();
});

describe('AppProviders', () => {
  it('renders its children', () => {
    render(
      <AppProviders>
        <p data-testid="app-child">Body</p>
      </AppProviders>,
    );

    expect(screen.getByTestId('app-child')).toBeInTheDocument();
  });

  it('keeps document chrome in sync by mounting the appearance provider', () => {
    render(
      <AppProviders>
        <p>Body</p>
      </AppProviders>,
    );

    expect(screen.getByTestId('appearance-sync')).toBeInTheDocument();
  });

  it('serves the app-wide query client to everything it wraps', () => {
    render(
      <AppProviders>
        <QueryClientProbe />
      </AppProviders>,
    );

    expect(screen.getByTestId('query-client-probe')).toHaveTextContent('true');
  });

  it('hides the devtools under the committed test environment', () => {
    expect(REAL_ENVIRONMENT.enableQueryDevtools).toBe(false);

    render(
      <AppProviders>
        <p>Body</p>
      </AppProviders>,
    );

    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument();
  });

  it('shows the devtools when they are enabled in development', () => {
    mockEnvironment({ enableQueryDevtools: true, isDevelopment: true });

    render(
      <AppProviders>
        <p>Body</p>
      </AppProviders>,
    );

    expect(screen.getByTestId('query-devtools')).toBeInTheDocument();
  });

  it('never ships the devtools outside development, even when the flag is on', () => {
    mockEnvironment({ enableQueryDevtools: true, isDevelopment: false });

    render(
      <AppProviders>
        <p>Body</p>
      </AppProviders>,
    );

    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument();
  });

  it('keeps the devtools off in development when the flag is off', () => {
    mockEnvironment({ enableQueryDevtools: false, isDevelopment: true });

    render(
      <AppProviders>
        <p>Body</p>
      </AppProviders>,
    );

    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument();
  });
});
