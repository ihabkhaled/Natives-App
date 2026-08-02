import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildNewsArticleScreenView } from '../../../../../tests/factories/news-view.factory';
import { NewsArticleView } from './news-article-view.component';

describe('NewsArticleView', () => {
  it('renders the story with its cover, byline and parsed body', () => {
    render(<NewsArticleView {...buildNewsArticleScreenView()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('First league win');
    expect(screen.getByTestId(TEST_IDS.newsArticleCover)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsArticleView)).toHaveTextContent('By Dalia Elgharib');
    expect(screen.getByTestId(TEST_IDS.newsArticleBody)).toHaveTextContent('A statement win');
  });

  it('omits the cover element entirely when a story has none', () => {
    render(<NewsArticleView {...buildNewsArticleScreenView({ coverImageUrl: null })} />);

    expect(screen.queryByTestId(TEST_IDS.newsArticleCover)).not.toBeInTheDocument();
  });

  it('names the domain records a story is attached to', () => {
    render(
      <NewsArticleView
        {...buildNewsArticleScreenView({ linkLabels: ['Part of a competition'] })}
      />,
    );

    // StatusChip renders its label twice for accessibility (a visually hidden
    // copy plus an aria-hidden visible one), so both matches are expected.
    expect(screen.getAllByText('Part of a competition')).toHaveLength(2);
  });

  it('shows a skeleton and hides the story while the read is pending', () => {
    render(<NewsArticleView {...buildNewsArticleScreenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.newsArticleLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsArticleBody)).not.toBeInTheDocument();
  });

  it('says the story could not be found instead of rendering an empty article', () => {
    render(<NewsArticleView {...buildNewsArticleScreenView({ status: 'empty' })} />);

    expect(screen.getByTestId(TEST_IDS.newsArticleEmpty)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsArticleBody)).not.toBeInTheDocument();
  });

  it('keeps the way back to the list in every state', () => {
    const onBack = vi.fn();
    render(<NewsArticleView {...buildNewsArticleScreenView({ status: 'error', onBack })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.newsArticleBack));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
