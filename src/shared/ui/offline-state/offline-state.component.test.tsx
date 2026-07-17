import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OfflineState } from './offline-state.component';
import { OFFLINE_STATE_DEFAULT_TEST_ID, OFFLINE_STATE_ICON } from './offline-state.constants';

function getStatusIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('OfflineState', () => {
  it('renders the title with the offline icon in the warning tone and the default test id', () => {
    render(<OfflineState title="You are offline" />);

    expect(screen.getByTestId(OFFLINE_STATE_DEFAULT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('You are offline');
    expect(getStatusIcon()).toHaveAttribute('icon', OFFLINE_STATE_ICON);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-warning)');
  });

  it('renders the message when one is provided', () => {
    render(<OfflineState title="You are offline" message="Reconnect to continue" />);

    expect(screen.getByText('Reconnect to continue')).toBeInTheDocument();
  });

  it('renders without a message when none is provided', () => {
    render(<OfflineState title="You are offline" />);

    expect(screen.getByTestId(OFFLINE_STATE_DEFAULT_TEST_ID)).toHaveTextContent('You are offline');
    expect(screen.queryByText('Reconnect to continue')).not.toBeInTheDocument();
  });

  it('honours a custom test id', () => {
    render(<OfflineState title="You are offline" testId="custom-offline" />);

    expect(screen.getByTestId('custom-offline')).toBeInTheDocument();
    expect(screen.queryByTestId(OFFLINE_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });
});
