import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import type { TrainingBuddy } from '../types/training.types';
import { buildBuddySection, type BuildBuddySectionParams } from './buddy-view.helper';

const t = (key: string, params?: object): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

function buddy(overrides: Partial<TrainingBuddy> = {}): TrainingBuddy {
  return {
    id: 'buddy-1',
    submissionId: '20000000-0000-4000-8000-000000000004',
    membershipId: 'membership-natives-1',
    status: 'pending',
    respondedAtIso: null,
    createdAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

function params(overrides: Partial<BuildBuddySectionParams> = {}): BuildBuddySectionParams {
  return {
    t,
    locale: 'en',
    page: { items: [buddy()], total: 1 },
    isLoading: false,
    error: null,
    busyBuddyId: null,
    busyIntent: null,
    onConfirm: vi.fn(),
    onDecline: vi.fn(),
    ...overrides,
  };
}

describe('buildBuddySection', () => {
  it('badges only the credits still waiting on an answer', () => {
    const section = buildBuddySection(
      params({
        page: {
          items: [
            buddy(),
            buddy({
              id: 'buddy-2',
              status: 'confirmed',
              respondedAtIso: '2026-07-11T10:00:00.000Z',
            }),
          ],
          total: 2,
        },
      }),
    );

    expect(section.countBadge).toContain('training.buddyCountLabel');
    expect(section.countBadge).toContain('"count":1');
    expect(section.items[0]?.isPending).toBe(true);
    expect(section.items[1]?.isPending).toBe(false);
    expect(section.items[1]?.statusTone).toBe('success');
    expect(section.items[1]?.respondedLabel).toContain('training.buddyRespondedLabel');
  });

  it('drops the badge entirely when nothing is pending', () => {
    const section = buildBuddySection(
      params({ page: { items: [buddy({ status: 'declined' })], total: 1 } }),
    );

    expect(section.countBadge).toBeNull();
    expect(section.items[0]?.statusTone).toBe('medium');
    expect(section.items[0]?.respondedLabel).toBeNull();
  });

  it('marks only the busy row as confirming or declining', () => {
    const confirming = buildBuddySection(params({ busyBuddyId: 'buddy-1', busyIntent: 'confirm' }));
    expect(confirming.items[0]?.isConfirming).toBe(true);
    expect(confirming.items[0]?.isDeclining).toBe(false);

    const declining = buildBuddySection(params({ busyBuddyId: 'buddy-1', busyIntent: 'decline' }));
    expect(declining.items[0]?.isDeclining).toBe(true);
  });

  it('shows loading, honest-empty, and unavailable shells', () => {
    const loading = buildBuddySection(params({ page: undefined, isLoading: true }));
    expect(loading.isLoading).toBe(true);
    expect(loading.items).toEqual([]);

    const failed = buildBuddySection(
      params({ page: undefined, error: new AppError({ code: APP_ERROR_CODE.Server }) }),
    );
    expect(failed.unavailableMessage).toBe('training.buddyUnavailable');
    expect(failed.countBadge).toBeNull();
  });
});
