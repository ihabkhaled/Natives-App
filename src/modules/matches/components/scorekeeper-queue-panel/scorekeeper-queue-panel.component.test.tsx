import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { ScorekeeperQueuePanel } from './scorekeeper-queue-panel.component';
import type { QueuePanelView } from '../../types/matches-view.types';

function view(overrides: Partial<QueuePanelView> = {}): QueuePanelView {
  return {
    heading: 'Sync',
    intro: 'Every action is either synced or waiting.',
    badgeLabel: 'Synced',
    badgeTone: 'success',
    rows: [],
    syncedTitle: 'Everything is synced',
    syncedMessage: 'No action is waiting.',
    retryLabel: 'Retry failed actions',
    hasFailed: false,
    onRetryFailed: vi.fn(),
    limitTitle: null,
    limitMessage: null,
    foreignTitle: null,
    foreignMessage: null,
    conflictHeading: 'Conflicts need your decision',
    conflictIntro: 'The server already holds a different result.',
    conflictNote: 'Nothing was merged.',
    conflicts: [],
    ...overrides,
  };
}

describe('ScorekeeperQueuePanel', () => {
  it('says everything is synced when nothing is waiting', () => {
    render(<ScorekeeperQueuePanel view={view()} />);

    expect(screen.getByText('Everything is synced')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.scorekeeperQueueRetry)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.scorekeeperQueueLimit)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.scorekeeperConflict)).not.toBeInTheDocument();
  });

  it('lists queued rows instead of the synced state', () => {
    render(
      <ScorekeeperQueuePanel
        view={view({
          rows: [
            {
              key: 'op-1',
              label: 'Point for us',
              value: 'Waiting',
              detail: 'Taken at version 14',
              tone: 'secondary',
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.scorekeeperQueueRow)).toHaveLength(1);
    expect(screen.queryByText('Everything is synced')).not.toBeInTheDocument();
  });

  it('offers a retry only once something has failed', () => {
    const onRetryFailed = vi.fn();
    render(<ScorekeeperQueuePanel view={view({ hasFailed: true, onRetryFailed })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.scorekeeperQueueRetry));

    expect(onRetryFailed).toHaveBeenCalledTimes(1);
  });

  it('shows the at-limit blocker with recovery guidance', () => {
    render(
      <ScorekeeperQueuePanel
        view={view({
          limitTitle: 'The offline queue is full',
          limitMessage: 'Scoring is blocked so nothing is dropped.',
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.scorekeeperQueueLimit)).toHaveTextContent(
      'Scoring is blocked so nothing is dropped.',
    );
  });

  it('warns that queued work belongs to another account', () => {
    render(
      <ScorekeeperQueuePanel
        view={view({
          foreignTitle: 'Queued actions belong to another account',
          foreignMessage: 'Sign back in as that scorekeeper.',
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.scorekeeperQueueOtherAccount)).toHaveTextContent(
      'Sign back in as that scorekeeper.',
    );
  });

  it('offers a discard and a reload for a conflict, and no merge', () => {
    const onDiscard = vi.fn();
    const onReload = vi.fn();
    render(
      <ScorekeeperQueuePanel
        view={view({
          conflicts: [
            {
              key: 'op-1',
              label: 'op-1',
              queuedLabel: 'Queued here',
              queuedValue: 'us',
              serverLabel: 'Server holds',
              serverValue: '9-7',
              discardLabel: 'Discard the queued action',
              reloadLabel: 'Reload the server score',
              onDiscard,
              onReload,
            },
          ],
        })}
      />,
    );

    // Two competing records side by side, with a discard and a reload only:
    // there is deliberately no merge control anywhere on the row.
    expect(screen.getAllByTestId(TEST_IDS.scorekeeperConflictRow)).toHaveLength(1);
    expect(screen.getAllByTestId(TEST_IDS.scorekeeperConflictDiscard)).toHaveLength(1);
    expect(screen.getAllByTestId(TEST_IDS.scorekeeperConflictReload)).toHaveLength(1);
    expect(screen.getByText('9-7')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(TEST_IDS.scorekeeperConflictDiscard));
    fireEvent.click(screen.getByTestId(TEST_IDS.scorekeeperConflictReload));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
