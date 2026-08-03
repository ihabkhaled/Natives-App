import { requestRevokeAssignment } from '../gateways/role-assignments.gateway';

/**
 * Use case: take one role assignment away, addressed by its own id.
 *
 * Resolves `true` rather than nothing so the mutation carries a value — the
 * server's echo of the revoked assignment is not trusted as the new truth; the
 * list is re-read instead.
 */
export function revokeAssignment(assignmentId: string): Promise<boolean> {
  return requestRevokeAssignment(assignmentId).then(() => true);
}
