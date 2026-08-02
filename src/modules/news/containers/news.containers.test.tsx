import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildNewsArticleScreenView,
  buildNewsEditorScreenView,
  buildNewsListScreenView,
} from '../../../../tests/factories/news-view.factory';
import { useNewsArticle } from '../hooks/use-news-article.hook';
import { useNewsEditor } from '../hooks/use-news-editor.hook';
import { useNewsList } from '../hooks/use-news-list.hook';
import { NewsArticleContainer } from './news-article.container';
import { NewsEditorContainer } from './news-editor.container';
import { NewsListContainer } from './news-list.container';

vi.mock('../hooks/use-news-list.hook', () => ({ useNewsList: vi.fn() }));
vi.mock('../hooks/use-news-article.hook', () => ({ useNewsArticle: vi.fn() }));
vi.mock('../hooks/use-news-editor.hook', () => ({ useNewsEditor: vi.fn() }));

describe('NewsListContainer', () => {
  it('feeds the list view model into the public list screen', () => {
    vi.mocked(useNewsList).mockReturnValue(buildNewsListScreenView());
    render(<NewsListContainer />);

    expect(screen.getByTestId(TEST_IDS.newsPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('News');
  });
});

describe('NewsArticleContainer', () => {
  it('feeds the story view model into the article screen', () => {
    vi.mocked(useNewsArticle).mockReturnValue(buildNewsArticleScreenView());
    render(<NewsArticleContainer />);

    expect(screen.getByTestId(TEST_IDS.newsArticlePage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsArticleBody)).toHaveTextContent('A statement win');
  });
});

describe('NewsEditorContainer', () => {
  it('feeds the newsroom view model into the editor screen', () => {
    vi.mocked(useNewsEditor).mockReturnValue(buildNewsEditorScreenView());
    render(<NewsEditorContainer />);

    expect(screen.getByTestId(TEST_IDS.newsEditorPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorForm)).toBeInTheDocument();
  });
});
