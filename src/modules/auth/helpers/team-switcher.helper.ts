import type { AuthMembership } from '../types/auth.types';

export interface TeamOptionView {
  readonly teamId: string;
  readonly name: string;
  /** Short scope line: the season, or the membership status when there is none. */
  readonly detail: string | null;
  readonly isActive: boolean;
}

/**
 * The switcher's option list, one entry per membership the server returned.
 * The detail line prefers the season name because that is what distinguishes
 * two scopes inside the same club; teams without a season fall back to null
 * rather than inventing a placeholder.
 */
export function buildTeamOptions(
  memberships: readonly AuthMembership[],
  activeTeamId: string,
): readonly TeamOptionView[] {
  return memberships.map((membership) => ({
    teamId: membership.teamId,
    name: membership.teamName,
    detail: membership.seasonName,
    isActive: membership.teamId === activeTeamId,
  }));
}

/**
 * Whether the switcher is worth showing at all. One team is not a choice, so
 * the control collapses entirely rather than adding a dead affordance to the
 * shell — the team's name still shows wherever the shell already shows it.
 */
export function canSwitchTeams(memberships: readonly AuthMembership[]): boolean {
  return memberships.length > 1;
}
