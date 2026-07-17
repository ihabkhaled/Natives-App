import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './empty-state.component';
import { EMPTY_STATE_DEFAULT_TEST_ID, EMPTY_STATE_ICON } from './empty-state.constants';

function getStatusIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('EmptyState', () => {
  it('renders the title with the empty icon and the default test id', () => {
    render(<EmptyState title="No results" />);

    expect(screen.getByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No results');
    expect(getStatusIcon()).toHaveAttribute('icon', EMPTY_STATE_ICON);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-medium)');
  });

  it('renders the message when one is provided', () => {
    render(<EmptyState title="No results" message="Adjust your filters" />);

    expect(screen.getByText('Adjust your filters')).toBeInTheDocument();
  });

  it('renders without a message when none is provided', () => {
    render(<EmptyState title="No results" />);

    expect(screen.getByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).toHaveTextContent('No results');
    expect(screen.queryByText('Adjust your filters')).not.toBeInTheDocument();
  });

  it('honours a custom test id', () => {
    render(<EmptyState title="No results" testId="custom-empty" />);

    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    expect(screen.queryByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });
});
