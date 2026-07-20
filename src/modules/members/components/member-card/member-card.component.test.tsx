import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemberCard } from './member-card.component';
import type { MemberCardView } from '../../types/members-view.types';

const card: MemberCardView = {
  membershipId: 'a',
  name: 'Omar Hassan',
  nickname: 'Omo',
  avatarLabel: 'Omar Hassan',
  statusLabel: 'Active',
  statusTone: 'success',
  jerseyLabel: '#7',
  positionsSummary: 'handler · cutter',
  ariaLabel: 'Omar Hassan',
};

describe('MemberCard', () => {
  it('renders identity, jersey, positions, and status; selects on click', () => {
    const onSelect = vi.fn();
    render(<MemberCard card={card} onSelect={onSelect} />);
    expect(screen.getByText('Omar Hassan')).toBeInTheDocument();
    expect(screen.getByText('Omo')).toBeInTheDocument();
    expect(screen.getByText('handler · cutter')).toBeInTheDocument();
    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Omar Hassan' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('omits nickname, jersey, and positions when absent', () => {
    render(
      <MemberCard
        card={{ ...card, nickname: null, jerseyLabel: null, positionsSummary: null }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText('Omo')).not.toBeInTheDocument();
    expect(screen.queryByText('#7')).not.toBeInTheDocument();
  });
});
