import { agendaResponseSchema } from '@/modules/practice-agenda';
import { schemaBuilder } from '@/packages/schema';

/** A membership assigned to a group. The wire carries nothing else about them. */
export const groupMemberResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
});

export const agendaGroupResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  name: schemaBuilder.string(),
  color: schemaBuilder.string().nullable(),
  coachMembershipId: schemaBuilder.string().nullable(),
  position: schemaBuilder.number(),
  notes: schemaBuilder.string().nullable(),
  members: schemaBuilder.array(groupMemberResponseSchema),
});

/**
 * The coach plan: the same `AgendaResponseDto` `practice-agenda` reads, with
 * `groups` restored. `practice-agenda`'s schema deliberately drops `groups` —
 * group assignment is this module's endpoint family, not that one's — so
 * rather than re-declare every block and station field a second time, this
 * extends the upstream schema with the one field it left out. Drift between
 * the two agenda reads becomes impossible by construction: there is only one
 * place `sessionId`, `blocks`, etc. are ever declared.
 */
export const agendaGroupsPlanResponseSchema = agendaResponseSchema.extend({
  groups: schemaBuilder.array(agendaGroupResponseSchema),
});
