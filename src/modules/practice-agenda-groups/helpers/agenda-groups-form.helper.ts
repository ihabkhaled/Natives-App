/**
 * Every form in this module gates its submit on the same rule: something was
 * actually typed. `AssignGroupMembersDto` and `CreateGroupDto` both reject an
 * empty string server-side; failing the button rather than the request is the
 * honest version of the same check.
 */
export function isFilledIn(value: string): boolean {
  return value.trim() !== '';
}
