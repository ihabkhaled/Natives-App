import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { SessionAgenda } from './session-agenda.component';

describe('SessionAgenda', () => {
  it('lists agenda items with their durations', () => {
    render(
      <SessionAgenda
        heading="Agenda preview"
        emptyLabel="No agenda yet."
        items={[
          { id: 'a1', label: 'Warm-up', durationLabel: '15 min' },
          { id: 'a2', label: 'Scrimmage', durationLabel: null },
        ]}
      />,
    );

    const agenda = screen.getByTestId(TEST_IDS.practiceSessionAgenda);
    expect(agenda).toHaveTextContent('Warm-up');
    expect(agenda).toHaveTextContent('15 min');
    expect(agenda).toHaveTextContent('Scrimmage');
  });

  it('shows an empty note when no agenda is shared', () => {
    render(<SessionAgenda heading="Agenda preview" emptyLabel="No agenda yet." items={[]} />);

    expect(screen.getByTestId(TEST_IDS.practiceSessionAgenda)).toHaveTextContent('No agenda yet.');
  });
});
