import { SITE_URL } from '@/shared/config';

import type { NewsArticleSeoProps } from './news-article-seo.types';

/**
 * Per-article document metadata, using React 19's native head hoisting the
 * same way `PageSeo` does. A story is an ARTICLE, not a website: it carries
 * `og:type=article`, its own cover as the share image, and its publication
 * instant, which is what unfurlers and search results actually read.
 *
 * Deliberately a module-local component rather than a shared `PageSeo` prop
 * set: only the newsroom has article semantics today. If a second module ever
 * needs them, promote this into `@/shared/ui/page-seo` rather than copying it.
 */
export function NewsArticleSeo(props: NewsArticleSeoProps): React.JSX.Element {
  const url = `${SITE_URL}${props.path}`;
  const image = props.imageUrl ?? `${SITE_URL}/brand-logo.png`;
  return (
    <>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="article:author" content={props.author} />
      {props.publishedTime === null ? null : (
        <meta property="article:published_time" content={props.publishedTime} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
