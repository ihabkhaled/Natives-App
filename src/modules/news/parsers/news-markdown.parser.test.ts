import { describe, expect, it } from 'vitest';

import type { NewsBlock } from '../types/news-markdown.types';
import { parseNewsMarkdown } from './news-markdown.parser';

function kinds(blocks: readonly NewsBlock[]): readonly string[] {
  return blocks.map((block) => block.kind);
}

function texts(block: NewsBlock): readonly string[] {
  return block.lines.map((line) => line.spans.map((span) => span.text).join(''));
}

describe('parseNewsMarkdown', () => {
  it('parses nothing out of an empty body', () => {
    expect(parseNewsMarkdown('')).toEqual([]);
  });

  it('reads a heading and caps its depth at h3', () => {
    const blocks = parseNewsMarkdown('# One\n\n## Two\n\n#### Four');

    expect(kinds(blocks)).toEqual(['heading', 'heading', 'heading']);
    expect(blocks.map((block) => block.level)).toEqual([2, 2, 3]);
  });

  it('joins a wrapped paragraph into one line', () => {
    const blocks = parseNewsMarkdown('The Natives took\nthe opener.');

    expect(kinds(blocks)).toEqual(['paragraph']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['The Natives took the opener.']);
  });

  it('ends a paragraph at a blank line', () => {
    expect(kinds(parseNewsMarkdown('one\n\ntwo'))).toEqual(['paragraph', 'paragraph']);
  });

  it('never merges two headings into one block', () => {
    expect(kinds(parseNewsMarkdown('## One\n## Two'))).toEqual(['heading', 'heading']);
  });

  it('collects consecutive bullets into one list', () => {
    const blocks = parseNewsMarkdown('- one\n* two\n- three');

    expect(kinds(blocks)).toEqual(['bullets']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['one', 'two', 'three']);
  });

  it('collects an ordered list, accepting both `1.` and `1)`', () => {
    const blocks = parseNewsMarkdown('1. one\n2) two');

    expect(kinds(blocks)).toEqual(['numbers']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['one', 'two']);
  });

  it('keeps quote lines separate inside one blockquote', () => {
    const blocks = parseNewsMarkdown('> first\n>second');

    expect(kinds(blocks)).toEqual(['quote']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['first', 'second']);
  });

  it('keeps a fenced code block verbatim, marks and blank lines included', () => {
    const blocks = parseNewsMarkdown('```\n**not bold**\n\nplain\n```');

    expect(kinds(blocks)).toEqual(['code']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['**not bold**', '', 'plain']);
  });

  it('still renders an unterminated fence rather than swallowing the story', () => {
    const blocks = parseNewsMarkdown('```\nlet x = 1;');

    expect(kinds(blocks)).toEqual(['code']);
    expect(texts(blocks[0] as NewsBlock)).toEqual(['let x = 1;']);
  });

  it('closes an open block before a fence opens', () => {
    expect(kinds(parseNewsMarkdown('intro\n```\ncode\n```'))).toEqual(['paragraph', 'code']);
  });

  it('normalizes CRLF input', () => {
    expect(kinds(parseNewsMarkdown('one\r\n\r\n- two'))).toEqual(['paragraph', 'bullets']);
  });

  it('gives every block and line a unique key', () => {
    const blocks = parseNewsMarkdown('## Head\n\n- one\n- two\n\nbody');
    const keys = [
      ...blocks.map((block) => block.key),
      ...blocks.flatMap((block) => block.lines.map((line) => line.key)),
    ];

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('parses inline marks inside prose but not inside code', () => {
    const blocks = parseNewsMarkdown('a **b**\n\n```\na **b**\n```');

    expect((blocks[0] as NewsBlock).lines[0]?.spans.map((span) => span.kind)).toEqual([
      'text',
      'strong',
    ]);
    expect((blocks[1] as NewsBlock).lines[0]?.spans.map((span) => span.kind)).toEqual(['text']);
  });
});
