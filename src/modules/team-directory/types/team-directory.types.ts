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

/** Public team profile: identity, home, founding date, social presence. */
export interface TeamProfileDto {
  readonly slug: string;
  readonly name: string;
  readonly location: string;
  /** ISO year-month the team was founded, e.g. `2021-10`. */
  readonly foundedOn: string;
  readonly socialUrls: readonly string[];
}

/** One person on the season board, with every responsibility they hold. */
export interface TeamStaffMemberDto {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  /** Title codes from the per-team staff-title catalog. */
  readonly titles: readonly string[];
  readonly photoUrl: string | null;
}

/** One active player on the public roster. */
export interface TeamPlayerDto {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
  readonly position: string | null;
  readonly photoUrl: string | null;
}

export interface TeamDirectoryResponseDto {
  readonly team: TeamProfileDto;
  readonly staff: readonly TeamStaffMemberDto[];
  readonly players: readonly TeamPlayerDto[];
}

/** Normalized team profile the screen renders. */
export interface TeamProfile {
  readonly slug: string;
  readonly name: string;
  readonly location: string;
  readonly foundedOn: string;
  readonly socialUrls: readonly string[];
}

export interface TeamStaffMember {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly titles: readonly string[];
  readonly photoUrl: string | null;
}

export interface TeamRosterPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
  readonly position: string | null;
  readonly photoUrl: string | null;
}

export interface TeamDirectory {
  readonly team: TeamProfile;
  readonly staff: readonly TeamStaffMember[];
  readonly players: readonly TeamRosterPlayer[];
}

/** Staff grouped under one responsibility, ready for a titled card grid. */
export interface StaffTitleGroup {
  readonly titleCode: string;
  readonly members: readonly TeamStaffMember[];
}
