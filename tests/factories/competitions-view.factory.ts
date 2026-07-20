import type {
  AvailabilityPanelView,
  CandidateRowView,
  EligibilityPanelView,
  OverrideDialogView,
  RosterPanelView,
  SquadCardView,
  SquadsListView,
} from '@/modules/competitions/types/competitions-view.types';
import type {
  CandidatePanelView,
  ConversionPanelView,
  DecisionPanelView,
  EvaluationPanelView,
  RestrictedBlockView,
  TryoutDetailView,
} from '@/modules/tryouts/types/tryouts-view.types';

/** A handler the component may call but the assertion does not observe. */
const NOOP = (): void => {
  // intentionally inert in view-model fixtures
};

const ASYNC_COPY = {
  loadingLabel: 'Loading',
  errorTitle: 'Error',
  errorMessage: 'Error message',
  retryLabel: 'Retry',
  onRetry: NOOP,
  offlineTitle: 'Offline',
  offlineMessage: 'Offline message',
  offlineNoticeLabel: 'Offline message',
  isOffline: false,
  forbiddenTitle: 'Forbidden',
  forbiddenMessage: 'Forbidden message',
  emptyTitle: 'Empty',
  emptyMessage: 'Empty message',
};

/** Prepared view models for UI-only component tests. */
function buildSquadCardView(overrides: Partial<SquadCardView> = {}): SquadCardView {
  return {
    id: 'squad-1',
    name: 'League squad',
    statusLabel: 'Draft',
    statusTone: 'medium',
    revisionLabel: 'Revision 1',
    deadlineLabel: 'No deadline set',
    thresholdLabel: 'Attendance threshold: 70%',
    openLabel: 'Open squad',
    ...overrides,
  };
}

export function buildSquadsListView(overrides: Partial<SquadsListView> = {}): SquadsListView {
  return {
    ...ASYNC_COPY,
    title: 'Season squads',
    subtitle: 'Selection and availability',
    status: 'ready',
    countLabel: 'Showing 1 of 1 squads',
    statusFilterLabel: 'Status',
    statusFilter: 'all',
    statusOptions: [{ value: 'all', label: 'All' }],
    items: [buildSquadCardView()],
    hasMatches: true,
    noMatchesTitle: 'No squads match this filter',
    noMatchesMessage: 'Clear the status filter.',
    onStatusFilterChange: NOOP,
    onOpen: NOOP,
    ...overrides,
  };
}

export function buildCandidateRowView(overrides: Partial<CandidateRowView> = {}): CandidateRowView {
  return {
    membershipId: 'm-1',
    fullName: 'Omar Hassan',
    attendanceLabel: '92%',
    availabilityLabel: 'Available',
    jerseyLabel: '7',
    overallLabel: 'Meets policy',
    overallTone: 'success',
    signals: [
      { key: 'attendance', label: 'Attendance', statusLabel: 'Meets policy', tone: 'success' },
    ],
    isSelected: false,
    selectedBadge: 'In squad',
    needsOverride: false,
    overrideHint: null,
    actionLabel: 'Select',
    isActionDisabled: false,
    ...overrides,
  };
}

export function buildOverrideDialogView(
  overrides: Partial<OverrideDialogView> = {},
): OverrideDialogView {
  return {
    heading: 'Coach override',
    intro: 'Below policy.',
    candidateName: 'Youssef Adel',
    reasonLabel: 'Override reason',
    reasonPlaceholder: 'Why?',
    reasonValue: '',
    validationMessage: 'Give a reason of at least 5 characters.',
    confirmLabel: 'Select with override',
    cancelLabel: 'Cancel',
    canConfirm: false,
    isSaving: false,
    onReasonChange: NOOP,
    onConfirm: NOOP,
    onCancel: NOOP,
    ...overrides,
  };
}

export function buildEligibilityPanelView(
  overrides: Partial<EligibilityPanelView> = {},
): EligibilityPanelView {
  return {
    heading: 'Eligibility signals and selection',
    intro: 'Signals describe the policy.',
    advisoryNotice: 'Advisory inputs only.',
    emptyLabel: 'No candidates are in scope yet.',
    lockedNotice: null,
    rows: [buildCandidateRowView()],
    ratioHeading: 'Selected squad balance',
    ratioFacts: [{ key: 'men', label: 'Men', value: '1' }],
    ratioVerdict: 'Within the division ratio',
    override: null,
    onToggle: NOOP,
    ...overrides,
  };
}

export function buildAvailabilityPanelView(
  overrides: Partial<AvailabilityPanelView> = {},
): AvailabilityPanelView {
  return {
    heading: 'My availability',
    intro: 'Tell the coach.',
    windowNotice: null,
    valueLabel: 'Availability',
    value: 'available',
    options: [{ value: 'available', label: 'Available' }],
    reasonLabel: 'Reason',
    reasonPlaceholder: 'Anything to know',
    reasonValue: '',
    submitLabel: 'Save availability',
    isSaving: false,
    emptyLabel: 'Nobody has declared availability yet.',
    rows: [],
    onValueChange: NOOP,
    onReasonChange: NOOP,
    onSubmit: NOOP,
    ...overrides,
  };
}

