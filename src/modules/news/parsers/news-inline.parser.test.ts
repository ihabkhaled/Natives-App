import { describe, expect, it } from 'vitest';

import { isSafeNewsLink, parseNewsInline, spansToPlainText } from './news-inline.parser';

describe('parseNewsInline', () => {
  it('returns one plain run for text with no marks', () => {
    expect(parseNewsInline('a plain sentence', 'k')).toEqual([
      { key: 'k-t0', kind: 'text', text: 'a plain sentence', href: null },
    ]);
  });

  it('returns nothing at all for an empty line', () => {
    expect(parseNewsInline('', 'k')).toEqual([]);
  });

  it('splits text around every supported mark', () => {
    const spans = parseNewsInline('a `x` b **c** d __e__ f *g* h _i_ j', 'k');

    expect(spans.map((span) => span.kind)).toEqual([
      'text',
      'code',
      'text',
      'strong',
      'text',
      'strong',
      'text',
      'emphasis',
      'text',
      'emphasis',
      'text',
    ]);
    expect(spans.map((span) => span.text).join('')).toBe('a x b c d e f g h i j');
  });

  it('keeps a unique key per run so React never reorders them', () => {
    const keys = parseNewsInline('**one** and **two**', 'k').map((span) => span.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('turns an https link into an anchor run carrying its target', () => {
    expect(parseNewsInline('see [the report](https://example.com/x)', 'k').at(-1)).toEqual({
      key: 'k-s4',
      kind: 'link',
      text: 'the report',
      href: 'https://example.com/x',
    });
  });

  it('accepts a site-relative target', () => {
    expect(parseNewsInline('[squads](/squads)', 'k')[0]).toMatchObject({
      kind: 'link',
      href: '/squads',
    });
  });

  it('degrades a javascript: target to plain text, keeping the label', () => {
    // The whole point of the allowlist: a hostile body must not be able to
    // produce an anchor the reader can activate.
    const spans = parseNewsInline('[click me](javascript:alert(1))', 'k');

    expect(spans.every((span) => span.href === null)).toBe(true);
    expect(spans[0]).toEqual({ key: 'k-s0', kind: 'text', text: 'click me', href: null });
  });

  it('degrades a data: target the same way', () => {
    expect(parseNewsInline('[x](data:text/html;base64,PHN2Zz4=)', 'k')[0]).toMatchObject({
      kind: 'text',
      href: null,
    });
  });
});

describe('isSafeNewsLink', () => {
  it('accepts only the allowlisted prefixes', () => {
    expect(isSafeNewsLink('https://example.com')).toBe(true);
    expect(isSafeNewsLink('http://example.com')).toBe(true);
    expect(isSafeNewsLink('/news')).toBe(true);
    expect(isSafeNewsLink('javascript:alert(1)')).toBe(false);
    expect(isSafeNewsLink('mailto:team@example.com')).toBe(false);
    expect(isSafeNewsLink('')).toBe(false);
  });
});

describe('spansToPlainText', () => {
  it('strips every mark and keeps the words', () => {
    expect(
      spansToPlainText(parseNewsInline('a **bold** and `code` and [link](https://x.test)', 'k')),
    ).toBe('a bold and code and link');
  });
});
