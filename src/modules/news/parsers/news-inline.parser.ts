import type { NewsSpan, NewsSpanKind } from '../types/news-markdown.types';
import { NEWS_SAFE_LINK_PREFIXES, NEWS_SPAN_KIND } from './news-markdown.constants';

/**
 * `code`, **strong**, *emphasis*, _emphasis_, [label](href) — in that
 * precedence. Every alternative is a bounded, non-nested character class, so
 * there is no catastrophic-backtracking shape here.
 */
const INLINE_PATTERN =
  /`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_|\[([^\]\n]+)\]\(([^)\s]+)\)/gu;

/** A target is linkable only when it opens with an allowlisted prefix. */
export function isSafeNewsLink(href: string): boolean {
  return NEWS_SAFE_LINK_PREFIXES.some((prefix) => href.startsWith(prefix));
}

function span(key: string, kind: NewsSpanKind, text: string, href: string | null): NewsSpan {
  return { key, kind, text, href };
}

/**
 * Which capture group carries which kind, in the pattern's own order. A table
 * rather than a branch chain, so adding a mark is one row.
 */
const CAPTURE_KINDS: readonly { readonly group: number; readonly kind: NewsSpanKind }[] = [
  { group: 1, kind: NEWS_SPAN_KIND.Code },
  { group: 2, kind: NEWS_SPAN_KIND.Strong },
  { group: 3, kind: NEWS_SPAN_KIND.Strong },
  { group: 4, kind: NEWS_SPAN_KIND.Emphasis },
  { group: 5, kind: NEWS_SPAN_KIND.Emphasis },
];

const LINK_LABEL_GROUP = 6;
const LINK_HREF_GROUP = 7;

/**
 * The matched alternative, as a typed run. A link whose target fails the
 * allowlist degrades to its own label as plain text rather than being
 * dropped: the reader still sees what the author wrote, minus the target.
 */
function matchedSpan(key: string, match: RegExpExecArray): NewsSpan {
  const marked = CAPTURE_KINDS.find((entry) => match[entry.group] !== undefined);
  if (marked !== undefined) {
    return span(key, marked.kind, match[marked.group] ?? '', null);
  }
  const label = match[LINK_LABEL_GROUP] ?? '';
  const target = match[LINK_HREF_GROUP] ?? '';
  return isSafeNewsLink(target)
    ? span(key, NEWS_SPAN_KIND.Link, label, target)
    : span(key, NEWS_SPAN_KIND.Text, label, null);
}

function textSpan(keyPrefix: string, index: number, text: string): readonly NewsSpan[] {
  return text === '' ? [] : [span(`${keyPrefix}-t${String(index)}`, NEWS_SPAN_KIND.Text, text, null)];
}

/**
 * Split one already-block-classified line into typed inline runs. The result
 * is data: the view maps each span onto an element and React escapes the
 * text, so no markup an author types can become markup a reader executes.
 */
export function parseNewsInline(line: string, keyPrefix: string): readonly NewsSpan[] {
  const spans: NewsSpan[] = [];
  let cursor = 0;
  INLINE_PATTERN.lastIndex = 0;
  let match = INLINE_PATTERN.exec(line);
  while (match !== null) {
    spans.push(...textSpan(keyPrefix, cursor, line.slice(cursor, match.index)));
    spans.push(matchedSpan(`${keyPrefix}-s${String(match.index)}`, match));
    cursor = match.index + match[0].length;
    match = INLINE_PATTERN.exec(line);
  }
  spans.push(...textSpan(keyPrefix, cursor, line.slice(cursor)));
  return spans;
}

/** Typed runs flattened back to their words, for excerpts and meta tags. */
export function spansToPlainText(spans: readonly NewsSpan[]): string {
  return spans.map((entry) => entry.text).join('');
}
