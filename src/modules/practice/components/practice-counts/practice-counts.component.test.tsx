import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { PracticeCounts } from './practice-counts.component';

describe('PracticeCounts', () => {
  it('renders a labelled row per count', () => {
    render(
      <PracticeCounts
        heading="Who is coming"
        privateLabel="Counts are private."
        counts={[
          { key: 'going', label: 'Going', countText: '12' },
          { key: 'maybe', label: 'Maybe', countText: '3' },
        ]}
      />,
    );

    const counts = screen.getByTestId(TEST_IDS.practiceCounts);
    expect(counts).toHaveTextContent('Going');
    expect(counts).toHaveTextContent('12');
    expect(screen.getByRole('row', { name: /Going/ })).toBeInTheDocument();
  });

  it('shows the privacy note when counts are not shared', () => {
    render(
      <PracticeCounts heading="Who is coming" privateLabel="Counts are private." counts={null} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceCounts)).toHaveTextContent('Counts are private.');
  });
});
