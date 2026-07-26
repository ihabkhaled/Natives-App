import { describe, expect, it } from 'vitest';

import type { Achievement } from '../types/achievements.types';
import {
  buildSourceTag,
  buildStatusChip,
  buildTimeline,
  buildVisibilityChip,
  resolveCategoryIcon,
} from './achievement-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function achievement(overrides: Partial<Achievement>): Achievement {
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

describe('resolveCategoryIcon', () => {
  it('maps categories to their medal icon family', () => {
    expect(resolveCategoryIcon('trophy')).toBe('trophy');
    expect(resolveCategoryIcon('placement')).toBe('medal');
    expect(resolveCategoryIcon('participation')).toBe('ribbon');
  });
});

describe('buildStatusChip', () => {
  it('tones each approval state', () => {
    expect(buildStatusChip(t, 'approved').tone).toBe('success');
    expect(buildStatusChip(t, 'rejected').tone).toBe('danger');
    expect(buildStatusChip(t, 'submitted').tone).toBe('warning');
  });
});

describe('buildVisibilityChip', () => {
  it('marks the public (cabinet-bound) visibility distinctly', () => {
    expect(buildVisibilityChip(t, 'public').tone).toBe('tertiary');
    expect(buildVisibilityChip(t, 'staff').tone).toBe('medium');
  });
});

describe('buildSourceTag', () => {
  it('cites the import reference for imported claims', () => {
    expect(buildSourceTag(t, achievement({ source: 'import', importReference: 'IMP-9' }))).toBe(
      'standings.achievementImportReference:standings.achievementSourceImport,IMP-9',
    );
  });

  it('is the plain source label otherwise', () => {
    expect(buildSourceTag(t, achievement({ source: 'manual' }))).toBe(
      'standings.achievementSourceManual',
    );
  });
});

describe('buildTimeline', () => {
  it('lights the happy path up to the current state', () => {
    const timeline = buildTimeline(t, 'approved');
    expect(timeline).toHaveLength(4);
    const approved = timeline.find((step) => step.key === 'approved');
    expect(approved?.isCurrent).toBe(true);
    expect(approved?.isReached).toBe(true);
    expect(timeline.find((step) => step.key === 'archived')?.isReached).toBe(false);
  });

  it('renders rejection as a terminal branch', () => {
    const timeline = buildTimeline(t, 'rejected');
    expect(timeline.at(-1)?.key).toBe('rejected');
    expect(timeline.at(-1)?.isCurrent).toBe(true);
  });
});
