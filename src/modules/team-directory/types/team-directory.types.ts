/**
 * Wire and domain shapes for the public team directory.
 *
 * The `*Dto` types mirror the response contract 1.8.0 pins for
 * `GET /public/teams/{slug}/directory` (team profile + staff-with-titles +
 * active players). They are declared here ahead of the generated contract
 * types so the page can be built, styled, and tested against the real shape;
 * `services/load-team-directory.service.ts` is the single seam that swaps the
 * stub source for the live request.
 */

/**
 * Public team profile: identity, home, founding date, social presence.
 *
 * The server sends each social network as its own nullable field rather than
 * a list, so the mapper is what turns them into the ordered link row the page
 * renders.
 */
export interface TeamProfileDto {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly location: string | null;
  /** ISO year-month the team was founded, e.g. `2021-10`. */
  readonly foundedOn: string | null;
  readonly facebookUrl: string | null;
  readonly instagramUrl: string | null;
  readonly tiktokUrl: string | null;
}

/** One person on the season board, with every responsibility they hold. */
export interface TeamStaffMemberDto {
  readonly membershipId: string;
  readonly displayName: string;
  readonly nickname: string | null;
  /** Title codes from the per-team staff-title catalog. */
  readonly titles: readonly string[];
  readonly photoUrl: string | null;
}

/** One active player on the public roster. */
export interface TeamPlayerDto {
  readonly membershipId: string;
  readonly displayName: string;
  readonly nickname: string | null;
  /** A printed label, not a number: a shirt reading `011` is not eleven. */
  readonly jerseyNumber: string | null;
  readonly positions: readonly string[];
  readonly photoUrl: string | null;
}

/** One competition the team has entered, as the public site announces it. */
interface TeamCompetitionDto {
  readonly competitionId: string;
  readonly name: string;
  readonly seasonName: string;
  readonly competitionType: string;
  readonly startsOn: string | null;
  readonly endsOn: string | null;
}

export interface TeamDirectoryResponseDto {
  readonly profile: TeamProfileDto;
  readonly staff: readonly TeamStaffMemberDto[];
  readonly players: readonly TeamPlayerDto[];
  readonly competitions: readonly TeamCompetitionDto[];
}

/** Normalized team profile the screen renders. */
export interface TeamProfile {
  readonly slug: string;
  readonly name: string;
  readonly location: string | null;
  readonly foundedOn: string | null;
  /** Only the confirmed https profiles, in a fixed order. */
  readonly socialUrls: readonly string[];
}

export interface TeamStaffMember {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly titles: readonly string[];
  readonly photoUrl: string | null;
}

/** A competition on the public site, normalized. */
interface TeamCompetition {
  readonly id: string;
  readonly name: string;
  readonly seasonName: string;
}

export interface TeamRosterPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: string | null;
  readonly position: string | null;
  readonly photoUrl: string | null;
}

export interface TeamDirectory {
  readonly team: TeamProfile;
  readonly staff: readonly TeamStaffMember[];
  readonly players: readonly TeamRosterPlayer[];
  readonly competitions: readonly TeamCompetition[];
}

/** Staff grouped under one responsibility, ready for a titled card grid. */
export interface StaffTitleGroup {
  readonly titleCode: string;
  readonly members: readonly TeamStaffMember[];
}
