import { TEAM_SOCIAL_URL_PREFIX } from '../team-directory.constants';
import type {
  TeamDirectory,
  TeamDirectoryResponseDto,
  TeamPlayerDto,
  TeamProfileDto,
  TeamRosterPlayer,
  TeamStaffMember,
  TeamStaffMemberDto,
} from '../types/team-directory.types';

/** Blank strings are absent values, not content the card should render. */
function textOrNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

/** Title codes are compared, grouped, and keyed — normalize them once. */
function normalizeTitles(titles: readonly string[]): readonly string[] {
  return titles.map((title) => title.trim().toLowerCase()).filter((title) => title !== '');
}

function mapProfile(dto: TeamProfileDto): TeamDirectory['team'] {
  return {
    slug: dto.slug.trim(),
    name: dto.name.trim(),
    location: dto.location.trim(),
    foundedOn: dto.foundedOn.trim(),
    // A public page never links out over plain http, whatever the API stores.
    socialUrls: dto.socialUrls.filter((url) => url.startsWith(TEAM_SOCIAL_URL_PREFIX)),
  };
}

function mapStaffMember(dto: TeamStaffMemberDto): TeamStaffMember {
  return {
    id: dto.id,
    displayName: dto.displayName.trim(),
    nickname: textOrNull(dto.nickname),
    titles: normalizeTitles(dto.titles),
    photoUrl: textOrNull(dto.photoUrl),
  };
}

function mapPlayer(dto: TeamPlayerDto): TeamRosterPlayer {
  return {
    id: dto.id,
    displayName: dto.displayName.trim(),
    nickname: textOrNull(dto.nickname),
    jerseyNumber: dto.jerseyNumber,
    position: textOrNull(dto.position),
    photoUrl: textOrNull(dto.photoUrl),
  };
}

/** Unnumbered shirts sort after every numbered one. */
function jerseyRank(player: TeamRosterPlayer): number {
  return player.jerseyNumber ?? Number.MAX_SAFE_INTEGER;
}

/** Numbered shirts first in ascending order, then everyone else by name. */
function byJerseyThenName(left: TeamRosterPlayer, right: TeamRosterPlayer): number {
  const byJersey = jerseyRank(left) - jerseyRank(right);
  // Branchless tie-break, so two unnumbered players still order deterministically.
  return byJersey === 0
    ? Number(left.displayName > right.displayName) - Number(left.displayName < right.displayName)
    : byJersey;
}

/**
 * Normalize one `GET /public/teams/{slug}/directory` payload into the domain
 * the screen renders: trimmed copy, blank strings collapsed to null so the
 * initials-avatar fallback triggers deliberately, lower-cased title codes, and
 * a roster ordered by jersey number.
 */
export function mapTeamDirectoryResponse(dto: TeamDirectoryResponseDto): TeamDirectory {
  return {
    team: mapProfile(dto.team),
    staff: dto.staff.map((member) => mapStaffMember(member)),
    players: [...dto.players].map((player) => mapPlayer(player)).sort(byJerseyThenName),
  };
}
