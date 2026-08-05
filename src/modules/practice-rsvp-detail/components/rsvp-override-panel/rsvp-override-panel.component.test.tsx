import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { RsvpOverridePanel } from './rsvp-override-panel.component';
import type { RsvpOverridePanelProps } from './rsvp-override-panel.types';

function props(overrides: Partial<RsvpOverridePanelProps> = {}): RsvpOverridePanelProps {
  return {
    membershipId: 'member-1',
    headingLabel: "Override this member's RSVP",
    statusLabel: 'New response',
    statusOptions: [
      { value: 'going', label: 'Going' },
      { value: 'not_going', label: 'Not going' },
    ],
    status: 'going',
    onStatusChange: vi.fn(),
    reasonLabel: 'Reason for the override',
    reasonPlaceholder: 'Why are you changing this on their behalf?',
    reason: '',
    reasonValidationMessage: null,
    onReasonChange: vi.fn(),
    reasonCategoryLabel: 'Reason category (optional)',
    reasonCategoryOptions: [{ value: '', label: 'No category' }],
    reasonCategory: '',
    onReasonCategoryChange: vi.fn(),
    noteLabel: 'Note (optional)',
    note: '',
    onNoteChange: vi.fn(),
    noteVisibilityLabel: 'Who can see the note',
    noteVisibilityOptions: [{ value: '', label: 'Not shared' }],
    noteVisibility: '',
    onNoteVisibilityChange: vi.fn(),
    submitLabel: 'Save override',
    cancelLabel: 'Cancel',
    canSubmit: true,
    isSubmitting: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('RsvpOverridePanel', () => {
  it('renders the panel for the open member', () => {
    render(<RsvpOverridePanel {...props()} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverridePanel)).toBeInTheDocument();
  });

  it('runs onSubmit and onCancel from their own buttons', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<RsvpOverridePanel {...props({ onSubmit, onCancel })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideSubmit));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideCancel));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables submit until the draft is fit to send', () => {
    render(<RsvpOverridePanel {...props({ canSubmit: false })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideSubmit)).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('shows the reason validation message when the reason is too long', () => {
    render(
      <RsvpOverridePanel {...props({ reasonValidationMessage: 'Keep the reason under 512 characters.' })} />,
    );

    expect(screen.getByText('Keep the reason under 512 characters.')).toBeInTheDocument();
  });
});
