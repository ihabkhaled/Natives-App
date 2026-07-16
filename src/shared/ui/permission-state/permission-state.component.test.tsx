import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PermissionState } from './permission-state.component';
import {
  PERMISSION_STATE_DEFAULT_TEST_ID,
  PERMISSION_STATE_ICON,
} from './permission-state.constants';

function getStatusIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('PermissionState', () => {
  it('renders the title with the lock icon in the warning tone and the default test id', () => {
    render(<PermissionState title="Access denied" />);

    expect(screen.getByTestId(PERMISSION_STATE_DEFAULT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Access denied');
    expect(getStatusIcon()).toHaveAttribute('icon', PERMISSION_STATE_ICON);
    expect(getStatusIcon()).toHaveClass('text-(--ion-color-warning)');
  });

  it('renders the message when one is provided', () => {
    render(<PermissionState title="Access denied" message="Ask an administrator" />);

    expect(screen.getByText('Ask an administrator')).toBeInTheDocument();
  });

  it('renders without a message when none is provided', () => {
    render(<PermissionState title="Access denied" />);

    expect(screen.getByTestId(PERMISSION_STATE_DEFAULT_TEST_ID)).toHaveTextContent('Access denied');
    expect(screen.queryByText('Ask an administrator')).not.toBeInTheDocument();
  });

  it('honours a custom test id', () => {
    render(<PermissionState title="Access denied" testId="custom-permission" />);

    expect(screen.getByTestId('custom-permission')).toBeInTheDocument();
    expect(screen.queryByTestId(PERMISSION_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });
});
