import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AchievementTransition } from '../constants/standings.constants';
import {
  buildAchievementDetailView,
  buildTransitionActions,
  buildTransitionConfirm,
} from '../helpers/achievement-detail-view.helper';
import {
  isStandingsVersionConflict,
  resolveStandingsWriteErrorKey,
} from '../helpers/to-standings-error.helper';
import { useTransitionAchievementMutation } from '../mutations/use-transition-achievement-mutation.hook';
import type { Achievement } from '../types/achievements.types';
import type { AchievementDetailView } from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface DetailHookInput {
  readonly teamId: string;
  readonly locale: string;
  readonly canManage: boolean;
  readonly items: readonly Achievement[];
  readonly onChanged: (message: string) => void;
  readonly onRefetch: () => void;
}

export interface AchievementDetailApi {
  readonly detail: AchievementDetailView | null;
  readonly openAchievement: (achievementId: string) => void;
}

/**
 * The approval flow for one selected claim: a display-only mirror of the
 * backend state machine, carrying `expectedRecordVersion` so a concurrent
 * edit surfaces as a typed conflict (refetch + re-ask) rather than an
 * overwrite. Reject collects the terminal reason.
 */
export function useAchievementDetail(t: Translate, input: DetailHookInput): AchievementDetailApi {
  const [selectedId, setSelectedId] = useState('');
  const [armed, setArmed] = useState<AchievementTransition | null>(null);
  const [reason, setReason] = useState('');
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  const selected = input.items.find((item) => item.achievementId === selectedId) ?? null;

  const transition = useTransitionAchievementMutation(input.teamId, selectedId, {
    onSuccess: () => {
      setArmed(null);
      setReason('');
      setConflictNotice(null);
      input.onChanged(t(I18N_KEYS.standings.transitionDone));
    },
    onError: (error) => {
      setArmed(null);
      if (isStandingsVersionConflict(error)) {
        setConflictNotice(t(I18N_KEYS.standings.transitionConflict));
        input.onRefetch();
        return;
      }
      setConflictNotice(
        t(resolveStandingsWriteErrorKey(error, I18N_KEYS.standings.transitionFailed)),
      );
    },
  });

  const openAchievement = (achievementId: string): void => {
    setSelectedId(achievementId);
    setArmed(null);
    setConflictNotice(null);
  };

  if (selected === null) {
    return { detail: null, openAchievement };
  }

  const fire = (kind: AchievementTransition, withReason: string): void => {
    transition.run({
      transition: kind,
      expectedRecordVersion: selected.recordVersion,
      reason: withReason.trim() === '' ? null : withReason.trim(),
    });
  };

  const detail = buildAchievementDetailView(t, {
    selected,
    locale: input.locale,
    conflictNotice,
    actions: buildTransitionActions(t, selected, {
      canManage: input.canManage,
      onArm: (kind) => {
        setConflictNotice(null);
        setArmed(kind);
      },
      onFire: (kind) => {
        setConflictNotice(null);
        fire(kind, '');
      },
    }),
    confirm:
      armed === null
        ? null
        : buildTransitionConfirm(t, {
            armed,
            selected,
            reason,
            isRunning: transition.isRunning,
            onReasonChange: setReason,
            onConfirm: () => {
              fire(armed, reason);
            },
            onCancel: () => {
              setArmed(null);
              setReason('');
            },
          }),
    onClose: () => {
      setSelectedId('');
      setArmed(null);
      setConflictNotice(null);
    },
  });

  return { detail, openAchievement };
}
