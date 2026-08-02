import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { PersonAvatar } from './person-avatar.component';

const BASE = {
  displayName: 'Rawan Elessawy',
  portraitAlt: 'Portrait of Rawan Elessawy',
  avatarLabel: 'Rawan Elessawy',
};

describe('PersonAvatar', () => {
  it('renders the branded initials medallion when the directory has no photo', () => {
    render(<PersonAvatar {...BASE} photoUrl={null} />);

    const fallback = screen.getByTestId(TEST_IDS.teamDirectoryAvatarInitials);

    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('RE');
    expect(screen.queryByTestId(TEST_IDS.teamDirectoryAvatarPhoto)).not.toBeInTheDocument();
  });

  it('names the initials fallback for assistive tech instead of leaving it silent', () => {
    render(<PersonAvatar {...BASE} photoUrl={null} />);

    expect(screen.getByRole('img', { name: 'Rawan Elessawy' })).toBeInTheDocument();
  });

  it('renders the portrait once the directory publishes one', () => {
    render(<PersonAvatar {...BASE} photoUrl="/staff/roo.jpg" />);

    const photo = screen.getByTestId(TEST_IDS.teamDirectoryAvatarPhoto);

    expect(photo).toHaveAttribute('src', '/staff/roo.jpg');
    expect(photo).toHaveAttribute('alt', 'Portrait of Rawan Elessawy');
    expect(screen.queryByTestId(TEST_IDS.teamDirectoryAvatarInitials)).not.toBeInTheDocument();
  });

  it('defers portrait loading so a long roster does not block first paint', () => {
    render(<PersonAvatar {...BASE} photoUrl="/staff/roo.jpg" />);

    expect(screen.getByTestId(TEST_IDS.teamDirectoryAvatarPhoto)).toHaveAttribute(
      'loading',
      'lazy',
    );
  });
});
