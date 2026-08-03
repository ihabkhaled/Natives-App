import { resolveRoleLabel } from '@/modules/members';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ROLE_KEY_CASE, SCOPE_SEPARATOR } from '../constants/role-assignments.constants';
import type { RoleAssignment } from '../types/role-assignments.types';
import type { AssignmentRowView } from '../types/role-assignments-view.types';

type Translate = (key: string, params?: TranslateParams) => string;
type FormatInstant = (iso: string) => string;

/** What the row needs from the screen before it may offer a revoke at all. */
export interface RevokeCapability {
  readonly canRevoke: boolean;
  readonly onRevoke: (assignmentId: string, confirmMessage: string) => void;
}

/**
 * Which scope an assignment applies to, in the server's own identifiers.
 *
 * A teamless assignment is platform-wide. The label says so rather than
 * rendering a blank, because "no team" and "every team" look identical in an
 * empty cell and mean opposite things.
 */
function resolveScopeLabel(t: Translate, assignment: RoleAssignment): string {
  const scope = assignment.teamId ?? t(I18N_KEYS.adminPlatform.navLabel);
  return assignment.seasonId === null ? scope : `${scope}${SCOPE_SEPARATOR}${assignment.seasonId}`;
}

/**
 * Platform-wide grants are read-only here.
 *
 * Ending one is the super-admin flow in `src/modules/admin`, which demands an
 * audited reason and refuses to remove the last administrator. A second,
 * unguarded path to the same act would route around that protection, so the
 * affordance is absent — the row still shows the grant, it just cannot end it.
 * An assignment the server already marked revoked is history, and offers
 * nothing either.
 */
function isRevocableHere(assignment: RoleAssignment): boolean {
  return assignment.teamId !== null && assignment.revokedAt === null;
}

/**
 * Most consequential first: platform-wide grants, then the most recently
 * granted. An administrator auditing an account reads the widest access first,
 * and a grant made minutes ago is the one most likely to be the mistake.
 */
function byScopeThenRecency(left: RoleAssignment, right: RoleAssignment): number {
  const leftIsPlatform = left.teamId === null;
  const rightIsPlatform = right.teamId === null;
  if (leftIsPlatform !== rightIsPlatform) {
    return leftIsPlatform ? -1 : 1;
  }
  return right.effectiveFrom.localeCompare(left.effectiveFrom);
}

/**
 * Who granted this, if anyone did. A null actor is the seeded case rather than
 * an unknown one, and saying so beats an empty line an auditor has to guess at.
 */
function resolveGrantedByLabel(t: Translate, grantedBy: string | null): string {
  return grantedBy === null
    ? t(I18N_KEYS.adminPlatform.grantedBySystem)
    : t(I18N_KEYS.adminPlatform.grantedByLabel, { actor: grantedBy });
}

/**
 * The assignments as rows.
 *
 * Every row carries the exact sentence its own revoke confirmation will show.
 * The point of this screen is that nobody removes access without first reading
 * WHOSE access, which role, and in which scope — so that sentence is built here
 * from the assignment itself and cannot drift from the row it belongs to.
 *
 * The role label comes from the shared members catalog: a role the client
 * ships copy for renders translated, and one it has never heard of is
 * humanized rather than dropped. An unrecognised grant is precisely the one an
 * administrator most needs to see.
 */
export function buildAssignmentRowViews(
  t: Translate,
  formatInstant: FormatInstant,
  assignments: readonly RoleAssignment[],
  revoke: RevokeCapability,
): readonly AssignmentRowView[] {
  return [...assignments].sort(byScopeThenRecency).map((assignment) => {
    const roleLabel = resolveRoleLabel(t, ROLE_KEY_CASE.toSlug(assignment.roleKey));
    const scopeLabel = resolveScopeLabel(t, assignment);
    const confirmMessage = [assignment.userId, roleLabel, scopeLabel].join(SCOPE_SEPARATOR);
    return {
      id: assignment.id,
      roleLabel,
      scopeLabel,
      sinceLabel: t(I18N_KEYS.adminPlatform.sinceLabel, {
        since: formatInstant(assignment.effectiveFrom),
      }),
      grantedByLabel: resolveGrantedByLabel(t, assignment.grantedBy),
      confirmMessage,
      canRevoke: revoke.canRevoke && isRevocableHere(assignment),
      revokeLabel: t(I18N_KEYS.adminPlatform.revokeAction),
      onRevoke: (): void => {
        revoke.onRevoke(assignment.id, confirmMessage);
      },
    };
  });
}
