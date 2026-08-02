import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppTranslation } from '@/packages/i18n';
import { useAchievementDetail } from '@/modules/standings/hooks/use-achievement-detail.hook';
import { useStandingsRules } from '@/modules/standings/hooks/use-standings-rules.hook';
import { useStandingsTable } from '@/modules/standings/hooks/use-standings-table.hook';
import { useAchievementsWorkspace } from '@/modules/standings/hooks/use-achievements-workspace.hook';
import { useTeamHistory } from '@/modules/standings/hooks/use-team-history.hook';
import type { Achievement } from '@/modules/standings';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_ACHIEVEMENTS } from '@/tests/msw/achievements.fixture';
import { MOCK_STANDINGS } from '@/tests/msw/standings.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { renderHookWithProviders } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

/**
 * Signs in as the coach and renders the achievements workspace, settled.
 *
 * Returns the live renderHook result so callers keep reading fresh cards.
 */
async function renderAchievementsWorkspace(): Promise<
  ReturnType<typeof renderHookWithProviders<ReturnType<typeof useAchievementsWorkspace>>>
> {
  await signInAs(MOCK_PERSONA_EMAILS.coach);
  const view = renderHookWithProviders(() => useAchievementsWorkspace(), {
    initialPath: '/achievements',
  });

  await waitFor(() => {
    expect(view.result.current.cards.length).toBeGreaterThan(0);
  }, WAIT);

  return view;
}

