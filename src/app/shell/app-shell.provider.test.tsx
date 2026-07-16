import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { AppShell } from './app-shell.provider';

vi.mock('../router/app-router.routes', () => ({
  AppRouter: () => <div data-testid="app-router" />,
}));

vi.mock('../providers/app-providers.provider', () => ({
  AppProviders: (props: { readonly children: React.ReactNode }) => (
    <div data-testid="app-providers">{props.children}</div>
  ),
}));

vi.mock('./offline-banner/offline-banner.container', () => ({
  OfflineBannerContainer: () => <div data-testid="offline-banner" />,
}));

function queryIonApp(): Element | null {
  return document.body.querySelector('ion-app');
}

describe('AppShell', () => {
  it('renders the shell root', () => {
    render(<AppShell />);

    expect(screen.getByTestId(TEST_IDS.appShell)).toBeInTheDocument();
  });

  it('composes the providers, the offline banner, and the router', () => {
    render(<AppShell />);

    expect(screen.getByTestId('app-providers')).toBeInTheDocument();
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByTestId('app-router')).toBeInTheDocument();
  });

  it('wraps the whole shell in the providers', () => {
    render(<AppShell />);

    expect(screen.getByTestId('app-providers')).toContainElement(
      screen.getByTestId(TEST_IDS.appShell),
    );
  });

  it('frames the shell inside the single ion-app root', () => {
    render(<AppShell />);

    expect(queryIonApp()).toContainElement(screen.getByTestId(TEST_IDS.appShell));
  });

  it('shows the offline banner above the router', () => {
    render(<AppShell />);

    const shell = screen.getByTestId(TEST_IDS.appShell);
    const position = screen
      .getByTestId('offline-banner')
      .compareDocumentPosition(screen.getByTestId('app-router'));

    expect(shell).toContainElement(screen.getByTestId('offline-banner'));
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
