import { NEWS_SPAN_TAGS } from './news-rich-text.constants';
import type { NewsRichTextProps } from './news-rich-text.types';

/**
 * One line of a story, rendered from typed inline runs. Every run's text is a
 * React child, so the browser escapes it: no author-supplied string can ever
 * become markup, and a link only exists where the parser accepted its scheme.
 */
export function NewsRichText(props: NewsRichTextProps): React.JSX.Element {
  return (
    <>
      {props.spans.map((span) => {
        const Tag = NEWS_SPAN_TAGS[span.kind];
        return span.href === null ? (
          <Tag key={span.key}>{span.text}</Tag>
        ) : (
          <a key={span.key} href={span.href} target="_blank" rel="noreferrer noopener">
            {span.text}
          </a>
        );
      })}
    </>
  );
}
