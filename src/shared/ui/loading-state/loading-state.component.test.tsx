import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingState } from './loading-state.component';
import {
  LOADING_STATE_BLOCK_TEST_ID,
  LOADING_STATE_DEFAULT_TEST_ID,
} from './loading-state.constants';

function getSpinner(): Element {
  return document.body.querySelector('ion-spinner')!;
}

describe('LoadingState', () => {
  it('renders the label inside a polite status region using the default test id', () => {
    render(<LoadingState label="Loading your data" />);

    const root = screen.getByTestId(LOADING_STATE_DEFAULT_TEST_ID);
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading your data')).toBeInTheDocument();
  });

  it('renders a decorative crescent spinner', () => {
    render(<LoadingState label="Loading" />);

    expect(getSpinner()).toHaveAttribute('name', 'crescent');
    expect(getSpinner()).toHaveAttribute('aria-hidden', 'true');
  });

  it('honours a custom test id', () => {
    render(<LoadingState label="Loading" testId="custom-loading" />);

    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    expect(screen.queryByTestId(LOADING_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });

  it('exposes the requested screen composition through its variant class', () => {
    render(<LoadingState label="Loading dashboard" variant="dashboard" />);

    expect(screen.getByTestId(LOADING_STATE_DEFAULT_TEST_ID)).toHaveClass(
      'app-loading-state--dashboard',
    );
    expect(screen.getAllByTestId(LOADING_STATE_BLOCK_TEST_ID)).toHaveLength(3);
  });
});
