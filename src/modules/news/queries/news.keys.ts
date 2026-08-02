/**
 * Stable query-key builders for the newsroom cache. The public reads are NOT
 * team-scoped: `/news` is unauthenticated club-wide content, so scoping its
 * key by team would fragment one cache entry per session that never differs.
 * The managed read is separated because it also carries drafts.
 */
export const newsQueryKeys = {
  all: ['news'] as const,
  published: (page: number) => [...newsQueryKeys.all, 'published', page] as const,
  article: (slug: string) => [...newsQueryKeys.all, 'article', slug] as const,
  managed: (page: number) => [...newsQueryKeys.all, 'managed', page] as const,
};
