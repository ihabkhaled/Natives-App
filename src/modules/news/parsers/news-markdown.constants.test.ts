import { describe, expect, it } from 'vitest';

import { capturedGroup, lineAt } from './news-markdown.constants';

/**
 * Both parsers read capture groups their own patterns guarantee, so the
 * empty-string fallback is unreachable through them. Exercised directly here
 * with a pattern whose group genuinely does not participate.
 */
describe('capturedGroup', () => {
  it('returns the captured text when the group participated', () => {
    const match = /^(\w+)$/u.exec('heading');

    expect(match).not.toBeNull();
    expect(capturedGroup(match!, 1)).toBe('heading');
  });

  it('returns an empty string when the group did not participate', () => {
    // The second alternative matches, so group 1 is undefined rather than ''.
    const match = /(a)|b/u.exec('b');

    expect(match).not.toBeNull();
    expect(match?.[1]).toBeUndefined();
    expect(capturedGroup(match!, 1)).toBe('');
  });

  it('returns an empty string for a group index the pattern does not define', () => {
    const match = /^b$/u.exec('b');

    expect(match).not.toBeNull();
    expect(capturedGroup(match!, 9)).toBe('');
  });
});

describe('lineAt', () => {
  it('returns the line at a positive index', () => {
    expect(lineAt(['first', 'second'], 0)).toBe('first');
  });

  it('returns the last line for a negative index', () => {
    expect(lineAt(['first', 'second'], -1)).toBe('second');
  });

  it('returns an empty string when the index is out of range', () => {
    expect(lineAt([], 0)).toBe('');
    expect(lineAt([], -1)).toBe('');
  });
});