export function buildRosterPanelView(overrides: Partial<RosterPanelView> = {}): RosterPanelView {
  return {
    heading: 'Match-day roster preview',
    intro: 'Every selected player.',
    pendingNotice: 'Validation and lock state live on the roster screens.',
    exportNote: 'Abbreviations are expanded.',
    emptyLabel: 'No player has been selected yet.',
    columns: ['Player', 'Jersey number'],
    rows: [],
    ...overrides,
  };
}

export function buildRestrictedBlockView(
  overrides: Partial<RestrictedBlockView> = {},
): RestrictedBlockView {
  return {
    heading: 'Contact details',
    isPermitted: false,
    restrictedTitle: 'Contact details are restricted',
    restrictedMessage: 'Only staff with the grant can read these.',
    notice: 'Each read is audited.',
    facts: [],
    ...overrides,
  };
}

export function buildEvaluationPanelView(
  overrides: Partial<EvaluationPanelView> = {},
): EvaluationPanelView {
  return {
    heading: 'Evaluation',
    intro: 'Score what you observed.',
    rows: [
      {
        criterion: 'throwing',
        label: 'Throwing',
        value: '',
        options: [{ value: '', label: 'Not scored' }],
        onChange: NOOP,
      },
    ],
    noteLabel: 'Evaluator note',
    notePlaceholder: 'What did you observe?',
    noteValue: '',
    submitLabel: 'Save evaluation',
    isSaving: false,
    forbiddenNotice: null,
    onNoteChange: NOOP,
    onSubmit: NOOP,
    ...overrides,
  };
}

export function buildDecisionPanelView(
  overrides: Partial<DecisionPanelView> = {},
): DecisionPanelView {
  return {
    heading: 'Decision and offer',
    intro: 'Decisions are visible to the candidate.',
    currentLabel: null,
    offerExpiryLabel: null,
    reasonLabel: 'Decision reason',
    reasonPlaceholder: 'Why this decision?',
    reasonValue: '',
    validationMessage: 'A reason is required.',
    actions: [],
    isSaving: false,
    forbiddenNotice: null,
    onReasonChange: NOOP,
    ...overrides,
  };
}

export function buildConversionPanelView(
  overrides: Partial<ConversionPanelView> = {},
): ConversionPanelView {
  return {
    heading: 'Convert to member',
    intro: 'Review the preview.',
    previewHeading: 'Conversion preview',
    previewFacts: [{ key: 'name', label: 'Full name', value: 'Candidate One' }],
    accountNotice: 'A new membership invitation will be created.',
    confirmLabel: 'Convert to member',
    isSaving: false,
    blockedNotice: null,
    forbiddenNotice: null,
    onConfirm: NOOP,
    ...overrides,
  };
}

export function buildCandidatePanelView(
  overrides: Partial<CandidatePanelView> = {},
): CandidatePanelView {
  return {
    heading: 'Candidate One',
    referenceLabel: 'Reference: UN-2026-0001',
    statusLabel: 'Registered',
    statusTone: 'primary',
    consentLabel: 'Consent version tryout-consent-v1',
    contacts: buildRestrictedBlockView(),
    readiness: buildRestrictedBlockView({ heading: 'Readiness and health notes' }),
    evaluation: buildEvaluationPanelView(),
    decision: buildDecisionPanelView(),
    conversion: buildConversionPanelView(),
    ...overrides,
  };
}

export function buildTryoutDetailView(overrides: Partial<TryoutDetailView> = {}): TryoutDetailView {
  return {
    ...ASYNC_COPY,
    title: 'Tryout event',
    backLabel: 'Back to tryouts',
    status: 'ready',
    backendPendingNotice: 'The tryouts service is not deployed yet.',
    heading: 'Autumn intake',
    statusLabel: 'Registration open',
    statusTone: 'success',
    facts: [{ key: 'held', label: 'Held on', value: '15 Aug' }],
    candidatesHeading: 'Candidates',
    candidatesIntro: 'Contacts never appear here.',
    candidatesEmptyLabel: 'No candidate has registered yet.',
    statusFilterLabel: 'Candidate status',
    statusFilter: 'all',
    statusOptions: [{ value: 'all', label: 'All' }],
    countLabel: 'Showing 0 of 0 candidates',
    rows: [],
    selectPrompt: 'Pick a candidate to review their tryout.',
    panel: null,
    onStatusFilterChange: NOOP,
    onSelect: NOOP,
    onCheckIn: NOOP,
    onBack: NOOP,
    ...overrides,
  };
}
