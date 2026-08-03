import { describe, expect, it } from 'vitest';

import { MOCK_GOVERNANCE_MEETINGS, MOCK_GOVERNANCE_TASKS } from '@/tests/msw/governance.fixture';

import type { GovernanceMeeting, GovernanceTask } from '../types/governance.types';
import {
  buildMeetingCardViews,
  buildTaskCardViews,
  resolveMeetingsPage,
  resolveTasksPage,
} from './governance-view.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

function meeting(overrides: Partial<GovernanceMeeting> = {}): GovernanceMeeting {
  return { ...MOCK_GOVERNANCE_MEETINGS[0], ...overrides } as GovernanceMeeting;
}

function task(overrides: Partial<GovernanceTask> = {}): GovernanceTask {
  return { ...MOCK_GOVERNANCE_TASKS[0], ...overrides } as GovernanceTask;
}

describe('buildMeetingCardViews', () => {
  it('lists meetings soonest first', () => {
    const cards = buildMeetingCardViews(t, MOCK_GOVERNANCE_MEETINGS);

    expect(cards.map((card) => card.id)).toEqual(['meeting-2', 'meeting-1']);
  });

  it('treats minutes as settled only once they are approved, not when minuted', () => {
    const [pending] = buildMeetingCardViews(t, [
      meeting({ status: 'minuted', minutesApprovedAt: null }),
    ]);

    expect(pending?.isMinutesApproved).toBe(false);
    expect(pending?.minutesLabel).toBe('t:governance.minutesPending');
  });

  it('reports approved minutes when the approval timestamp is present', () => {
    const [approved] = buildMeetingCardViews(t, [
      meeting({ minutesApprovedAt: '2026-09-03T09:00:00.000Z' }),
    ]);

    expect(approved?.isMinutesApproved).toBe(true);
    expect(approved?.minutesLabel).toBe('t:governance.minutesApproved');
  });

  it('says so plainly when a meeting recorded no decisions', () => {
    const [card] = buildMeetingCardViews(t, [meeting({ decisions: [] })]);

    expect(card?.decisionsLabel).toBe('t:governance.noDecisions');
    expect(card?.decisions).toEqual([]);
  });

  it('names who each meeting is visible to', () => {
    const [card] = buildMeetingCardViews(t, [meeting({ visibility: 'board' })]);

    expect(card?.visibilityCaption).toBe('t:governance.visibilityBoard');
  });
});

describe('buildTaskCardViews', () => {
  it('puts open work ahead of closed work', () => {
    const cards = buildTaskCardViews(t, MOCK_GOVERNANCE_TASKS);

    expect(cards.map((card) => card.id)).toEqual(['task-1', 'task-2', 'task-3']);
    expect(cards.at(-1)?.isClosed).toBe(true);
  });

  it('orders open work by urgency', () => {
    const cards = buildTaskCardViews(t, [
      task({ taskId: 'low', priority: 'low' }),
      task({ taskId: 'urgent', priority: 'urgent' }),
      task({ taskId: 'normal', priority: 'normal' }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(['urgent', 'normal', 'low']);
  });

  it('says a task waits on another so the board chases the dependency', () => {
    const [blocked] = buildTaskCardViews(t, [task({ dependsOnTaskId: 'task-1' })]);

    expect(blocked?.blockedNotice).toBe('t:governance.blockedNotice');
  });

  it('leaves an unblocked task without a notice', () => {
    const [open] = buildTaskCardViews(t, [task({ dependsOnTaskId: null })]);

    expect(open?.blockedNotice).toBeNull();
  });

  it('says there is no due date rather than printing an empty one', () => {
    const [undated] = buildTaskCardViews(t, [task({ dueDate: null })]);

    expect(undated?.dueLabel).toBe('t:governance.noDueDate');
  });

  it.each(['completed', 'cancelled'] as const)('treats %s as closed', (status) => {
    const [card] = buildTaskCardViews(t, [task({ status })]);

    expect(card?.isClosed).toBe(true);
  });
});

describe('ordering edge cases', () => {
  it('sinks closed work even when it arrives first', () => {
    const cards = buildTaskCardViews(t, [
      task({ taskId: 'done', status: 'completed', priority: 'urgent' }),
      task({ taskId: 'open', status: 'open', priority: 'low' }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(['open', 'done']);
  });

  it('keeps two closed tasks in urgency order relative to each other', () => {
    const cards = buildTaskCardViews(t, [
      task({ taskId: 'low-done', priority: 'low', status: 'completed' }),
      task({ taskId: 'urgent-done', priority: 'urgent', status: 'cancelled' }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(['urgent-done', 'low-done']);
  });

  it('keeps two meetings scheduled at the same moment stable', () => {
    const cards = buildMeetingCardViews(t, [
      meeting({ meetingId: 'a', scheduledAt: '2026-09-01T17:00:00.000Z' }),
      meeting({ meetingId: 'b', scheduledAt: '2026-09-01T17:00:00.000Z' }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(['a', 'b']);
  });
});

describe('resolveMeetingsPage and resolveTasksPage', () => {
  it('report no data before the queries resolve', () => {
    expect(resolveMeetingsPage(undefined)).toEqual({ items: [], total: 0, hasData: false });
    expect(resolveTasksPage(undefined)).toEqual({ items: [], total: 0, hasData: false });
  });

  it('defaults a page that resolved missing its items or total', () => {
    // A contract drift that dropped either field must not crash the screen.
    expect(resolveTasksPage({} as never)).toMatchObject({ items: [], total: 0, hasData: true });
    expect(resolveMeetingsPage({} as never)).toMatchObject({ items: [], total: 0, hasData: true });
  });

  it('carry the server totals once they resolve', () => {
    const meetings = resolveMeetingsPage({
      items: [...MOCK_GOVERNANCE_MEETINGS],
      total: 9,
      limit: 25,
      offset: 0,
    });

    expect(meetings).toMatchObject({ total: 9, hasData: true });
    expect(
      resolveTasksPage({ items: [...MOCK_GOVERNANCE_TASKS], total: 4, limit: 25, offset: 0 }),
    ).toMatchObject({ total: 4 });
  });
});
