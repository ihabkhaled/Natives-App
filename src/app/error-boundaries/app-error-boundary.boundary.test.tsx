import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { reportError } from '@/packages/error-reporting';
import type * as PlatformModule from '@/platform';
import { reloadApplication } from '@/platform';
import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../tests/setup/i18n-test.helper';
import { AppErrorBoundary } from './app-error-boundary.boundary';

vi.mock('@/packages/error-reporting', () => ({ reportError: vi.fn() }));
vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  reloadApplication: vi.fn(),
}));

const BOOM = 'Render exploded (ECONNRESET at 10.0.0.7)';

function Exploding(): React.JSX.Element {
  throw new Error(BOOM);
}

let consoleError: MockInstance<typeof console.error>;

function renderBoundary(children: React.ReactNode): void {
  render(<AppErrorBoundary>{children}</AppErrorBoundary>);
}

function getFallbackRetryButton(): Element {
  return document.body.querySelector(
    `[data-testid="${TEST_IDS.errorBoundaryFallback}"] ion-button`,
  )!;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.clearAllMocks();
  // React logs every caught render error; silence it to keep the run readable.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('AppErrorBoundary', () => {
  it('renders its children while nothing throws', () => {
    renderBoundary(<p data-testid="app-child">Body</p>);

    expect(screen.getByTestId('app-child')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.errorBoundaryFallback)).not.toBeInTheDocument();
  });

  it('never reports anything while nothing throws', () => {
    renderBoundary(<p>Body</p>);

    expect(reportError).not.toHaveBeenCalled();
  });

  it('swaps a throwing subtree for the fallback error state', () => {
    renderBoundary(<Exploding />);

    expect(screen.getByTestId(TEST_IDS.errorBoundaryFallback)).toBeInTheDocument();
  });

  it('explains the failure in translated, user-facing copy', () => {
    renderBoundary(<Exploding />);

    const fallback = screen.getByTestId(TEST_IDS.errorBoundaryFallback);
    expect(fallback).toHaveTextContent('Something went wrong');
    expect(fallback).toHaveTextContent('Something unexpected happened. Please try again.');
    expect(fallback).toHaveTextContent('Try again');
  });

  it('never leaks the raw error to the user', () => {
    renderBoundary(<Exploding />);

    const fallback = screen.getByTestId(TEST_IDS.errorBoundaryFallback);
    expect(fallback).not.toHaveTextContent('ECONNRESET');
    expect(fallback.textContent).not.toContain(BOOM);
  });

  it('reports the failure with its component stack', () => {
    renderBoundary(<Exploding />);

    expect(reportError).toHaveBeenCalledOnce();
    const [error, context] = vi.mocked(reportError).mock.calls[0]!;
    expect((error as Error).message).toBe(BOOM);
    expect(context?.['componentStack']).toBeTypeOf('string');
  });

  it('still reports a failure that arrives without a component stack', () => {
    const boundary = new AppErrorBoundary({ children: null });
    const error = new Error(BOOM);

    boundary.componentDidCatch(error, { componentStack: null });

    expect(reportError).toHaveBeenCalledExactlyOnceWith(error, { componentStack: '' });
  });

  it('offers a full reload as the last-resort recovery', async () => {
    renderBoundary(<Exploding />);

    await userEvent.click(getFallbackRetryButton());

    expect(reloadApplication).toHaveBeenCalledOnce();
  });

  it('never reloads on its own', () => {
    renderBoundary(<Exploding />);

    expect(reloadApplication).not.toHaveBeenCalled();
  });
});
