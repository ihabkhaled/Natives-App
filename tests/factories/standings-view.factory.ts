import type {
  AchievementsScreenView,
  TeamHistoryScreenView,
} from '@/modules/standings/types/achievements-view.types';
import type {
  StandingsRulesScreenView,
  StandingsScreenView,
} from '@/modules/standings/types/standings-view.types';

const noop = (): void => undefined;

/** The shared async/guard/empty copy block every standings screen renders. */
function buildStandingsScreenCopyStub(): {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly offlineNoticeLabel: string;
  readonly isOffline: boolean;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
} {
  return {
    loadingLabel: 'Loading',
    errorTitle: 'Error',
    errorMessage: 'Failed',
    retryLabel: 'Retry',
    onRetry: noop,
    offlineTitle: 'Offline',
    offlineMessage: 'Offline',
    offlineNoticeLabel: 'Offline',
    isOffline: false,
    forbiddenTitle: 'No access',
    forbiddenMessage: 'No access',
    emptyTitle: 'Empty',
    emptyMessage: 'Empty',
  };
}

export function buildStandingsScreenView(
  overrides: Partial<StandingsScreenView> = {},
): StandingsScreenView {
  return {
    ...buildStandingsScreenCopyStub(),
    status: 'ready',
    title: 'Standings',
    subtitle: 'sub',
    competitionLabel: 'Competition',
    competitionValue: 'c1',
    competitionOptions: [{ value: 'c1', label: 'League' }],
    onCompetitionChange: noop,
    sourceLabel: 'Source',
    sourceValue: 'all',
    sourceOptions: [{ value: 'all', label: 'All' }],
    onSourceChange: noop,
    tableCaption: 'Table',
    columns: {
      place: '#',
      entrant: 'Entrant',
      played: 'P',
      wins: 'W',
      losses: 'L',
      ties: 'T',
      pointsFor: 'PF',
      pointsAgainst: 'PA',
      diff: '±',
      points: 'Pts',
      spirit: 'Spirit',
      qualification: 'Status',
    },
    rows: [
      {
        key: 's1',
        place: '1',
        entrantLabel: 'Our team',
        isOurTeam: true,
        played: '5',
        wins: '4',
        losses: '1',
        ties: '0',
        pointsFor: '60',
        pointsAgainst: '40',
        diff: '+20',
        points: '12',
        spirit: '—',
        qualification: null,
        qualificationMutedLabel: 'Undecided',
        sourceBadge: null,
        provenance: null,
      },
    ],
    diffDerivedNote: 'diff note',
    ruleFooter: 'Computed under League v2.',
    rulesLinkLabel: 'View rules',
    onOpenRules: noop,
    recomputeBanner: null,
    manage: null,
    ...overrides,
  };
}

export function buildStandingsRulesScreenView(
  overrides: Partial<StandingsRulesScreenView> = {},
): StandingsRulesScreenView {
  return {
    ...buildStandingsScreenCopyStub(),
    status: 'ready',
    title: 'Rules',
    subtitle: 'sub',
    immutableNotice: 'never edited',
    families: [
      {
        key: 'league',
        newest: {
          key: 'rv2',
          heading: 'League v2',
          statusChip: { label: 'Active', tone: 'success' },
          points: ['Win 3'],
          tieBreakChips: ['Standing points'],
          effectiveFrom: 'June',
        },
        older: [],
        olderLabel: null,
      },
    ],
    formToggleLabel: null,
    isFormOpen: false,
    onToggleForm: noop,
    form: null,
    savedBanner: null,
    ...overrides,
  };
}

export function buildTeamHistoryScreenView(
  overrides: Partial<TeamHistoryScreenView> = {},
): TeamHistoryScreenView {
  return {
    ...buildStandingsScreenCopyStub(),
    status: 'ready',
    title: 'Cabinet',
    subtitle: 'sub',
    categoryFilterLabel: 'Category',
    categoryFilterValue: 'all',
    categoryFilterOptions: [{ value: 'all', label: 'All' }],
    onCategoryFilterChange: noop,
    seasons: [
      {
        key: 's1',
        heading: 'Season 2026',
        entries: [
          {
            key: 'a1',
            iconName: 'trophy',
            title: 'Champions',
            achievedOn: 'June',
            categoryLabel: 'Trophy',
            memberName: null,
          },
        ],
      },
    ],
    countLabel: '1 of 1',
    loadMoreLabel: null,
    onLoadMore: noop,
    manageLink: null,
    onOpenManage: noop,
    ...overrides,
  };
}

export function buildAchievementsScreenView(
  overrides: Partial<AchievementsScreenView> = {},
): AchievementsScreenView {
  return {
    ...buildStandingsScreenCopyStub(),
    status: 'ready',
    title: 'Achievements',
    subtitle: 'sub',
    statusFilterLabel: 'Status',
    statusFilterValue: 'all',
    statusFilterOptions: [{ value: 'all', label: 'All' }],
    onStatusFilterChange: noop,
    categoryFilterLabel: 'Category',
    categoryFilterValue: 'all',
    categoryFilterOptions: [{ value: 'all', label: 'All' }],
    onCategoryFilterChange: noop,
    cards: [
      {
        key: 'a1',
        iconName: 'trophy',
        title: 'Champions',
        achievedOn: 'June',
        subject: 'Our team',
        statusChip: { label: 'Draft', tone: 'medium' },
        visibilityChip: { label: 'Public', tone: 'tertiary' },
        sourceTag: 'Manual',
        onOpen: noop,
      },
    ],
    createLabel: null,
    onOpenCreate: noop,
    form: null,
    detail: null,
    importLabel: null,
    onOpenImport: noop,
    importWizard: null,
    banner: null,
    ...overrides,
  };
}
