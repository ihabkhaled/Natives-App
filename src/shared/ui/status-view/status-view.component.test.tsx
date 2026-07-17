import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusView } from './status-view.component';
import { statusIconVariants } from './status-view.variants';

function getStatusIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('statusIconVariants', () => {
  it('maps every tone to its Ionic color class', () => {
    expect(statusIconVariants({ tone: 'neutral' })).toContain('text-(--ion-color-medium)');
    expect(statusIconVariants({ tone: 'danger' })).toContain('text-(--ion-color-danger)');
    expect(statusIconVariants({ tone: 'warning' })).toContain('text-(--ion-color-warning)');
  });

  it('falls back to the neutral tone and keeps the base classes', () => {
    expect(statusIconVariants()).toBe('mb-2 text-5xl text-(--ion-color-medium)');
  });
});

describe('StatusView', () => {
  it('renders the icon, title and test id inside a status region', () => {
    render(
      <StatusView icon="icon-source" title="Nothing here" tone="neutral" testId="status-view" />,
    );

    expect(screen.getByTestId('status-view')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Nothing here');
    expect(getStatusIcon()).toHaveAttribute('icon', 'icon-source');
    expect(getStatusIcon()).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the neutral tone class to the icon', () => {
    render(<StatusView icon="icon-source" title="Neutral" tone="neutral" testId="status-view" />);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-medium)');
  });

  it('applies the danger tone class to the icon', () => {
    render(<StatusView icon="icon-source" title="Danger" tone="danger" testId="status-view" />);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-danger)');
  });

  it('applies the warning tone class to the icon', () => {
    render(<StatusView icon="icon-source" title="Warning" tone="warning" testId="status-view" />);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-warning)');
  });

  it('renders the message when one is provided', () => {
    render(
      <StatusView
        icon="icon-source"
        title="Nothing here"
        message="Try again later"
        tone="neutral"
        testId="status-view"
      />,
    );

    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('omits the message paragraph when no message is provided', () => {
    render(
      <StatusView icon="icon-source" title="Nothing here" tone="neutral" testId="status-view" />,
    );

    expect(screen.queryByText('Try again later')).not.toBeInTheDocument();
    expect(screen.getByTestId('status-view')).toHaveTextContent('Nothing here');
  });

  it('renders the action slot when one is provided', () => {
    render(
      <StatusView
        icon="icon-source"
        title="Nothing here"
        tone="neutral"
        testId="status-view"
        action={
          <button type="button" data-testid="status-action">
            Retry
          </button>
        }
      />,
    );

    expect(screen.getByTestId('status-action')).toBeInTheDocument();
  });

  it('omits the action slot when none is provided', () => {
    render(
      <StatusView icon="icon-source" title="Nothing here" tone="neutral" testId="status-view" />,
    );

    expect(screen.queryByTestId('status-action')).not.toBeInTheDocument();
  });
});
