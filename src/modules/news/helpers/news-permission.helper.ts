import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

/**
 * Reading the news needs no grant at all — the public list and article routes
 * are unauthenticated. Writing, revising and publishing need `news.manage`,
 * which platform and team administrators, Coaches, and the Social Media &
 * Marketing / Spirit Captain / Finance staff titles hold. A plain player never
 * does, so every editing affordance is absent for them rather than disabled.
 *
 * Convenience only: the backend re-authorizes every write regardless.
 */
export function canManageNews(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.newsManage]);
}
