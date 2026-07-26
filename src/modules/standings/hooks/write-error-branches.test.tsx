import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppQueryClient, QueryClientProvider } from '@/packages/query';

import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';

import type { Achievement, AchievementImportReport } from '../types/achievements.types';
import { createAchievement } from '../services/create-achievement.service';
import { createStandingsRule } from '../services/create-standings-rule.service';
import { importAchievements } from '../services/import-achievements.service';
import { recomputeStandings } from '../services/recompute-standings.service';
import { recordManualStanding } from '../services/record-manual-standing.service';
import { transitionAchievement } from '../services/transition-achievement.service';
import { useAchievementCreate } from './use-achievement-create.hook';
import { useAchievementDetail } from './use-achievement-detail.hook';
import { useAchievementImport } from './use-achievement-import.hook';
import { useStandingsManage } from './use-standings-manage.hook';
import { useStandingsRules } from './use-standings-rules.hook';

vi.mock('../services/recompute-standings.service', () => ({ recomputeStandings: vi.fn() }));
vi.mock('../services/record-manual-standing.service', () => ({ recordManualStanding: vi.fn() }));
vi.mock('../services/create-standings-rule.service', () => ({ createStandingsRule: vi.fn() }));
vi.mock('../services/create-achievement.service', () => ({ createAchievement: vi.fn() }));
vi.mock('../services/import-achievements.service', () => ({ importAchievements: vi.fn() }));
vi.mock('../services/transition-achievement.service', () => ({ transitionAchievement: vi.fn() }));

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
    visibility: 'team',
    status: 'draft',
    source: 'manual',
    importReference: null,
    rejectionReason: null,
    recordVersion: 3,
    approvedBy: null,
    approvedAtIso: null,
    ...overrides,
  };
}

