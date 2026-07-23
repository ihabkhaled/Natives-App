import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { SettingHistoryEntryView } from '../../types/admin-view.types';
import { SettingHistory } from './setting-history.component';

function makeEntry(overrides: Partial<SettingHistoryEntryView>): SettingHistoryEntryView {
  return {
    id: 'sv-1',
    effectiveLabel: '1 September 2026 12:00 PM',
    stateLabel: 'Scheduled',
    stateTone: 'tertiary',
    actorLabel: 'By user-admin-1',
    noteLabel: 'Note: seasonal rework',
    summary: '3 tiers up to 500 pts',
    diffRows: [],
    diffEmptyLabel: null,
    notComparableLabel: null,
    legacy: null,
    cancelLabel: null,
    onCancel: null,
    isCancelling: false,
    ...overrides,
  };
}

describe('SettingHistory', () => {
  it('names an empty history instead of a blank panel', () => {
    render(
      <SettingHistory
        history={{ entries: [], emptyLabel: 'No versions yet' }}
        ariaLabel="History"
      />,
    );

    expect(screen.getByText('No versions yet')).toBeInTheDocument();
  });

  it('renders state chips, actor, reason, and readable summaries', () => {
    render(
      <SettingHistory
        history={{ entries: [makeEntry({})], emptyLabel: 'never' }}
        ariaLabel="History"
      />,
    );

    const entry = screen.getByTestId('admin-history-entry');
    expect(entry).toHaveTextContent('Scheduled');
    expect(entry).toHaveTextContent('By user-admin-1');
    expect(entry).toHaveTextContent('3 tiers up to 500 pts');
  });

  it('renders diff rows with verb chips and before/after values', () => {
    render(
      <SettingHistory
        history={{
          entries: [
            makeEntry({
              diffRows: [
                {
                  key: 'changed-gold',
                  kindLabel: 'Changed',
                  tone: 'warning',
                  label: 'gold · threshold',
                  beforeLabel: '500',
                  afterLabel: '750',
                },
                {
                  key: 'added-platinum',
                  kindLabel: 'Added',
                  tone: 'success',
                  label: 'platinum',
                  beforeLabel: null,
                  afterLabel: 'platinum',
                },
              ],
            }),
          ],
          emptyLabel: 'never',
        }}
        ariaLabel="History"
      />,
    );

    const rows = screen.getAllByTestId('admin-history-diff-row');
    expect(rows[0]).toHaveTextContent('gold · threshold');
    expect(rows[0]).toHaveTextContent('500');
    expect(rows[0]).toHaveTextContent('750');
    expect(rows[1]).toHaveTextContent('Added');
  });

  it('says "no effective change" and "not comparable" where they apply', () => {
    render(
      <SettingHistory
        history={{
          entries: [
            makeEntry({ id: 'sv-a', diffEmptyLabel: 'No effective change.' }),
            makeEntry({ id: 'sv-b', notComparableLabel: 'Not comparable.', summary: null }),
          ],
          emptyLabel: 'never',
        }}
        ariaLabel="History"
      />,
    );

    expect(screen.getByText('No effective change.')).toBeInTheDocument();
    expect(screen.getByText('Not comparable.')).toBeInTheDocument();
  });

  it('discloses a legacy document read-only and offers the replace flow', async () => {
    const onReplace = vi.fn();
    render(
      <SettingHistory
        history={{
          entries: [
            makeEntry({
              summary: null,
              legacy: {
                notice: 'Stored before validation existed.',
                disclosureLabel: 'Show stored document',
                rawJson: '{\n  "logo": "default"\n}',
                replaceLabel: 'Replace with a valid configuration',
                onReplace,
              },
            }),
          ],
          emptyLabel: 'never',
        }}
        ariaLabel="History"
      />,
    );

    expect(screen.getByTestId('admin-history-legacy-raw')).toHaveTextContent('"logo"');
    await userEvent.click(screen.getByTestId('admin-history-replace'));
    expect(onReplace).toHaveBeenCalledTimes(1);
  });

  it('keeps the legacy disclosure without the replace CTA for a reader', () => {
    render(
      <SettingHistory
        history={{
          entries: [
            makeEntry({
              legacy: {
                notice: 'Stored before validation existed.',
                disclosureLabel: 'Show stored document',
                rawJson: '{}',
                replaceLabel: null,
                onReplace: null,
              },
            }),
          ],
          emptyLabel: 'never',
        }}
        ariaLabel="History"
      />,
    );

    expect(screen.getByTestId('admin-history-legacy-toggle')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-history-replace')).not.toBeInTheDocument();
  });

  it('offers cancel only when the entry carries it', async () => {
    const onCancel = vi.fn();
    render(
      <SettingHistory
        history={{
          entries: [makeEntry({ cancelLabel: 'Cancel this scheduled change', onCancel })],
          emptyLabel: 'never',
        }}
        ariaLabel="History"
      />,
    );

    await userEvent.click(screen.getByTestId('admin-history-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
