import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShell } from './page-shell.component';

function getIonTitle(): Element {
  return document.body.querySelector('ion-title')!;
}

function getIonContent(): Element {
  return document.body.querySelector('ion-content')!;
}

function queryIonButtons(): Element | null {
  return document.body.querySelector('ion-buttons');
}

describe('PageShell', () => {
  it('renders the title in the toolbar title and the children in the content', () => {
    render(
      <PageShell title="Settings" testId="settings-page">
        <p data-testid="page-child">Body</p>
      </PageShell>,
    );

    expect(getIonTitle()).toHaveTextContent('Settings');
    expect(getIonContent()).toContainElement(screen.getByTestId('page-child'));
    expect(getIonContent()).toHaveClass('ion-padding');
  });

  it('puts the test id on the ion-page root that wraps the whole screen', () => {
    render(
      <PageShell title="Settings" testId="settings-page">
        <p data-testid="page-child">Body</p>
      </PageShell>,
    );

    const page = screen.getByTestId('settings-page');
    expect(page).toHaveClass('ion-page');
    expect(page).toContainElement(getIonContent() as HTMLElement);
    expect(page).toContainElement(screen.getByTestId('page-child'));
  });

  it('renders headerEnd inside end-slotted toolbar buttons when provided', () => {
    render(
      <PageShell
        title="Settings"
        testId="settings-page"
        headerEnd={
          <button type="button" data-testid="header-action">
            Save
          </button>
        }
      >
        <p>Body</p>
      </PageShell>,
    );

    expect(queryIonButtons()).toHaveAttribute('slot', 'end');
    expect(queryIonButtons()).toContainElement(screen.getByTestId('header-action'));
  });

  it('omits the toolbar buttons when no headerEnd is provided', () => {
    render(
      <PageShell title="Settings" testId="settings-page">
        <p>Body</p>
      </PageShell>,
    );

    expect(queryIonButtons()).not.toBeInTheDocument();
  });

  it('renders the banner when one is provided', () => {
    render(
      <PageShell
        title="Settings"
        testId="settings-page"
        banner={<div data-testid="page-banner">Offline</div>}
      >
        <p>Body</p>
      </PageShell>,
    );

    expect(screen.getByTestId('page-banner')).toBeInTheDocument();
  });

  it('omits the banner when none is provided', () => {
    render(
      <PageShell title="Settings" testId="settings-page">
        <p>Body</p>
      </PageShell>,
    );

    expect(screen.queryByTestId('page-banner')).not.toBeInTheDocument();
  });

  it('supports an immersive screen without a duplicate toolbar', () => {
    render(
      <PageShell title="Toolbar title" testId="welcome-page" immersive>
        <h1>Welcome</h1>
      </PageShell>,
    );

    expect(screen.queryByText('Toolbar title')).not.toBeInTheDocument();
    expect(getIonContent()).toHaveClass('app-page--immersive');
    expect(getIonContent()).not.toHaveClass('ion-padding');
  });
});
