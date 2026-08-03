import type {
  MeetingCardView,
  TaskCardView,
} from '@/modules/governance/types/governance-view.types';

/** One approved, board-only meeting with decisions on record. */
export function buildMeetingCardView(overrides: Partial<MeetingCardView> = {}): MeetingCardView {
  return {
    id: 'meeting-1',
    title: 'Season 26/27 kickoff',
    statusLabel: 'Approved',
    visibilityLabel: 'Visible to',
    visibilityCaption: 'Board only',
    scheduledLabel: 'Scheduled for',
    scheduledAt: '2026-09-01T17:00:00.000Z',
    decisionsLabel: 'Decisions',
    decisions: ['Approve the kit order'],
    minutesLabel: 'Minutes approved',
    isMinutesApproved: true,
    ...overrides,
  };
}

/** One urgent, open task that nothing is blocking. */
export function buildTaskCardView(overrides: Partial<TaskCardView> = {}): TaskCardView {
  return {
    id: 'task-1',
    title: 'Place the kit order',
    description: 'Confirm sizes before ordering.',
    priorityLabel: 'Urgent',
    statusLabel: 'Open',
    dueLabel: 'Due',
    dueDate: '2026-09-15',
    blockedNotice: null,
    isClosed: false,
    ...overrides,
  };
}
