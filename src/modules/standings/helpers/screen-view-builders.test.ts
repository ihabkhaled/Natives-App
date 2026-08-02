import { buildAchievement } from '../../../../tests/factories/standings-view.factory';
import { describe, expect, it, vi } from 'vitest';

import type { Achievement } from '../types/achievements.types';
import {
  buildAchievementDetailView,
  buildTransitionActions,
  buildTransitionConfirm,
} from './achievement-detail-view.helper';
import { buildStandingsManageView } from './standings-screen-view.helper';

/** This spec builds submitted achievements; everything else is shared. */
const achievement = (overrides: Partial<Achievement> = {}): Achievement =>
  buildAchievement({ status: 'submitted', ...overrides });

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

describe('buildTransitionActions', () => {
  it('offers nothing to a non-manager', () => {
    expect(
      buildTransitionActions(t, achievement({}), {
        canManage: false,
        onArm: vi.fn(),
        onFire: vi.fn(),
      }),
    ).toHaveLength(0);
  });

  it('arms a confirm-required transition and fires a direct one', () => {
    const onArm = vi.fn();
    const onFire = vi.fn();
    const actions = buildTransitionActions(t, achievement({ status: 'submitted' }), {
      canManage: true,
      onArm,
      onFire,
    });
    actions.find((action) => action.key === 'approve')?.onTrigger();
    expect(onArm).toHaveBeenCalledWith('approve');

    const draftActions = buildTransitionActions(t, achievement({ status: 'draft' }), {
      canManage: true,
      onArm,
      onFire,
    });
    draftActions[0]?.onTrigger();
    expect(onFire).toHaveBeenCalledWith('submit');
  });
});

describe('buildTransitionConfirm', () => {
  it('is null when nothing is armed', () => {
    expect(
      buildTransitionConfirm(t, {
        armed: null,
        selected: achievement({}),
        reason: '',
        isRunning: false,
        onReasonChange: vi.fn(),
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      }),
    ).toBeNull();
  });

  it('collects a reason for reject and fires callbacks', () => {
    const onConfirm = vi.fn();
    const view = buildTransitionConfirm(t, {
      armed: 'reject',
      selected: achievement({}),
      reason: 'why',
      isRunning: false,
      onReasonChange: vi.fn(),
      onConfirm,
      onCancel: vi.fn(),
    });
    expect(view?.reasonLabel).not.toBeNull();
    view?.onReasonChange('x');
    view?.onConfirm();
    view?.onCancel();
    expect(onConfirm).toHaveBeenCalled();

    const approve = buildTransitionConfirm(t, {
      armed: 'approve',
      selected: achievement({}),
      reason: '',
      isRunning: true,
      onReasonChange: vi.fn(),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    });
    expect(approve?.reasonLabel).toBeNull();
  });
});

describe('buildAchievementDetailView', () => {
  it('includes the approved-by fact and closes', () => {
    const onClose = vi.fn();
    const view = buildAchievementDetailView(t, {
      selected: achievement({ status: 'approved', approvedBy: 'admin', rejectionReason: null }),
      locale: 'en',
      conflictNotice: null,
      actions: [],
      confirm: null,
      onClose,
    });
    expect(view.facts.some((fact) => fact.key === 'approved-by')).toBe(true);
    view.onClose();
    expect(onClose).toHaveBeenCalled();
  });

  it('omits the approved-by fact for an unapproved claim', () => {
    const view = buildAchievementDetailView(t, {
      selected: achievement({ status: 'submitted' }),
      locale: 'en',
      conflictNotice: 'conflict',
      actions: [],
      confirm: null,
      onClose: vi.fn(),
    });
    expect(view.facts.some((fact) => fact.key === 'approved-by')).toBe(false);
    expect(view.conflictNotice).toBe('conflict');
  });
});

describe('buildStandingsManageView', () => {
  const deps = {
    canManage: true,
    isOffline: false,
    ruleOptions: [{ value: 'league', label: 'League' }],
    isRecomputeOpen: false,
    recomputeRuleKey: 'league',
    isRecomputeRunning: false,
    onRecomputeRuleChange: vi.fn(),
    onRecomputeConfirm: vi.fn(),
    onRecomputeCancel: vi.fn(),
    onOpenRecompute: vi.fn(),
    isManualOpen: false,
    manualDraft: {
      entrantKind: 'team',
      played: '0',
      wins: '0',
      losses: '0',
      ties: '0',
      pointsFor: '0',
      pointsAgainst: '0',
      spiritScore: '',
      sourceReference: '',
      reconciliationNote: '',
      ruleKey: '',
    },
    manualIssue: null,
    manualWriteError: null,
    isManualSaving: false,
    onManualPatch: vi.fn(),
    onManualSubmit: vi.fn(),
    onManualCancel: vi.fn(),
    onOpenManual: vi.fn(),
  } as const;

  it('is null for a read-only persona', () => {
    expect(buildStandingsManageView(t, { ...deps, canManage: false })).toBeNull();
  });

  it('keeps both dialogs closed by default and wires their openers', () => {
    const closed = buildStandingsManageView(t, deps);
    expect(closed?.recomputeDialog).toBeNull();
    expect(closed?.manualForm).toBeNull();
    closed?.onOpenRecompute();
    closed?.onOpenManual();
  });

  it('opens the dialogs when their flags are set', () => {
    const open = buildStandingsManageView(t, {
      ...deps,
      isRecomputeOpen: true,
      isManualOpen: true,
    });
    expect(open?.recomputeDialog).not.toBeNull();
    expect(open?.manualForm).not.toBeNull();
    expect(open?.disabledReason).toBeNull();
  });

  it('explains the offline disablement', () => {
    expect(
      buildStandingsManageView(t, { ...deps, isOffline: true })?.disabledReason,
    ).not.toBeNull();
  });
});
