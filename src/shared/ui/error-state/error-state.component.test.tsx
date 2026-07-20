import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorState } from './error-state.component';
import { ERROR_STATE_DEFAULT_TEST_ID, ERROR_STATE_ICON } from './error-state.constants';

function getStatusIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('ErrorState', () => {
  it('renders the title with the warning icon in the danger tone and the default test id', () => {
    render(<ErrorState title="Something broke" />);

    expect(screen.getByTestId(ERROR_STATE_DEFAULT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Something broke');
    expect(getStatusIcon()).toHaveAttribute('icon', ERROR_STATE_ICON);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-danger)');
  });

  it('renders the message when one is provided', () => {
    render(<ErrorState title="Something broke" message="The request timed out" />);

    expect(screen.getByText('The request timed out')).toBeInTheDocument();
  });

  it('renders without a message when none is provided', () => {
    render(<ErrorState title="Something broke" />);

    expect(screen.queryByText('The request timed out')).not.toBeInTheDocument();
  });

  it('honours a custom test id', () => {
    render(<ErrorState title="Something broke" testId="custom-error" />);

    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.queryByTestId(ERROR_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });

  it('renders the retry button and forwards clicks when both retryLabel and onRetry are provided', async () => {
    const onRetry = vi.fn();
    render(<ErrorState title="Something broke" retryLabel="Try again" onRetry={onRetry} />);

    const retry = screen.getByText('Try again');
    await userEvent.click(retry);

    expect(retry).toHaveAttribute('color', 'secondary');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when only retryLabel is provided', () => {
    render(<ErrorState title="Something broke" retryLabel="Try again" />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('omits the retry button when only onRetry is provided', () => {
    render(<ErrorState title="Something broke" onRetry={vi.fn()} />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
    expect(screen.getByTestId(ERROR_STATE_DEFAULT_TEST_ID)).toHaveTextContent('Something broke');
  });

  it('omits the retry button when neither retryLabel nor onRetry are provided', () => {
    render(<ErrorState title="Something broke" />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });
});
