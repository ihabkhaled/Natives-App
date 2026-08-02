import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for `GET /public/teams/{slug}/directory`.
 *
 * Every optional-looking field is nullable rather than absent, matching the
 * backend DTO: a team with no TikTok answers with `tiktokUrl: null`, not by
 * omitting the key. Jersey numbers are strings on purpose — a shirt printed
 * `011` is not the number eleven.
 */

const publicTeamProfileSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  slug: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  location: schemaBuilder.string().nullable(),
  foundedOn: schemaBuilder.string().nullable(),
  facebookUrl: schemaBuilder.string().nullable(),
  instagramUrl: schemaBuilder.string().nullable(),
  tiktokUrl: schemaBuilder.string().nullable(),
});

const publicStaffMemberSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  displayName: schemaBuilder.string().min(1),
  nickname: schemaBuilder.string().nullable(),
  titles: schemaBuilder.array(schemaBuilder.string()),
  photoUrl: schemaBuilder.string().nullable(),
});

const publicRosterPlayerSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  displayName: schemaBuilder.string().min(1),
  nickname: schemaBuilder.string().nullable(),
  jerseyNumber: schemaBuilder.string().nullable(),
  positions: schemaBuilder.array(schemaBuilder.string()),
  photoUrl: schemaBuilder.string().nullable(),
});

export const publicTeamDirectoryResponseSchema = schemaBuilder.object({
  profile: publicTeamProfileSchema,
  staff: schemaBuilder.array(publicStaffMemberSchema),
  players: schemaBuilder.array(publicRosterPlayerSchema),
});
