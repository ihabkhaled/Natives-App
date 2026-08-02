import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { countElements, textOfElements } from '../../../../../tests/setup/dom-query.helper';
import { parseNewsMarkdown } from '../../parsers/news-markdown.parser';
import { NewsArticleBody } from './news-article-body.component';

function renderBody(markdown: string): HTMLElement {
  render(<NewsArticleBody blocks={parseNewsMarkdown(markdown)} />);
  return screen.getByTestId(TEST_IDS.newsArticleBody);
}

describe('NewsArticleBody', () => {
  it('renders headings as h2 and h3, never as an h1 competing with the page', () => {
    renderBody('## Two\n\n### Three');

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Two');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Three');
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('renders bullets and ordered items as real list semantics', () => {
    renderBody('- one\n- two\n\n1. first');

    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders emphasis marks as elements, not as literal asterisks', () => {
    const body = renderBody('A **bold** and *italic* and `code` word.');

    expect(body).not.toHaveTextContent('**');
    expect(textOfElements(body, 'strong')).toEqual(['bold']);
    expect(textOfElements(body, 'em')).toEqual(['italic']);
    expect(textOfElements(body, 'code')).toEqual(['code']);
  });

  it('renders an allowlisted link as a safe anchor', () => {
    renderBody('See [the report](https://example.com/report).');
    const link = screen.getByRole('link', { name: 'the report' });

    expect(link).toHaveAttribute('href', 'https://example.com/report');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('never produces an anchor for a javascript: target', () => {
    const body = renderBody('[click me](javascript:alert(1))');

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(body).toHaveTextContent('click me');
  });

  it('escapes embedded HTML instead of executing it', () => {
    // The whole reason this module parses to values: a story is untrusted,
    // author-supplied content served on a public page.
    const body = renderBody('<img src=x onerror="alert(1)"> and <script>alert(2)</script>');

    expect(countElements(body, 'img')).toBe(0);
    expect(countElements(body, 'script')).toBe(0);
    expect(body).toHaveTextContent('onerror');
  });

  it('renders a fenced block verbatim, marks included', () => {
    const body = renderBody('```\n**not bold**\n```');

    expect(countElements(body, 'strong')).toBe(0);
    expect(countElements(body, 'pre')).toBe(1);
    expect(body).toHaveTextContent('**not bold**');
  });

  it('renders a quote as a blockquote', () => {
    expect(countElements(renderBody('> quoted line'), 'blockquote')).toBe(1);
  });

  it('renders nothing at all for an empty story', () => {
    expect(countElements(renderBody(''), '*')).toBe(0);
  });
});
