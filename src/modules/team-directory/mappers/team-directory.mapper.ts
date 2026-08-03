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

/**
 * Title codes are compared, grouped, and keyed — normalize them once.
 *
 * The API stores titles as the words a human typed ("Social Media &
 * Marketing"), while this client keys them as codes, so anything that is not
 * a letter or digit collapses to a single hyphen. Lower-casing alone is not
 * enough: it leaves "spirit captain", which matches no code and would render
 * every staff card's title as a missing translation.
 */
function normalizeTitles(titles: readonly string[]): readonly string[] {
  return titles
    .map((title) =>
      title
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/gu, '-')
        .replaceAll(/^-+|-+$/gu, ''),
    )
    .filter((title) => title !== '');
}

function mapProfile(dto: TeamProfileDto): TeamDirectory['team'] {
  return {
    slug: dto.slug.trim(),
    name: dto.name.trim(),
    location: textOrNull(dto.location),
    foundedOn: textOrNull(dto.foundedOn),
    // A public page never links out over plain http, whatever the API stores.
    socialUrls: [dto.facebookUrl, dto.instagramUrl, dto.tiktokUrl]
      .map((url) => textOrNull(url))
      .filter((url) => url !== null)
      .filter((url) => url.startsWith(TEAM_SOCIAL_URL_PREFIX)),
  };
}

function mapStaffMember(dto: TeamStaffMemberDto): TeamStaffMember {
  return {
    id: dto.membershipId,
    displayName: dto.displayName.trim(),
    nickname: textOrNull(dto.nickname),
    titles: normalizeTitles(dto.titles),
    photoUrl: textOrNull(dto.photoUrl),
  };
}

function mapPlayer(dto: TeamPlayerDto): TeamRosterPlayer {
  return {
    id: dto.membershipId,
    displayName: dto.displayName.trim(),
    nickname: textOrNull(dto.nickname),
    jerseyNumber: dto.jerseyNumber,
    // The card has room for one position; the rest stay in the payload.
    position: textOrNull(dto.positions[0] ?? null),
    photoUrl: textOrNull(dto.photoUrl),
  };
}

/**
 * Unnumbered shirts sort after every numbered one. The number is a printed
 * label, so it is parsed only to order the roster — "011" ranks as 11, next to
 * the other elevens, rather than lexically between "0" and "1".
 */
function jerseyRank(player: TeamRosterPlayer): number {
  if (player.jerseyNumber === null) {
    return Number.MAX_SAFE_INTEGER;
  }
  const parsed = Number.parseInt(player.jerseyNumber, 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
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
    team: mapProfile(dto.profile),
    staff: dto.staff.map((member) => mapStaffMember(member)),
    players: [...dto.players].map((player) => mapPlayer(player)).sort(byJerseyThenName),
    competitions: dto.competitions.map((competition) => ({
      id: competition.competitionId,
      name: competition.name.trim(),
      seasonName: competition.seasonName.trim(),
    })),
  };
}
