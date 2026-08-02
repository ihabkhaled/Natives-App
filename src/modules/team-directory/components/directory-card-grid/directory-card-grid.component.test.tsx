import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDirectoryCardView } from '../../../../../tests/factories/team-directory-view.factory';
import { DirectoryCardGrid } from './directory-card-grid.component';

describe('DirectoryCardGrid', () => {
  it('renders one card per person under an accessible list name', () => {
    render(
      <DirectoryCardGrid
        ariaLabel="Active roster"
        cards={[
          buildDirectoryCardView({ id: 'a' }),
          buildDirectoryCardView({ id: 'b', displayName: 'Rawan Elessawy' }),
        ]}
        testId={TEST_IDS.teamDirectoryRoster}
      />,
    );

    expect(screen.getByRole('list', { name: 'Active roster' })).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryCard)).toHaveLength(2);
  });

  it('renders an empty, still-labelled list when there is nobody to show', () => {
    render(<DirectoryCardGrid ariaLabel="Active roster" cards={[]} />);

    expect(screen.getByRole('list', { name: 'Active roster' })).toBeEmptyDOMElement();
  });
});
