import { SITE_URL } from '@/shared/config';

import type { PageSeoProps } from './page-seo.types';

/**
 * Per-route SEO metadata using React 19's native document-metadata support:
 * `<title>`, `<meta>`, and `<link>` rendered anywhere in the tree are hoisted
 * into `<head>` automatically, no portal or helper library needed. Renders
 * nothing visible — mount once per routed screen, alongside its content.
 *
 * index.html still carries the static, pre-hydration defaults (used by
 * link-preview unfurlers that never execute JS); this keeps the in-app
 * document title, canonical link, and Open Graph/Twitter tags accurate for
 * real browser navigation and JS-rendering crawlers once each route mounts.
 */
export function PageSeo(props: PageSeoProps): React.JSX.Element {
  const url = `${SITE_URL}${props.path}`;
  const image = `${SITE_URL}/brand-logo.png`;
  return (
    <>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
