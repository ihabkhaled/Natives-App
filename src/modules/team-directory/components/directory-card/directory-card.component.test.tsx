import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDirectoryCardView } from '../../../../../tests/factories/team-directory-view.factory';
import { DirectoryCard } from './directory-card.component';

function renderCard(
  overrides: Parameters<typeof buildDirectoryCardView>[0] = {},
): ReturnType<typeof render> {
  return render(
    <ul>
      <DirectoryCard card={buildDirectoryCardView(overrides)} />
    </ul>,
  );
}

describe('DirectoryCard', () => {
  it('renders the person name and nickname', () => {
    renderCard();

    expect(screen.getByTestId(TEST_IDS.teamDirectoryCard)).toHaveTextContent('Sherif Ashraf');
    expect(screen.getByText('3alamy')).toBeInTheDocument();
  });

  it('omits the nickname line when the directory has none', () => {
    renderCard({ nickname: null });

    expect(screen.queryByText('3alamy')).not.toBeInTheDocument();
  });

  it('labels the jersey badge for assistive tech', () => {
    renderCard();

    expect(screen.getByLabelText('Jersey number 33')).toHaveTextContent('33');
  });

  it('omits the jersey badge when the player has no number yet', () => {
    renderCard({ jersey: null });

    expect(screen.queryByLabelText('Jersey number 33')).not.toBeInTheDocument();
  });

  it('renders every responsibility as its own chip', () => {
    renderCard({ tags: ['Analysis', 'Technical', 'Co-Coach'] });

    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Co-Coach')).toBeInTheDocument();
  });

  it('renders no chip list when there is nothing to tag', () => {
    renderCard({ tags: [] });

    expect(screen.queryByText('Coach')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(1);
  });

  it('falls back to the initials medallion when no portrait is published', () => {
    renderCard({ photoUrl: null });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryAvatarInitials)).toBeInTheDocument();
  });

  it('shows the portrait once one is published', () => {
    renderCard({ photoUrl: '/staff/3alamy.jpg' });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryAvatarPhoto)).toBeInTheDocument();
  });
});
