import { describe, expect, it } from 'vitest';

import {
  mapAchievement,
  mapAchievementsPage,
  mapImportReport,
  mapTeamHistoryPage,
} from './achievements.mapper';

const dto = {
  achievementId: 'a1',
  teamId: 't1',
  seasonId: 's1',
  competitionId: null,
  membershipId: 'm1',
  category: 'trophy' as const,
  title: 'Champions',
  description: null,
  achievedOn: '2026-06-20',
  evidenceReference: null,
  visibility: 'public' as const,
  status: 'approved' as const,
  source: 'manual' as const,
  importReference: null,
  rejectionReason: null,
  recordVersion: 2,
  createdBy: null,
  approvedBy: 'admin',
  approvedAt: '2026-06-25T09:00:00.000Z',
  rejectedAt: null,
  archivedAt: null,
  createdAt: '2026-06-20T09:00:00.000Z',
  updatedAt: '2026-06-25T09:00:00.000Z',
};

describe('achievements mappers', () => {
  it('maps a claim, carrying the approval provenance', () => {
    expect(mapAchievement(dto)).toMatchObject({
      achievementId: 'a1',
      approvedBy: 'admin',
      approvedAtIso: '2026-06-25T09:00:00.000Z',
    });
  });

  it('maps a bounded achievements page', () => {
    const page = mapAchievementsPage({ items: [dto], total: 1, limit: 20, offset: 0 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it('maps an import report with its per-row outcomes', () => {
    const report = mapImportReport({
      dryRun: true,
      received: 2,
      imported: 1,
      skippedDuplicate: 1,
      rejectedInvalid: 0,
      rows: [
        { reference: 'A', outcome: 'imported', achievementId: null },
        { reference: 'B', outcome: 'skipped_duplicate', achievementId: null },
      ],
    });
    expect(report.rows).toHaveLength(2);
    expect(report.dryRun).toBe(true);
  });

  it('maps a privacy-projected cabinet page', () => {
    const page = mapTeamHistoryPage({
      items: [
        {
          achievementId: 'a1',
          seasonId: 's1',
          competitionId: null,
          membershipId: null,
          category: 'trophy',
          title: 'Champions',
          achievedOn: '2026-06-20',
          visibility: 'public',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
    expect(page.items[0]).toMatchObject({ achievementId: 'a1', title: 'Champions' });
  });
});
