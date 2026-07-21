import type { MemberDirectoryItem } from '@/modules/members';
import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import { UNATTRIBUTED_VALUE } from '../constants/matches-view.constants';

type Translate = (key: string) => string;

/**
 * Scorer/assist options. "Not attributed" is always first and always
 * available: a point whose scorer nobody caught is recorded as a point with no
 * scorer, never guessed at or silently attributed to the last selection.
 */
export function buildMemberOptions(
  t: Translate,
  members: readonly MemberDirectoryItem[],
): readonly SelectFieldOption[] {
  return [
    { value: UNATTRIBUTED_VALUE, label: t(I18N_KEYS.scoreboard.unattributed) },
    ...members.map((member) => ({ value: member.membershipId, label: member.displayName })),
  ];
}

/**
 * Membership id to display name. An id the directory does not carry resolves
 * to the id itself, so a statistics row for an unresolved membership still
 * renders instead of vanishing from a table that promises completeness.
 */
export function buildNameResolver(
  members: readonly MemberDirectoryItem[],
): (membershipId: string) => string {
  const names = new Map(members.map((member) => [member.membershipId, member.displayName]));
  return (membershipId: string) => names.get(membershipId) ?? membershipId;
}
