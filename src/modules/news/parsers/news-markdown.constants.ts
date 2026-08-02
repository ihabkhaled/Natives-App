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
