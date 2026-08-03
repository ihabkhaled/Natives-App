import { resolveRoleLabel } from '@/modules/members';
import type { TranslateParams } from '@/packages/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import { ROLE_KEY_CASE } from '../constants/role-assignments.constants';
import type { AssignableRole } from '../types/role-assignments.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The draft a grant is assembled from, before it is allowed to be sent. */
export interface GrantDraft {
  readonly userId: string;
  readonly roleSlug: string;
}

/** The wire-ready grant, or null when the draft is not one the server accepts. */
export interface GrantIntent {
  readonly userId: string;
  readonly roleKey: string;
}

/**
 * The role select's options: the server's assignable-roles catalog, verbatim.
 *
 * Nothing is added, filtered, or reordered. This list IS the actor's privilege
 * ceiling as the backend computed it, so an option that appears here is one the
 * grant endpoint will honour, and a role above the ceiling never renders at
 * all — rather than rendering and failing with a 403 the operator must decode.
 * The server's own `displayName` is the fallback label, so a role added
 * server-side is legible with no client release.
 */
export function buildRoleOptions(
  t: Translate,
  roles: readonly AssignableRole[],
): readonly SelectFieldOption[] {
  return roles.map((role) => ({
    value: role.slug,
    label: resolveRoleLabel(t, role.slug, role.displayName),
  }));
}

/**
 * Turn a draft into the grant to send, or refuse it.
 *
 * The chosen role must still be present in the catalog at submit time. The
 * catalog can shrink underneath an open form — an administrator's own access
 * can be reduced while they are looking at it — and re-checking here means the
 * client never asks for something it has just been told it may not have.
 * Trimming the user id is not cosmetic: a stray space produces a different
 * `/rbac/users/{id}` path and a confusing 404.
 */
export function resolveGrantIntent(
  draft: GrantDraft,
  roles: readonly AssignableRole[],
): GrantIntent | null {
  const userId = draft.userId.trim();
  const isOffered = roles.some((role) => role.slug === draft.roleSlug);
  if (userId === '' || !isOffered) {
    return null;
  }
  return { userId, roleKey: ROLE_KEY_CASE.toWire(draft.roleSlug) };
}
