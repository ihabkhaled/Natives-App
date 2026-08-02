/**
 * The bounded Markdown subset the newsroom renders. There is no Markdown
 * library in this repository and adding an unvetted one to render
 * user-authored copy is a security decision, not a convenience one — so the
 * parser here turns a fixed block/inline grammar into TYPED VALUES that React
 * renders as elements. No HTML string is ever produced, nothing is ever passed
 * to `dangerouslySetInnerHTML`, and anything outside the grammar degrades to
 * escaped text.
 */
export const NEWS_BLOCK_KIND = {
  Heading: 'heading',
  Paragraph: 'paragraph',
  Quote: 'quote',
  Code: 'code',
  Bullets: 'bullets',
  Numbers: 'numbers',
} as const;

export const NEWS_SPAN_KIND = {
  Text: 'text',
  Strong: 'strong',
  Emphasis: 'emphasis',
  Code: 'code',
  Link: 'link',
} as const;

/**
 * Only these schemes may become an anchor. Anything else (`javascript:`,
 * `data:`, a bare word) renders as the link's plain label, so a hostile body
 * cannot smuggle a scripted or data URL past the editor.
 */
export const NEWS_SAFE_LINK_PREFIXES = ['https://', 'http://', '/'] as const;

/** Deepest heading a story may declare; `#` and `##` both render as an h2. */
export const NEWS_MAX_HEADING_LEVEL = 3;

/**
 * A capture group's text, or the empty string when the group did not
 * participate.
 *
 * Every call site here reads a group its own pattern guarantees, so the
 * fallback is unreachable in practice — but `RegExpExecArray` is indexed as
 * `string | undefined`, so each inline `?? ''` created a defensive branch no
 * test could ever cover. Centralising it means one branch, covered directly.
 */
export function capturedGroup(match: RegExpExecArray, group: number): string {
  return match[group] ?? '';
}

/**
 * A line at an index, or the empty string when the index is out of range.
 *
 * Same rationale as `capturedGroup`: every caller reads a line its own block
 * is guaranteed to have, but the array index is typed `string | undefined`, so
 * an inline `?? ''` created a branch no test could reach.
 */
export function lineAt(lines: readonly string[], index: number): string {
  return lines.at(index) ?? '';
}
