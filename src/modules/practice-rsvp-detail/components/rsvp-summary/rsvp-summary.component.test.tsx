import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { RsvpSummary } from './rsvp-summary.component';
import type { RsvpSummaryProps } from './rsvp-summary.types';

function props(overrides: Partial<RsvpSummaryProps> = {}): RsvpSummaryProps {
  return {
    headingLabel: 'Planning summary',
    goingLabel: '12 going',
    maybeLabel: '2 maybe',
    notGoingLabel: '3 not going',
    noResponseLabel: '4 have not replied',
    waitlistedLabel: '1 waitlisted',
    capacityLabel: 'Capacity 20',
    spotsRemainingLabel: '8 spots remaining',
    ...overrides,
  };
}

describe('RsvpSummary', () => {
  it('renders every count', () => {
    render(<RsvpSummary {...props()} />);

    const summary = screen.getByTestId(TEST_IDS.practiceRsvpDetailSummary);
    expect(summary).toHaveTextContent('12 going');
    expect(summary).toHaveTextContent('2 maybe');
    expect(summary).toHaveTextContent('3 not going');
    expect(summary).toHaveTextContent('4 have not replied');
    expect(summary).toHaveTextContent('1 waitlisted');
    expect(summary).toHaveTextContent('Capacity 20');
    expect(summary).toHaveTextContent('8 spots remaining');
  });
});
