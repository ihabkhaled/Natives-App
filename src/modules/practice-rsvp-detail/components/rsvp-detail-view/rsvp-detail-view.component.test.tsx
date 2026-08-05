import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildRsvpDetailScreenView } from '../../../../../tests/factories/practice-rsvp-detail-view.factory';
import { RsvpDetailView } from './rsvp-detail-view.component';

describe('RsvpDetailView', () => {
  it('renders the summary and the roster when ready', () => {
    render(<RsvpDetailView {...buildRsvpDetailScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailSummary)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailRoster)).toBeInTheDocument();
  });

  it('renders the roster without a summary before the counts have loaded', () => {
    render(<RsvpDetailView {...buildRsvpDetailScreenView({ summary: null })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailSummary)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailRoster)).toBeInTheDocument();
  });

  it('shows the permission state and no roster when forbidden', () => {
    render(
      <RsvpDetailView {...buildRsvpDetailScreenView({ isForbidden: true, isLoading: true })} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailLoading)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailRoster)).not.toBeInTheDocument();
  });

  it('shows the loader while the roster and summary are still arriving', () => {
    render(<RsvpDetailView {...buildRsvpDetailScreenView({ isLoading: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailLoading)).toBeInTheDocument();
  });

  it('shows the error state once a read has failed', () => {
    render(<RsvpDetailView {...buildRsvpDetailScreenView({ hasError: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailError)).toBeInTheDocument();
  });

  it('renders the override panel when one is open', () => {
    render(
      <RsvpDetailView
        {...buildRsvpDetailScreenView({
          panel: {
            kind: 'override',
            panel: {
              membershipId: 'member-1',
              headingLabel: 'Override this member\'s RSVP',
              statusLabel: 'New response',
              statusOptions: [{ value: 'going', label: 'Going' }],
              status: 'going',
              onStatusChange: () => undefined,
              reasonLabel: 'Reason',
              reasonPlaceholder: 'Why?',
              reason: '',
              reasonValidationMessage: null,
              onReasonChange: () => undefined,
              reasonCategoryLabel: 'Category',
              reasonCategoryOptions: [],
              reasonCategory: '',
              onReasonCategoryChange: () => undefined,
              noteLabel: 'Note',
              note: '',
              onNoteChange: () => undefined,
              noteVisibilityLabel: 'Visibility',
              noteVisibilityOptions: [],
              noteVisibility: '',
              onNoteVisibilityChange: () => undefined,
              submitLabel: 'Save override',
              cancelLabel: 'Cancel',
              canSubmit: true,
              isSubmitting: false,
              onSubmit: () => undefined,
              onCancel: () => undefined,
            },
          },
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverridePanel)).toBeInTheDocument();
  });

  it('renders the history panel when one is open', () => {
    render(
      <RsvpDetailView
        {...buildRsvpDetailScreenView({
          panel: {
            kind: 'history',
            panel: {
              membershipId: 'member-1',
              headingLabel: 'RSVP history',
              isLoading: false,
              loadingLabel: 'Loading…',
              emptyLabel: 'No history recorded yet.',
              items: [],
              closeLabel: 'Close history',
              onClose: () => undefined,
            },
          },
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailHistoryPanel)).toBeInTheDocument();
  });
});
