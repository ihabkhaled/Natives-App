import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildNewsCardView } from '../../../../../tests/factories/news-view.factory';
import { NewsCard } from './news-card.component';

describe('NewsCard', () => {
  it('renders the cover image with a described alternative', () => {
    render(<NewsCard item={buildNewsCardView()} readMoreLabel="Read" onOpen={vi.fn()} />);

    expect(screen.getByTestId(TEST_IDS.newsCardCover)).toHaveAttribute(
      'alt',
      'Cover image for First league win',
    );
    expect(screen.queryByTestId(TEST_IDS.newsCardFallback)).not.toBeInTheDocument();
  });

  it('falls back to the branded initial when a story has no cover', () => {
    render(
      <NewsCard
        item={buildNewsCardView({ coverImageUrl: null })}
        readMoreLabel="Read"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.newsCardFallback)).toHaveTextContent('F');
    expect(screen.queryByTestId(TEST_IDS.newsCardCover)).not.toBeInTheDocument();
  });

  it('shows the headline, teaser, byline and date', () => {
    render(<NewsCard item={buildNewsCardView()} readMoreLabel="Read" onOpen={vi.fn()} />);
    const card = screen.getByTestId(TEST_IDS.newsCard);

    expect(card).toHaveTextContent('First league win');
    expect(card).toHaveTextContent('The Natives took the opener 15-12.');
    expect(card).toHaveTextContent('By Dalia Elgharib');
    expect(card).toHaveTextContent('Published 2 May 2026');
  });

  it('opens the story by slug, not by index', () => {
    const onOpen = vi.fn();
    render(<NewsCard item={buildNewsCardView()} readMoreLabel="Read" onOpen={onOpen} />);
    fireEvent.click(screen.getByText('Read'));

    expect(onOpen).toHaveBeenCalledWith('first-league-win');
  });
});
