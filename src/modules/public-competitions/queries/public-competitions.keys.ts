/**
 * Stable query keys for the public showcase cache. Nothing here is
 * team-scoped: the showcase is the same for every visitor, signed in or not.
 */
export const publicCompetitionsQueryKeys = {
  all: ['public-competitions'] as const,
  list: () => [...publicCompetitionsQueryKeys.all, 'list'] as const,
  detail: (slug: string) => [...publicCompetitionsQueryKeys.all, 'detail', slug] as const,
};
