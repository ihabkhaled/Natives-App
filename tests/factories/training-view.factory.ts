import { vi } from 'vitest';

import type {
  ReviewDetailPanelView,
  TrainingBuddyEditorView,
  TrainingComposerView,
  TrainingDetailView,
  TrainingEvidenceEditorView,
  TrainingWorkspaceView,
} from '@/modules/training/types/training-view.types';

function screenCopy() {
  return {
    loadingLabel: 'Loading training…',
    errorTitle: 'Training did not load',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect.',
    offlineNoticeLabel: 'Reconnect.',
    isOffline: false,
    forbiddenTitle: 'Not available to you',
    forbiddenMessage: 'No permission.',
    emptyTitle: 'No training logged yet',
    emptyMessage: 'Log your first session.',
  };
}

export function buildEvidenceEditorView(
  overrides: Partial<TrainingEvidenceEditorView> = {},
): TrainingEvidenceEditorView {
  return {
    heading: 'Evidence',
    intro: 'Attach a link.',
    privacyNotice: 'Only the reference is stored here.',
    kindLabel: 'Evidence type',
    kindValue: 'link',
    kindOptions: [{ value: 'link', label: 'Link' }],
    referenceLabel: 'Reference',
    referenceValue: '',
    descriptionLabel: 'Description',
    descriptionValue: '',
    addLabel: 'Add evidence',
    removeLabel: 'Remove evidence',
    emptyLabel: 'No evidence attached yet.',
    items: [],
    canAdd: false,
    onKindChange: vi.fn(),
    onReferenceChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
}

export function buildBuddyEditorView(
  overrides: Partial<TrainingBuddyEditorView> = {},
): TrainingBuddyEditorView {
  return {
    heading: 'Training buddies',
    intro: 'Name who trained with you.',
    addFieldLabel: 'Add a buddy',
    addLabel: 'Add buddy',
    removeLabel: 'Remove buddy',
    emptyLabel: 'No buddies on this session.',
    value: '',
    options: [{ value: 'm-2', label: 'Sara' }],
    selected: [],
    canAdd: false,
    onValueChange: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
}

export function buildComposerView(
  overrides: Partial<TrainingComposerView> = {},
): TrainingComposerView {
  return {
    heading: 'Log a session',
    intro: 'Pick the activity.',
    typeLabel: 'Activity type',
    typePlaceholder: 'Choose an activity',
    typeValue: '',
    typeOptions: [
      {
        value: 'type-gym',
        label: 'Gym — 5 candidate points',
        candidateLabel: '5 candidate points',
        hasCandidate: true,
        requiresEvidence: false,
        durationBoundsLabel: '20–180 min',
      },
    ],
    dateLabel: 'Date performed',
    dateValue: '',
    dateMax: '2026-07-21',
    dateLocale: 'en',
    durationLabel: 'Duration (minutes)',
    durationValue: '',
    durationHint: null,
    quantityLabel: 'Measured amount',
    quantityValue: '',
    showsQuantity: false,
    notesLabel: 'Notes',
    notesPlaceholder: 'What did the session cover?',
    notesValue: '',
    candidateHeading: 'Candidate points',
    candidateLabel: 'Pending',
    candidateHint: 'No approved point value yet.',
    candidateNotice: 'Candidate only.',
    hasCandidate: false,
    evidence: buildEvidenceEditorView(),
    buddies: buildBuddyEditorView(),
    saveLabel: 'Save draft',
    isSaving: false,
    canSave: false,
    validationMessage: null,
    onTypeChange: vi.fn(),
    onDateChange: vi.fn(),
    onDurationChange: vi.fn(),
    onQuantityChange: vi.fn(),
    onNotesChange: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
}

export function buildTrainingWorkspaceView(
  overrides: Partial<TrainingWorkspaceView> = {},
): TrainingWorkspaceView {
  return {
    ...screenCopy(),
    title: 'External training',
    subtitle: 'Log the work you do away from team practice.',
    status: 'ready',
    composer: buildComposerView(),
    listLabel: 'External training',
    countLabel: '1 of 1 submissions',
    statusFilterLabel: 'Status',
    statusFilter: 'all',
    statusOptions: [{ value: 'all', label: 'All' }],
    items: [
      {
        id: 'sub-1',
        typeName: 'Gym',
        dateLabel: '10 Jul 2026',
        durationLabel: '45 minutes',
        statusLabel: 'Submitted',
        statusTone: 'primary',
        evidenceLabel: '0 attached',
        buddyLabel: '1/2',
        openLabel: 'Open',
      },
    ],
    hasMatches: true,
    noMatchesTitle: 'Queue is clear',
    noMatchesMessage: 'Nothing waiting.',
    onStatusFilterChange: vi.fn(),
    onOpen: vi.fn(),
    ...overrides,
  };
}

export function buildTrainingDetailView(
  overrides: Partial<TrainingDetailView> = {},
): TrainingDetailView {
  return {
    ...screenCopy(),
    title: 'Training submission',
    backLabel: 'Back to external training',
    status: 'ready',
    notFoundTitle: 'Submission not found',
    notFoundMessage: 'It no longer exists.',
    typeName: 'Gym',
    dateLabel: '10 Jul 2026',
    durationLabel: '45 minutes',
    notes: 'Squats',
    statusLabel: 'Submitted',
    statusTone: 'primary',
    candidateLabel: '5 candidate points',
    candidateNotice: 'Candidate only.',
    changesBanner: null,
    reviewNoteHeading: 'Reviewer note',
    reviewNote: null,
    evidenceHeading: 'Evidence',
    evidenceEmptyLabel: 'No evidence attached yet.',
    evidencePrivacyNotice: 'Only the reference is stored here.',
    evidence: [],
    buddiesHeading: 'Training buddies',
    buddiesEmptyLabel: 'No buddies on this session.',
    buddies: [],
    historyHeading: 'History',
    historyIntro: 'Every state this claim has been through.',
    historyEmptyLabel: 'Nothing has happened yet.',
    history: [],
    actions: [],
    onBack: vi.fn(),
    ...overrides,
  };
}

export function buildReviewPanelView(
  overrides: Partial<ReviewDetailPanelView> = {},
): ReviewDetailPanelView {
  return {
    typeName: 'Gym',
    dateLabel: '10 Jul 2026',
    durationLabel: '45 minutes',
    notes: null,
    statusLabel: 'Submitted',
    statusTone: 'primary',
    evidenceLabel: '1 attached',
    buddyLabel: 'Training buddies',
    signalsHeading: 'Things worth a look',
    signalsIntro: 'Advisory prompts only.',
    signalsNoneLabel: 'Nothing stood out.',
    signals: [],
    decisionHeading: 'Decision',
    noteLabel: 'Note to the member',
    notePlaceholder: 'Explain the decision.',
    noteValue: '',
    noteError: null,
    selfBlockedNotice: null,
    actions: [],
    onNoteChange: vi.fn(),
    ...overrides,
  };
}
