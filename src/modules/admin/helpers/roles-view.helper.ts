import { resolveRoleLabel, type MemberDirectoryItem, type MemberRole } from '@/modules/members';
import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import type { RoleToggleView } from '../types/admin-view.types';

type Translate = (key: string) => string;

export function buildMemberOptions(
  items: readonly MemberDirectoryItem[],
): readonly SelectFieldOption[] {
  return items.map((item) => ({ value: item.membershipId, label: item.displayName }));
}

/**
 * One toggle per role the acting principal may actually assign. Roles above
 * their ceiling are absent, not disabled: the server would refuse them and
 * the screen should not imply otherwise. Labels resolve through the shared
 * fallback chain, so a server-seeded slug renders without a client release.
 */
export function buildRoleToggles(
  t: Translate,
  selected: readonly MemberRole[],
  assignable: readonly MemberRole[],
  toggle: (role: MemberRole) => void,
): readonly RoleToggleView[] {
  return assignable.map((role) => ({
    key: role,
    label: resolveRoleLabel(t, role),
    selected: selected.includes(role),
    onToggle: () => {
      toggle(role);
    },
  }));
}

/** The member's current roles as one readable line, or an explicit "none". */
export function describeCurrentRoles(t: Translate, roles: readonly MemberRole[]): string {
  return roles.length === 0
    ? t(I18N_KEYS.adminRoles.currentNone)
    : roles.map((role) => resolveRoleLabel(t, role)).join(' · ');
}
