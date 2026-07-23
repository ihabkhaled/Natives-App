import type { TranslateParams } from '@/packages/i18n';

import type { MemberRole } from '../constants/members.constants';
import type { RoleToggleView } from '../types/members-view.types';
import { resolveRoleLabel } from './role-label.helper';

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

/**
 * Build the ordered, translated role toggles from the SERVER's union of
 * assignable ∪ held roles — never from a client-side catalog. A role the
 * member holds above the actor's ceiling still renders (checked, disabled),
 * and an unseen future slug renders through the label fallback chain.
 */
export function buildRoleToggles(
  t: Translate,
  selected: readonly MemberRole[],
  assignable: readonly MemberRole[],
): readonly RoleToggleView[] {
  const held = selected.filter((role) => !assignable.includes(role));
  return [...assignable, ...held].map((role) => ({
    role,
    label: resolveRoleLabel(t, role),
    checked: selected.includes(role),
    disabled: !assignable.includes(role),
  }));
}
