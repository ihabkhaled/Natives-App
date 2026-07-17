import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { WorkbenchStates } from './workbench-states.component';
import { WORKBENCH_STATES_TEST_ID } from './workbench-states.constants';
import type { WorkbenchStatesProps } from './workbench-states.types';

function buildProps(overrides: Partial<WorkbenchStatesProps> = {}): WorkbenchStatesProps {
  return {
    heading: 'States',
    loadingLabel: 'Loading…',
    emptyTitle: 'Nothing here yet',
    emptyMessage: 'There is no content to show right now.',
    errorTitle: 'Something went wrong',
    retryLabel: 'Try again',
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    permissionTitle: 'Permission needed',
    permissionMessage: 'Grant the required permission to use this feature.',
    onRetryDemo: vi.fn(),
    ...overrides,
  };
}

function renderStates(props: WorkbenchStatesProps = buildProps()): void {
  render(<WorkbenchStates {...props} />);
}

function getErrorStateRetryButton(): Element {
  return document.body.querySelector(`[data-testid="${TEST_IDS.errorState}"] ion-button`)!;
}

describe('WorkbenchStates', () => {
  it('renders the section heading under its test id', () => {
    renderStates();

    expect(screen.getByTestId(WORKBENCH_STATES_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'States' })).toBeInTheDocument();
  });

  it('shows every shared state component side by side', () => {
    renderStates();

    expect(screen.getByTestId(TEST_IDS.loadingState)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.emptyState)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.errorState)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.offlineState)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.permissionState)).toBeInTheDocument();
  });

  it('passes the loading label through', () => {
    renderStates();

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
  });

  it('passes the empty title and message through', () => {
    renderStates();

    const empty = screen.getByTestId(TEST_IDS.emptyState);
    expect(empty).toHaveTextContent('Nothing here yet');
    expect(empty).toHaveTextContent('There is no content to show right now.');
  });

  it('passes the offline title and message through', () => {
    renderStates();

    const offline = screen.getByTestId(TEST_IDS.offlineState);
    expect(offline).toHaveTextContent('You are offline');
    expect(offline).toHaveTextContent('Reconnect to load the latest data.');
  });

  it('passes the permission title and message through', () => {
    renderStates();

    const permission = screen.getByTestId(TEST_IDS.permissionState);
    expect(permission).toHaveTextContent('Permission needed');
    expect(permission).toHaveTextContent('Grant the required permission to use this feature.');
  });

  it('offers a retry action on the error state', () => {
    renderStates();

    const error = screen.getByTestId(TEST_IDS.errorState);
    expect(error).toHaveTextContent('Something went wrong');
    expect(error).toHaveTextContent('Try again');
  });

  it('runs the retry demo when the error state is retried', async () => {
    const props = buildProps();
    renderStates(props);

    await userEvent.click(getErrorStateRetryButton());

    expect(props.onRetryDemo).toHaveBeenCalledOnce();
  });
});
