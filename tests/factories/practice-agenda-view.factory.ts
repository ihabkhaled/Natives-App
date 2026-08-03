import type * as AuthModule from '@/modules/auth';
import type {
  AgendaBlockRowView,
  AgendaStationRowView,
  PracticeAgendaScreenView,
} from '@/modules/practice-agenda/types/practice-agenda-view.types';
import type {
  AgendaBlock,
  AgendaStation,
} from '@/modules/practice-agenda/types/practice-agenda.types';

type TeamScope = ReturnType<typeof AuthModule.useActiveTeamScope>;
type EffectivePermissions = ReturnType<typeof AuthModule.useEffectivePermissions>;

/**
 * The active-team scope the agenda screen reads. Both agenda hook specs mock
 * the same two auth hooks, so the payloads live here rather than being
 * restated in each spec.
 */
export function buildAgendaTeamScope(isLoading = false): TeamScope {
  return {
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: null,
    teamName: 'Cairo Natives',
    isLoading,
    isError: false,
  };
}

/** A resolved, onboarded session holding exactly the grants it was given. */
export function buildAgendaGrants(permissions: readonly string[]): EffectivePermissions {
  return {
    permissions,
    accountActive: true,
    accountPending: false,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  };
}

/** One planned station on the wire. */
export function buildAgendaStation(overrides: Partial<AgendaStation> = {}): AgendaStation {
  return {
    id: 'station-1',
    blockId: 'block-1',
    drillId: null,
    groupId: null,
    coachMembershipId: null,
    position: 1,
    name: 'Under cuts',
    repetitions: null,
    target: null,
    notes: null,
    completionStatus: 'planned',
    ...overrides,
  };
}

/** One planned block on the wire; stations default to empty. */
export function buildAgendaBlock(overrides: Partial<AgendaBlock> = {}): AgendaBlock {
  return {
    id: 'block-1',
    drillId: null,
    position: 1,
    title: 'Warm-up',
    blockType: 'warmup',
    offsetMinutes: 0,
    durationMinutes: 15,
    intensity: 'low',
    repetitions: null,
    target: null,
    completionStatus: 'planned',
    completedAt: null,
    notes: null,
    coachNotes: null,
    stations: [],
    ...overrides,
  };
}

/** One station as the plan draws it. */
export function buildAgendaStationRowView(
  overrides: Partial<AgendaStationRowView> = {},
): AgendaStationRowView {
  return {
    id: 'station-1',
    blockId: 'block-1',
    name: 'Under cuts',
    detail: null,
    ...overrides,
  };
}

/** One block as the plan draws it. */
export function buildAgendaBlockRowView(
  overrides: Partial<AgendaBlockRowView> = {},
): AgendaBlockRowView {
  return {
    id: 'block-1',
    title: 'Warm-up',
    durationLabel: '15 min',
    notes: null,
    stations: [],
    ...overrides,
  };
}

/**
 * A ready agenda screen. Shared by the view, list, and row specs so a change
 * to the screen shape lands in one place rather than four.
 */
export function buildPracticeAgendaScreenView(
  overrides: Partial<PracticeAgendaScreenView> = {},
): PracticeAgendaScreenView {
  return {
    loadingLabel: 'Loading the agenda…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Unexpected error',
    retryLabel: 'Try again',
    onRetry: (): void => undefined,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    offlineNoticeLabel: 'Reconnect to load the latest data.',
    isOffline: false,
    forbiddenTitle: 'Permission needed',
    forbiddenMessage: 'Grant the required permission to use this feature.',
    emptyTitle: 'No agenda yet',
    emptyMessage: 'Add a block to start planning this session.',
    path: '/practice-sessions/session-1/agenda',
    pageTitle: 'Practice agenda',
    subtitle: 'The blocks a session runs through, and the stations inside each one.',
    status: 'ready',
    listHeading: 'Blocks',
    listIntro: 'In the order the session runs them.',
    countLabel: '1 blocks',
    moveUpLabel: 'Move up',
    moveDownLabel: 'Move down',
    removeStationLabel: 'Remove',
    canEdit: true,
    isSaving: false,
    notice: null,
    blocks: [buildAgendaBlockRowView()],
    onMoveBlock: (): void => undefined,
    onRemoveStation: (): void => undefined,
    ...overrides,
  };
}