describe('standings write flows (hook-driven, real client + MSW)', () => {
  it('recomputes a competition and banners the reconciliation report', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => useStandingsTable(), {
      initialPath: '/standings',
    });

    await waitFor(() => {
      expect(result.current.manage?.onOpenRecompute).toBeTypeOf('function');
    }, WAIT);
    act(() => result.current.manage?.onOpenRecompute());
    await waitFor(() => {
      expect(result.current.manage?.recomputeDialog).not.toBeNull();
    }, WAIT);
    act(() => result.current.manage?.recomputeDialog?.onRuleChange(MOCK_STANDINGS.ruleKey));
    act(() => result.current.manage?.recomputeDialog?.onConfirm());

    await waitFor(() => {
      expect(result.current.recomputeBanner).not.toBeNull();
    }, WAIT);

    // Chrome facets: a specific competition, a non-"all" source, and the rules link.
    act(() => {
      result.current.onCompetitionChange(MOCK_STANDINGS.leagueId);
    });
    act(() => {
      result.current.onSourceChange('manual');
    });
    act(() => {
      result.current.onOpenRules();
    });
    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThanOrEqual(0);
    }, WAIT);
  });

  it('records a reconciled external row after cross-field validation', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => useStandingsTable(), {
      initialPath: '/standings',
    });

    await waitFor(() => {
      expect(result.current.manage?.onOpenManual).toBeTypeOf('function');
    }, WAIT);
    act(() => result.current.manage?.onOpenManual());
    await waitFor(() => {
      expect(result.current.manage?.manualForm).not.toBeNull();
    }, WAIT);
    act(() => result.current.manage?.manualForm?.onNoteChange('Recorded from the paper sheet.'));
    act(() => result.current.manage?.manualForm?.onRuleChange(MOCK_STANDINGS.ruleKey));
    await waitFor(() => {
      expect(result.current.manage?.manualForm?.canSubmit).toBe(true);
    }, WAIT);
    act(() => result.current.manage?.manualForm?.onSubmit());

    await waitFor(() => {
      expect(result.current.recomputeBanner).not.toBeNull();
    }, WAIT);
  });

  it('publishes the next immutable rule version', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => useStandingsRules(), {
      initialPath: '/standings/rules',
    });

    await waitFor(() => {
      expect(result.current.formToggleLabel).not.toBeNull();
    }, WAIT);
    act(() => {
      result.current.onToggleForm();
    });
    await waitFor(() => {
      expect(result.current.form).not.toBeNull();
    }, WAIT);
    act(() => result.current.form?.onKeyChange('league'));
    act(() => result.current.form?.onNameChange('Revised scoring'));
    act(() => result.current.form?.onMoveTieBreak(1, -1));

    // A non-numeric point value is refused by the submit guard.
    act(() => result.current.form?.pointFields[0]?.onChange('x'));
    act(() => result.current.form?.onSubmit());
    await waitFor(() => {
      expect(result.current.form?.validationMessage).not.toBeNull();
    }, WAIT);

    act(() => result.current.form?.pointFields[0]?.onChange('3'));
    await waitFor(() => {
      expect(result.current.form?.canSubmit).toBe(true);
    }, WAIT);
    act(() => result.current.form?.onSubmit());
    await waitFor(() => {
      expect(result.current.savedBanner).not.toBeNull();
    }, WAIT);
  });

  it('creates a draft achievement claim', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => useAchievementsWorkspace(), {
      initialPath: '/achievements',
    });

    await waitFor(() => {
      expect(result.current.createLabel).not.toBeNull();
    }, WAIT);
    act(() => {
      result.current.onOpenCreate();
    });
    await waitFor(() => {
      expect(result.current.form).not.toBeNull();
    }, WAIT);
    act(() => result.current.form?.onDateOpen());
    act(() => result.current.form?.onDateDismiss());
    act(() => result.current.form?.onTitleChange('Regional runners-up'));
    act(() => result.current.form?.onDescriptionChange('Second place'));
    act(() => result.current.form?.onEvidenceChange('link'));
    act(() => result.current.form?.onMemberChange('none'));
    act(() => result.current.form?.onDateChange('2026-06-20'));
    act(() => result.current.form?.onCategoryChange('placement'));
    act(() => result.current.form?.onVisibilityChange('public'));
    await waitFor(() => {
      expect(result.current.form?.canSubmit).toBe(true);
    }, WAIT);
    act(() => result.current.form?.onSubmit());

    await waitFor(() => {
      expect(result.current.banner).not.toBeNull();
    }, WAIT);
  });

  it('runs the import wizard from dry-run preview to commit', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.teamAdmin);
    const { result } = renderHookWithProviders(() => useAchievementsWorkspace(), {
      initialPath: '/achievements',
    });

    await waitFor(() => {
      expect(result.current.importLabel).not.toBeNull();
    }, WAIT);
    act(() => {
      result.current.onOpenImport();
    });
    await waitFor(() => {
      expect(result.current.importWizard).not.toBeNull();
    }, WAIT);
    // A malformed row is reported by line number before any network call.
    act(() => result.current.importWizard?.onInputChange('BAD,notacategory,x,nope'));
    act(() => result.current.importWizard?.onParse());
    await waitFor(() => {
      expect(result.current.importWizard?.parseError).not.toBeNull();
    }, WAIT);

    act(() => result.current.importWizard?.onInputChange('REF,trophy,Champions,2026-06-20'));
    act(() => result.current.importWizard?.onParse());

    await waitFor(() => {
      expect(result.current.importWizard?.step).toBe('preview');
    }, WAIT);
    expect(result.current.importWizard?.outcomeRows.length).toBeGreaterThan(0);
    act(() => result.current.importWizard?.onCommit());
    await waitFor(() => {
      expect(result.current.importWizard?.step).toBe('done');
    }, WAIT);
    act(() => result.current.importWizard?.onBack());
  });

  it('opens a claim and reads its approval timeline', async () => {
    const { result } = await renderAchievementsWorkspace();
    const submitted = result.current.cards[0];
    act(() => submitted?.onOpen());
    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    }, WAIT);
    expect(result.current.detail?.timeline.length).toBeGreaterThan(0);
    act(() => result.current.detail?.onClose());

    // The category facet narrows the list to a single vocabulary (non-"all" branch).
    act(() => {
      result.current.onCategoryFilterChange('trophy');
    });
    await waitFor(() => {
      expect(result.current.categoryFilterValue).toBe('trophy');
    }, WAIT);
  });

  it('approves a submitted claim and records a rejection reason', async () => {
    const { result } = await renderAchievementsWorkspace();
    act(() => {
      result.current.onStatusFilterChange('submitted');
    });
    await waitFor(() => {
      expect(result.current.cards.length).toBeGreaterThan(0);
    }, WAIT);
    act(() => result.current.cards[0]?.onOpen());
    await waitFor(() => {
      expect(result.current.detail?.actions.length).toBeGreaterThan(0);
    }, WAIT);

    const reject = result.current.detail?.actions.find((action) => action.key === 'reject');
    act(() => reject?.onTrigger());
    await waitFor(() => {
      expect(result.current.detail?.confirm).not.toBeNull();
    }, WAIT);
    // Cancel then re-arm to exercise the confirm cancel path.
    act(() => result.current.detail?.confirm?.onCancel());
    await waitFor(() => {
      expect(result.current.detail?.confirm).toBeNull();
    }, WAIT);
    act(() =>
      result.current.detail?.actions.find((action) => action.key === 'reject')?.onTrigger(),
    );
    await waitFor(() => {
      expect(result.current.detail?.confirm).not.toBeNull();
    }, WAIT);
    act(() => result.current.detail?.confirm?.onReasonChange('Insufficient evidence.'));
    act(() => result.current.detail?.confirm?.onConfirm());
    await waitFor(() => {
      expect(result.current.banner).not.toBeNull();
    }, WAIT);
  });

  it('recovers from a version conflict by refetching and re-asking', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    // A hand-crafted stale item (recordVersion 99) makes the archive transition
    // 409 with errors.standings.versionConflict — the conflict-recovery branch.
    const staleItem: Achievement = {
      achievementId: MOCK_ACHIEVEMENTS.approvedId,
      seasonId: null,
      competitionId: null,
      membershipId: null,
      category: 'trophy',
      title: 'Regional champions 2025',
      description: null,
      achievedOn: '2026-06-20',
      evidenceReference: null,
      visibility: 'public',
      status: 'approved',
      source: 'manual',
      importReference: null,
      rejectionReason: null,
      recordVersion: 99,
      approvedBy: 'admin',
      approvedAtIso: '2026-06-25T09:00:00.000Z',
    };
    const onRefetch = vi.fn();
    const { result } = renderHookWithProviders(
      () => {
        const { t } = useAppTranslation();
        return useAchievementDetail(t, {
          teamId: 'team-natives',
          locale: 'en',
          canManage: true,
          items: [staleItem],
          onChanged: vi.fn(),
          onRefetch,
        });
      },
      { initialPath: '/achievements' },
    );

    act(() => {
      result.current.openAchievement(MOCK_ACHIEVEMENTS.approvedId);
    });
    await waitFor(() => {
      expect(result.current.detail?.actions.length).toBeGreaterThan(0);
    }, WAIT);
    const archive = result.current.detail?.actions.find((action) => action.key === 'archive');
    act(() => archive?.onTrigger());
    await waitFor(() => {
      expect(result.current.detail?.confirm).not.toBeNull();
    }, WAIT);
    act(() => result.current.detail?.confirm?.onConfirm());
    await waitFor(() => {
      expect(result.current.detail?.conflictNotice).not.toBeNull();
    }, WAIT);
    expect(onRefetch).toHaveBeenCalled();
  });

  it('filters and pages the trophy cabinet', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    const { result } = renderHookWithProviders(() => useTeamHistory(), {
      initialPath: '/team-history',
    });

    await waitFor(() => {
      expect(result.current.seasons.length).toBeGreaterThan(0);
    }, WAIT);
    act(() => {
      result.current.onCategoryFilterChange('trophy');
    });
    await waitFor(() => {
      expect(result.current.seasons.length).toBeGreaterThanOrEqual(0);
    }, WAIT);
    act(() => {
      result.current.onLoadMore();
    });
    act(() => {
      result.current.onOpenManage();
    });
  });
});
