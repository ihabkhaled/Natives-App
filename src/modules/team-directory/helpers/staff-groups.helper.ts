import { STAFF_TITLE_OTHER } from '../team-directory.constants';
import type { StaffTitleGroup, TeamStaffMember } from '../types/team-directory.types';

/** Titles this client does not know yet still get a home on the page. */
function bucketsFor(member: TeamStaffMember, known: ReadonlySet<string>): readonly string[] {
  const buckets = member.titles.map((title) => (known.has(title) ? title : STAFF_TITLE_OTHER));
  return buckets.length === 0 ? [STAFF_TITLE_OTHER] : [...new Set(buckets)];
}

function collect(
  staff: readonly TeamStaffMember[],
  known: ReadonlySet<string>,
): ReadonlyMap<string, TeamStaffMember[]> {
  const byTitle = new Map<string, TeamStaffMember[]>();
  for (const member of staff) {
    for (const bucket of bucketsFor(member, known)) {
      const members = byTitle.get(bucket) ?? [];
      members.push(member);
      byTitle.set(bucket, members);
    }
  }
  return byTitle;
}

/**
 * Group the season board by responsibility, in the declared display order.
 *
 * A person holding several titles appears under each of them — that is the
 * point of the public "who's who". Empty groups are dropped, and any title the
 * backend catalog grows before this client knows about it lands in a single
 * trailing bucket rather than disappearing.
 */
export function groupStaffByTitle(
  staff: readonly TeamStaffMember[],
  order: readonly string[],
): readonly StaffTitleGroup[] {
  const byTitle = collect(staff, new Set(order));
  const ordered = [...order, STAFF_TITLE_OTHER];
  return ordered
    .map((titleCode) => ({ titleCode, members: byTitle.get(titleCode) ?? [] }))
    .filter((group) => group.members.length > 0);
}
