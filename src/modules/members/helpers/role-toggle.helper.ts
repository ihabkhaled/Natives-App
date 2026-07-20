import type { TranslateParams } from '@/packages/i18n';

import {
  MEMBER_ROLE_LABEL_KEYS,
  MEMBER_ROLE_OPTIONS,
  type MemberRole,
} from '../constants/members.constants';
import type { RoleToggleView } from '../types/members-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Toggle a role in the selection, but only when it is within the ceiling. */
export function toggleRole(
  selected: readonly MemberRole[],
  role: MemberRole,
  assignable: readonly MemberRole[],
): readonly MemberRole[] {
  if (!assignable.includes(role)) {
    return selected;
  }
  return selected.includes(role) ? selected.filter((value) => value !== role) : [...selected, role];
}

/** Whether two role sets differ (order-independent) — drives the save affordance. */
export function rolesDiffer(a: readonly MemberRole[], b: readonly MemberRole[]): boolean {
  if (a.length !== b.length) {
    return true;
  }
  return a.some((role) => !b.includes(role));
}

/** Build the ordered, translated role toggles with ceiling-aware disabling. */
export function buildRoleToggles(
  t: Translate,
  selected: readonly MemberRole[],
  assignable: readonly MemberRole[],
): readonly RoleToggleView[] {
  return MEMBER_ROLE_OPTIONS.map((role) => ({
    role,
    label: t(MEMBER_ROLE_LABEL_KEYS[role]),
    checked: selected.includes(role),
    disabled: !assignable.includes(role),
  }));
}
