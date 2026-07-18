import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { VenueInfo } from './venue-info.component';

const VENUE = {
  name: 'Zamalek Club Field',
  addressLine: '26th of July St',
  mapUrl: 'https://maps.example.com/?q=zamalek',
  directionsLabel: 'Get directions',
  notesHeading: 'Arrival notes',
  notes: 'Enter via Gate 3.',
} as const;

describe('VenueInfo', () => {
  it('renders the venue name, address, and arrival notes', () => {
    render(<VenueInfo heading="Venue" venue={VENUE} tbdLabel="TBD" onOpenMap={vi.fn()} />);

    const info = screen.getByTestId(TEST_IDS.practiceVenueInfo);
    expect(info).toHaveTextContent('Zamalek Club Field');
    expect(info).toHaveTextContent('26th of July St');
    expect(info).toHaveTextContent('Enter via Gate 3.');
  });

  it('opens directions through the caller', () => {
    const onOpenMap = vi.fn();
    render(<VenueInfo heading="Venue" venue={VENUE} tbdLabel="TBD" onOpenMap={onOpenMap} />);

    fireEvent.click(screen.getByText('Get directions'));

    expect(onOpenMap).toHaveBeenCalledWith('https://maps.example.com/?q=zamalek');
  });

  it('omits the directions button and notes when absent', () => {
    render(
      <VenueInfo
        heading="Venue"
        venue={{ ...VENUE, addressLine: null, mapUrl: null, notes: null }}
        tbdLabel="TBD"
        onOpenMap={vi.fn()}
      />,
    );

    expect(screen.queryByText('Get directions')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter via Gate 3.')).not.toBeInTheDocument();
  });

  it('shows the to-be-confirmed note when there is no venue', () => {
    render(<VenueInfo heading="Venue" venue={null} tbdLabel="Venue TBD" onOpenMap={vi.fn()} />);

    expect(screen.getByTestId(TEST_IDS.practiceVenueInfo)).toHaveTextContent('Venue TBD');
  });
});
