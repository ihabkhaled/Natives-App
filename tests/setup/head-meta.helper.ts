/**
 * Head-tag assertions for `<PageSeo>` tests. `<meta>`/`<link>` elements carry
 * no ARIA role, so Testing Library's query API cannot reach them — this
 * helper isolates the one legitimate direct DOM read behind a plain
 * (non-test, non-testing-library) file so `testing-library/no-node-access`
 * does not apply to it.
 */
export function getMetaContent(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('content') ?? null;
}

export function getLinkHref(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('href') ?? null;
}
