import type { NewsBlock, NewsBlockKind, NewsBlockLine } from '../types/news-markdown.types';
import { parseNewsInline } from './news-inline.parser';
import {
  NEWS_BLOCK_KIND,
  NEWS_MAX_HEADING_LEVEL,
  NEWS_SPAN_KIND,
} from './news-markdown.constants';

/**
 * Each marker consumes exactly ONE whitespace character before its text. A
 * `\s+` there would overlap with the `.*` that follows and give the engine an
 * ambiguous split to backtrack over — a denial-of-service shape in a parser
 * that runs on author-supplied input.
 */
const HEADING = /^(#{1,6})\s(.*)$/u;
const BULLET = /^[-*]\s(.*)$/u;
const NUMBERED = /^\d{1,3}[.)]\s(.*)$/u;
const QUOTE = /^>\s?(.*)$/u;
const FENCE = '```';

/** Marker patterns tried in order once a line is not a heading. */
const LINE_PATTERNS: readonly { readonly kind: NewsBlockKind; readonly pattern: RegExp }[] = [
  { kind: NEWS_BLOCK_KIND.Bullets, pattern: BULLET },
  { kind: NEWS_BLOCK_KIND.Numbers, pattern: NUMBERED },
  { kind: NEWS_BLOCK_KIND.Quote, pattern: QUOTE },
];

interface DraftBlock {
  readonly kind: NewsBlockKind;
  readonly level: number;
  readonly lines: readonly string[];
}

interface ParseState {
  readonly blocks: readonly DraftBlock[];
  readonly open: DraftBlock | null;
  readonly fenced: DraftBlock | null;
}

const EMPTY_STATE: ParseState = { blocks: [], open: null, fenced: null };

/** `#` and `##` both render as an h2; `###` and deeper flatten to an h3. */
function headingLevel(hashes: string): number {
  return Math.min(Math.max(hashes.length, 2), NEWS_MAX_HEADING_LEVEL);
}

function draft(kind: NewsBlockKind, level: number, lines: readonly string[]): DraftBlock {
  return { kind, level, lines };
}

function classifyHeading(line: string): DraftBlock | null {
  const match = HEADING.exec(line);
  return match === null
    ? null
    : draft(NEWS_BLOCK_KIND.Heading, headingLevel(match[1] ?? ''), [match[2] ?? '']);
}

function classifyMarker(line: string): DraftBlock | null {
  for (const entry of LINE_PATTERNS) {
    const match = entry.pattern.exec(line);
    if (match !== null) {
      return draft(entry.kind, 0, [match[1] ?? '']);
    }
  }
  return null;
}

/** One source line as the block it opens, or null when it is blank. */
function classifyLine(line: string): DraftBlock | null {
  const marked = classifyHeading(line) ?? classifyMarker(line);
  if (marked !== null) {
    return marked;
  }
  const text = line.trim();
  return text === '' ? null : draft(NEWS_BLOCK_KIND.Paragraph, 0, [text]);
}

/** A heading always stands alone; every other kind absorbs its neighbours. */
function continues(open: DraftBlock, next: DraftBlock): boolean {
  return open.kind === next.kind && next.kind !== NEWS_BLOCK_KIND.Heading;
}

/** A wrapped paragraph is one line; list items and quote lines stay separate. */
function mergedLines(open: DraftBlock, next: DraftBlock): readonly string[] {
  const incoming = next.lines[0] ?? '';
  if (open.kind !== NEWS_BLOCK_KIND.Paragraph) {
    return [...open.lines, incoming];
  }
  return [...open.lines.slice(0, -1), `${open.lines.at(-1) ?? ''} ${incoming}`];
}

function closeOpen(state: ParseState): ParseState {
  return state.open === null
    ? state
    : { blocks: [...state.blocks, state.open], open: null, fenced: null };
}

function acceptFenced(state: ParseState, fenced: DraftBlock, line: string): ParseState {
  return line.startsWith(FENCE)
    ? { blocks: [...state.blocks, fenced], open: null, fenced: null }
    : { ...state, fenced: draft(fenced.kind, 0, [...fenced.lines, line]) };
}

function acceptLine(state: ParseState, line: string): ParseState {
  const fenced = state.fenced;
  if (fenced !== null) {
    return acceptFenced(state, fenced, line);
  }
  if (line.startsWith(FENCE)) {
    return { ...closeOpen(state), fenced: draft(NEWS_BLOCK_KIND.Code, 0, []) };
  }
  const next = classifyLine(line);
  if (next === null) {
    return closeOpen(state);
  }
  const open = state.open;
  return open !== null && continues(open, next)
    ? { ...state, open: draft(open.kind, open.level, mergedLines(open, next)) }
    : { ...closeOpen(state), open: next };
}

/**
 * Flush whatever the last line left open. `open` and `fenced` are mutually
 * exclusive by construction, and an unterminated fence still renders — a
 * truncated story beats a blank one.
 */
function drain(state: ParseState): readonly DraftBlock[] {
  const trailing = state.open ?? state.fenced;
  return trailing === null ? state.blocks : [...state.blocks, trailing];
}

function toLine(blockKey: string, kind: NewsBlockKind, line: string, index: number): NewsBlockLine {
  const key = `${blockKey}-l${String(index)}`;
  return {
    key,
    spans:
      kind === NEWS_BLOCK_KIND.Code
        ? [{ key: `${key}-c`, kind: NEWS_SPAN_KIND.Text, text: line, href: null }]
        : parseNewsInline(line, key),
  };
}

function toBlock(block: DraftBlock, index: number): NewsBlock {
  const key = `b${String(index)}`;
  return {
    key,
    kind: block.kind,
    level: block.level,
    lines: block.lines.map((line, lineIndex) => toLine(key, block.kind, line, lineIndex)),
  };
}

/**
 * Parse a story body into typed blocks. The output is data, not markup: the
 * view maps each block and span onto a React element, so nothing an author
 * writes can ever be interpreted as HTML by a reader's browser.
 */
export function parseNewsMarkdown(body: string): readonly NewsBlock[] {
  const lines = body.replaceAll('\r\n', '\n').split('\n');
  return drain(lines.reduce(acceptLine, EMPTY_STATE)).map(toBlock);
}