const dryRunReport: AchievementImportReport = {
  dryRun: true,
  received: 1,
  imported: 1,
  skippedDuplicate: 0,
  rejectedInvalid: 0,
  rows: [{ reference: 'REF', outcome: 'imported', achievementId: 'a1' }],
};
vi.mock('../queries/standings.query', () => ({
  buildStandingsRulesQueryOptions: () => ({
    queryKey: ['rules'],
    queryFn: () => ({ rules: [] }),
    enabled: false,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <QueryClientProvider client={createAppQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const t = (key: string): string => key;

afterEach(() => {
  vi.clearAllMocks();
});

describe('standings write error branches', () => {
  it('surfaces recompute and manual failures on the manage view', async () => {
    vi.mocked(recomputeStandings).mockRejectedValue(new Error('boom'));
    vi.mocked(recordManualStanding).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(
      () =>
        useStandingsManage(t, {
          teamId: 't1',
          canManage: true,
          isOffline: false,
          ruleOptions: [{ value: 'league', label: 'League' }],
          activeCompetitionId: 'c1',
          onBanner: vi.fn(),
        }),
      { wrapper },
    );

    act(() => result.current.manage?.onOpenRecompute());
    act(() => result.current.manage?.recomputeDialog?.onRuleChange('league'));
    act(() => result.current.manage?.recomputeDialog?.onConfirm());
    await waitFor(() => {
      expect(result.current.manage?.recomputeDialog).not.toBeNull();
    });

    act(() => result.current.manage?.onOpenManual());
    act(() => result.current.manage?.manualForm?.onNoteChange('a reconciliation note'));
    act(() => result.current.manage?.manualForm?.onRuleChange('league'));
    act(() => result.current.manage?.manualForm?.onSubmit());
    await waitFor(() => {
      expect(result.current.manage?.manualForm?.validationMessage).not.toBeNull();
    });
  });

  it('surfaces a rule publish failure', async () => {
    vi.mocked(createStandingsRule).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useStandingsRules(), { wrapper });
    act(() => {
      result.current.onToggleForm();
    });
    act(() => result.current.form?.onKeyChange('league'));
    act(() => result.current.form?.onNameChange('Rules'));
    act(() => result.current.form?.onSubmit());
    await waitFor(() => {
      expect(result.current.form?.validationMessage).not.toBeNull();
    });
  });

  it('surfaces an achievement create failure', async () => {
    vi.mocked(createAchievement).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(
      () =>
        useAchievementCreate(t, {
          teamId: 't1',
          locale: 'en',
          isOffline: false,
          members: [],
          onBanner: vi.fn(),
        }),
      { wrapper },
    );
    act(() => {
      result.current.openCreate();
    });
    act(() => result.current.form?.onTitleChange('Champions'));
    act(() => result.current.form?.onDateChange('2026-06-20'));
    act(() => result.current.form?.onSubmit());
    await waitFor(() => {
      expect(result.current.form?.validationMessage).not.toBeNull();
    });
  });

  it('surfaces an import failure', async () => {
    vi.mocked(importAchievements).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(
      () =>
        useAchievementImport(t, {
          teamId: 't1',
          isOffline: false,
          isOpen: true,
          onClose: vi.fn(),
          onCommitted: vi.fn(),
        }),
      { wrapper },
    );
    act(() => result.current?.onInputChange('REF,trophy,Champions,2026-06-20'));
    act(() => result.current?.onParse());
    await waitFor(() => {
      expect(result.current?.parseError).not.toBeNull();
    });
  });

  it('reports too-many-rows before any network call', () => {
    const { result } = renderHook(
      () =>
        useAchievementImport(t, {
          teamId: 't1',
          isOffline: false,
          isOpen: true,
          onClose: vi.fn(),
          onCommitted: vi.fn(),
        }),
      { wrapper },
    );
    const rows = Array.from({ length: 501 }, () => 'REF,trophy,T,2026-01-01').join('\n');
    act(() => result.current?.onInputChange(rows));
    act(() => result.current?.onParse());
    expect(result.current?.parseError).not.toBeNull();
  });

  it('banners an empty recompute and closes both dialogs on cancel', async () => {
    vi.mocked(recomputeStandings).mockResolvedValue({
      competitionId: 'c1',
      ruleVersionId: 'rv1',
      finalizedMatches: 0,
      entrants: 0,
    });
    const onBanner = vi.fn();
    const { result } = renderHook(
      () =>
        useStandingsManage(t, {
          teamId: 't1',
          canManage: true,
          isOffline: false,
          ruleOptions: [{ value: 'league', label: 'League' }],
          activeCompetitionId: 'c1',
          onBanner,
        }),
      { wrapper },
    );

    act(() => result.current.manage?.onOpenRecompute());
    act(() => result.current.manage?.recomputeDialog?.onConfirm());
    await waitFor(() => {
      expect(onBanner).toHaveBeenCalledWith('standings.recomputeReportEmpty');
    });

    act(() => result.current.manage?.onOpenRecompute());
    act(() => result.current.manage?.recomputeDialog?.onCancel());
    await waitFor(() => {
      expect(result.current.manage?.recomputeDialog).toBeNull();
    });

    act(() => result.current.manage?.onOpenManual());
    act(() => result.current.manage?.manualForm?.onEntrantChange('giza'));
    act(() => result.current.manage?.manualForm?.onCancel());
    await waitFor(() => {
      expect(result.current.manage?.manualForm).toBeNull();
    });
  });

  it('closes the create form on cancel after a successful save', async () => {
    vi.mocked(createAchievement).mockResolvedValue(achievement({}));
    const onBanner = vi.fn();
    const { result } = renderHook(
      () =>
        useAchievementCreate(t, {
          teamId: 't1',
          locale: 'en',
          isOffline: false,
          members: [],
          onBanner,
        }),
      { wrapper },
    );
    act(() => {
      result.current.openCreate();
    });
    act(() => result.current.form?.onDateOpen());
    act(() => result.current.form?.onDateDismiss());
    act(() => result.current.form?.onCancel());
    await waitFor(() => {
      expect(result.current.form).toBeNull();
    });
  });

  it('previews a dry-run import, commits it, and steps back', async () => {
    vi.mocked(importAchievements)
      .mockResolvedValueOnce(dryRunReport)
      .mockResolvedValueOnce({ ...dryRunReport, dryRun: false });
    const onClose = vi.fn();
    const onCommitted = vi.fn();
    const { result } = renderHook(
      () =>
        useAchievementImport(t, {
          teamId: 't1',
          isOffline: false,
          isOpen: true,
          onClose,
          onCommitted,
        }),
      { wrapper },
    );
    act(() => result.current?.onInputChange('REF,trophy,Champions,2026-06-20'));
    act(() => result.current?.onParse());
    await waitFor(() => {
      expect(result.current?.step).toBe('preview');
    });

    act(() => result.current?.onCommit());
    await waitFor(() => {
      expect(onCommitted).toHaveBeenCalled();
    });
    act(() => result.current?.onBack());
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('treats an all-blank paste as an empty parse with no error and no request', () => {
    const { result } = renderHook(
      () =>
        useAchievementImport(t, {
          teamId: 't1',
          isOffline: false,
          isOpen: true,
          onClose: vi.fn(),
          onCommitted: vi.fn(),
        }),
      { wrapper },
    );
    act(() => result.current?.onInputChange('   \n  \n'));
    act(() => result.current?.onParse());
    expect(result.current?.parseError).toBeNull();
    expect(result.current?.step).toBe('input');
    expect(importAchievements).not.toHaveBeenCalled();
  });

  it('steps back from a dry-run preview without closing the wizard', async () => {
    vi.mocked(importAchievements).mockResolvedValue(dryRunReport);
    const onClose = vi.fn();
    const { result } = renderHook(
      () =>
        useAchievementImport(t, {
          teamId: 't1',
          isOffline: false,
          isOpen: true,
          onClose,
          onCommitted: vi.fn(),
        }),
      { wrapper },
    );
    act(() => result.current?.onInputChange('REF,trophy,Champions,2026-06-20'));
    act(() => result.current?.onParse());
    await waitFor(() => {
      expect(result.current?.step).toBe('preview');
    });
    // Back from a dry-run preview returns to input without closing the wizard.
    act(() => result.current?.onBack());
    await waitFor(() => {
      expect(result.current?.step).toBe('input');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('drives the approval flow: submit, arm, confirm, cancel, close', async () => {
    vi.mocked(transitionAchievement).mockResolvedValue(achievement({ status: 'submitted' }));
    const onChanged = vi.fn();
    const onRefetch = vi.fn();
    const items = [
      achievement({ achievementId: 'draft-1', status: 'draft' }),
      achievement({ achievementId: 'sub-1', status: 'submitted' }),
    ];
    const { result } = renderHook(
      () =>
        useAchievementDetail(t, {
          teamId: 't1',
          locale: 'en',
          canManage: true,
          items,
          onChanged,
          onRefetch,
        }),
      { wrapper },
    );

    // A draft's only move is submit — no confirm step, fires immediately (onFire).
    act(() => {
      result.current.openAchievement('draft-1');
    });
    act(() => result.current.detail?.actions[0]?.onTrigger());
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalled();
    });

    // A submitted claim arms a confirm step for approve, then fires with a reason.
    act(() => {
      result.current.openAchievement('sub-1');
    });
    act(() =>
      result.current.detail?.actions.find((action) => action.key === 'reject')?.onTrigger(),
    );
    await waitFor(() => {
      expect(result.current.detail?.confirm).not.toBeNull();
    });
    act(() => result.current.detail?.confirm?.onReasonChange('insufficient evidence'));
    act(() => result.current.detail?.confirm?.onCancel());

    act(() =>
      result.current.detail?.actions.find((action) => action.key === 'approve')?.onTrigger(),
    );
    await waitFor(() => {
      expect(result.current.detail?.confirm).not.toBeNull();
    });
    act(() => result.current.detail?.confirm?.onConfirm());
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledTimes(2);
    });

    act(() => result.current.detail?.onClose());
    expect(result.current.detail).toBeNull();
  });

  it('surfaces a version conflict and a generic transition failure', async () => {
    const conflict = new AppError({
      code: APP_ERROR_CODE.Conflict,
      message: 'stale',
      messageKey: 'errors.standings.versionConflict',
    });
    vi.mocked(transitionAchievement)
      .mockRejectedValueOnce(conflict)
      .mockRejectedValueOnce(new Error('boom'));
    const onRefetch = vi.fn();
    const items = [achievement({ achievementId: 'draft-1', status: 'draft' })];
    const { result } = renderHook(
      () =>
        useAchievementDetail(t, {
          teamId: 't1',
          locale: 'en',
          canManage: true,
          items,
          onChanged: vi.fn(),
          onRefetch,
        }),
      { wrapper },
    );

    act(() => {
      result.current.openAchievement('draft-1');
    });
    act(() => result.current.detail?.actions[0]?.onTrigger());
    await waitFor(() => {
      expect(result.current.detail?.conflictNotice).toBe('standings.transitionConflict');
    });
    expect(onRefetch).toHaveBeenCalled();

    act(() => result.current.detail?.actions[0]?.onTrigger());
    await waitFor(() => {
      expect(result.current.detail?.conflictNotice).toBe('standings.transitionFailed');
    });
  });
});
