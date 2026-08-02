export const teamDirectoryQueryKeys = {
  all: ['team-directory'] as const,
  bySlug: (slug: string) => [...teamDirectoryQueryKeys.all, slug] as const,
};
