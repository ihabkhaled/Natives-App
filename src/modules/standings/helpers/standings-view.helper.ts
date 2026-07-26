import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { StandingQualification, StandingSource } from '../constants/standings.constants';
import type { StandingRow, StandingsRule } from '../types/standings.types';
import type {
  ChipView,
  StandingRowView,
  StandingsColumnLabels,
} from '../types/standings-view.types';
import { buildProvenanceView } from './standings-provenance.helper';

type Translate = (key: string, params?: TranslateParams) => string;

const QUALIFICATION_VIEWS: Readonly<
  Record<StandingQualification, { readonly key: string; readonly tone: string } | null>
> = {
  // Undecided is honest, not a state to alarm about — muted text, no chip.
  undecided: null,
  qualified: { key: I18N_KEYS.standings.qualificationQualified, tone: 'success' },
  eliminated: { key: I18N_KEYS.standings.qualificationEliminated, tone: 'medium' },
  promoted: { key: I18N_KEYS.standings.qualificationPromoted, tone: 'success' },
  relegated: { key: I18N_KEYS.standings.qualificationRelegated, tone: 'warning' },
};

const SOURCE_VIEWS: Readonly<
  Record<StandingSource, { readonly key: string; readonly tone: string }>
> = {
  derived: { key: I18N_KEYS.standings.sourceDerived, tone: 'medium' },
  manual: { key: I18N_KEYS.standings.sourceManual, tone: 'warning' },
  import: { key: I18N_KEYS.standings.sourceImport, tone: 'tertiary' },
};

/** The competition the standings screen is scoped to: explicit, deep-linked, or first. */
export function resolveActiveCompetitionId(
  selected: string,
  linked: string | null,
  competitions: readonly { readonly competitionId: string }[],
): string {
  if (selected !== '') {
    return selected;
  }
  if (linked !== null && linked !== '') {
    return linked;
  }
  return competitions[0]?.competitionId ?? '';
}

/** The qualification chip, or null for the muted `undecided` text. */
export function buildQualificationChip(
  t: Translate,
  qualification: StandingQualification,
): ChipView | null {
  const view = QUALIFICATION_VIEWS[qualification];
  return view === null ? null : { label: t(view.key), tone: view.tone };
}

/**
 * The provenance badge: `derived` stays subtle (no badge at all), while
 * manual and imported rows carry a visible badge whose popover explains the
 * reconciliation.
 */
export function buildSourceChip(t: Translate, source: StandingSource): ChipView | null {
  if (source === 'derived') {
    return null;
  }
  const view = SOURCE_VIEWS[source];
  return { label: t(view.key), tone: view.tone };
}

/** The entrant cell: our team highlighted, opponents by server-resolved name. */
export function resolveEntrantLabel(t: Translate, row: StandingRow): string {
  if (row.entrantKind === 'team') {
    return t(I18N_KEYS.standings.ourTeamLabel);
  }
  return row.opponentName ?? t(I18N_KEYS.standings.unknownOpponent);
}

/**
 * The signed point difference — the only client-derived number on the screen,
 * for display only and labelled as such next to the table.
 */
export function formatDiff(pointsFor: number, pointsAgainst: number): string {
  const diff = pointsFor - pointsAgainst;
  return diff > 0 ? `+${String(diff)}` : String(diff);
}

/** Spirit: null means "not scored" and renders as an em dash, never 0. */
export function formatSpirit(spiritScore: number | null): string {
  return spiritScore === null ? '—' : String(spiritScore);
}

/** One rendered row; the server's order is preserved by the caller. */
function buildStandingRowView(
  t: Translate,
  locale: string,
  row: StandingRow,
  index: number,
): StandingRowView {
  return {
    key: row.standingId,
    place: row.finalPlace === null ? String(index + 1) : String(row.finalPlace),
    entrantLabel: resolveEntrantLabel(t, row),
    isOurTeam: row.entrantKind === 'team',
    played: String(row.played),
    wins: String(row.wins),
    losses: String(row.losses),
    ties: String(row.ties),
    pointsFor: String(row.pointsFor),
    pointsAgainst: String(row.pointsAgainst),
    diff: formatDiff(row.pointsFor, row.pointsAgainst),
    points: String(row.standingPoints),
    spirit: formatSpirit(row.spiritScore),
    qualification: buildQualificationChip(t, row.qualification),
    qualificationMutedLabel: t(I18N_KEYS.standings.qualificationUndecided),
    sourceBadge: buildSourceChip(t, row.source),
    provenance: buildProvenanceView(t, locale, row),
  };
}

/** All rows, in exactly the server's sort order. */
export function buildStandingRowViews(
  t: Translate,
  locale: string,
  rows: readonly StandingRow[],
): readonly StandingRowView[] {
  return rows.map((row, index) => buildStandingRowView(t, locale, row, index));
}

/** Once-translated column headers. */
export function buildStandingsColumns(t: Translate): StandingsColumnLabels {
  return {
    place: t(I18N_KEYS.standings.columnPlace),
    entrant: t(I18N_KEYS.standings.columnEntrant),
    played: t(I18N_KEYS.standings.columnPlayed),
    wins: t(I18N_KEYS.standings.columnWins),
    losses: t(I18N_KEYS.standings.columnLosses),
    ties: t(I18N_KEYS.standings.columnTies),
    pointsFor: t(I18N_KEYS.standings.columnPointsFor),
    pointsAgainst: t(I18N_KEYS.standings.columnPointsAgainst),
    diff: t(I18N_KEYS.standings.columnDiff),
    points: t(I18N_KEYS.standings.columnPoints),
    spirit: t(I18N_KEYS.standings.columnSpirit),
    qualification: t(I18N_KEYS.standings.columnQualification),
  };
}

/**
 * The footer citing the rule version the visible page was computed under —
 * a stored table is only ever sorted by the version it cites.
 */
export function buildRuleFooter(
  t: Translate,
  rows: readonly StandingRow[],
  rules: readonly StandingsRule[],
): string {
  const citedId = rows[0]?.ruleVersionId;
  if (citedId === undefined) {
    return t(I18N_KEYS.standings.ruleFooterUnknown);
  }
  const cited = rules.find((rule) => rule.ruleVersionId === citedId);
  if (cited === undefined) {
    return t(I18N_KEYS.standings.ruleFooterUnknown);
  }
  return t(I18N_KEYS.standings.ruleFooter, {
    name: cited.name,
    version: String(cited.version),
  });
}
