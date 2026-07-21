import { schemaBuilder } from '@/packages/schema';

/**
 * Shape of the persisted active-team payload, version 1.
 *
 * Only the selected team's id is stored, never the membership, the roles, or
 * the team's name: those are server state that `/auth/me` re-resolves on every
 * boot. A stored id the principal no longer belongs to is simply ignored.
 */
export const persistedActiveTeamSchema = schemaBuilder.object({
  selectedTeamId: schemaBuilder.string().min(1).nullable(),
});
