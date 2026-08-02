import type { Achievement } from '@/modules/standings/types/achievements.types';
import type {
  RecordManualStandingCommand,
  StandingRow,
} from '@/modules/standings/types/standings.types';
import type {
  AchievementFormView,
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

/**
 * A derived standings row for the two helper specs that build one.
 *
 * Both declared a byte-identical copy of this literal. Defaults describe a
 * derived row with no manual provenance; the provenance spec overrides
 * `source`, `sourceReference` and `reconciliationNote` to exercise the manual
 * path.
 */
export function buildStandingRow(overrides: Partial<StandingRow> = {}): StandingRow {
  return {
    standingId: 's1',
    seasonId: 'se1',
    competitionId: 'c1',
    stageId: null,
    ruleVersionId: 'rv1',
    poolLabel: null,
    entrantKind: 'opponent',
    opponentId: 'o1',
    opponentName: 'Giza',
    played: 5,
    wins: 3,
    losses: 2,
    ties: 0,
    pointsFor: 60,
    pointsAgainst: 55,
    standingPoints: 9,
    spiritScore: null,
    finalPlace: 2,
    qualification: 'undecided',
    source: 'derived',
    sourceReference: null,
    reconciliationNote: null,
    recordVersion: 1,
    recordedBy: 'coach',
    computedAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

/**
 * The achievement create/edit form view.
 *
 * Forty fields, spelled out identically in the standings component and screen
 * specs. Callers override only what their assertion is about.
 */
export function buildAchievementFormView(
  overrides: Partial<AchievementFormView> = {},
): AchievementFormView {
  const noop = (): void => undefined;
  return {
    heading: 'Create',
    titleLabel: 'Title',
    titleValue: '',
    onTitleChange: noop,
    categoryLabel: 'Category',
    categoryValue: 'trophy',
    categoryOptions: [{ value: 'trophy', label: 'Trophy' }],
    onCategoryChange: noop,
    dateLabel: 'Date',
    dateValue: '',
    dateDisplayValue: '',
    datePlaceholder: 'pick',
    dateOpenLabel: 'open',
    dateDialogTitle: 'title',
    dateCloseLabel: 'close',
    isDateOpen: false,
    onDateOpen: noop,
    onDateDismiss: noop,
    onDateChange: noop,
    memberLabel: 'Member',
    memberValue: 'none',
    memberOptions: [{ value: 'none', label: 'Team' }],
    onMemberChange: noop,
    descriptionLabel: 'Description',
    descriptionValue: '',
    onDescriptionChange: noop,
    evidenceLabel: 'Evidence',
    evidenceValue: '',
    onEvidenceChange: noop,
    visibilityLabel: 'Visibility',
    visibilityHint: 'hint',
    visibilityValue: 'team',
    visibilityOptions: [{ value: 'team', label: 'Team' }],
    onVisibilityChange: noop,
    validationMessage: 'bad',
    submitLabel: 'Create',
    cancelLabel: 'Cancel',
    canSubmit: false,
    isSaving: false,
    onSubmit: noop,
    onCancel: noop,
    ...overrides,
  };
}

/**
 * A domain achievement. Both standings helper specs declared this literal;
 * they differed only in `status`, so that stays an ordinary override.
 */
export function buildAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    achievementId: 'a1',
    seasonId: null,
    competitionId: null,
    membershipId: null,
    category: 'trophy',
    title: 'Champions',
    description: null,
    achievedOn: '2026-06-20',
    evidenceReference: null,
    visibility: 'public',
    status: 'draft',
    source: 'manual',
    importReference: null,
    rejectionReason: null,
    recordVersion: 1,
    approvedBy: null,
    approvedAtIso: null,
    ...overrides,
  };
}

/**
 * A minimal valid manual-standing command, written out identically by the
 * standings gateway and service specs.
 */
export function buildManualStandingCommand(
  overrides: Partial<RecordManualStandingCommand> = {},
): RecordManualStandingCommand {
  return {
    competitionId: 'c1',
    entrantKind: 'team',
    opponentId: null,
    played: 1,
    wins: 1,
    losses: 0,
    ties: 0,
    pointsFor: 15,
    pointsAgainst: 10,
    spiritScore: null,
    finalPlace: null,
    qualification: null,
    sourceReference: null,
    reconciliationNote: 'note',
    ruleKey: 'league',
    ...overrides,
  };
}
