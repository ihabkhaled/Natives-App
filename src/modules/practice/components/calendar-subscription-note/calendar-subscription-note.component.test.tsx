import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { CalendarSubscriptionNote } from './calendar-subscription-note.component';

describe('CalendarSubscriptionNote', () => {
  it('renders the heading and privacy-safe guidance', () => {
    render(
      <CalendarSubscriptionNote
        heading="Add to your calendar"
        body="Private notes are never included."
        testId={TEST_IDS.practiceSubscriptionNote}
      />,
    );

    const note = screen.getByTestId(TEST_IDS.practiceSubscriptionNote);
    expect(note).toHaveAttribute('aria-label', 'Add to your calendar');
    expect(note).toHaveTextContent('Private notes are never included.');
  });
});
