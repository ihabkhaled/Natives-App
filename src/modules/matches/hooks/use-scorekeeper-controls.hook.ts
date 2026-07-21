import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppToast } from '@/shared/ui';

import { UNATTRIBUTED_VALUE } from '../constants/matches-view.constants';
import {
  SCOREKEEPER_TOAST_KEYS,
  SCOREKEEPER_TOAST_TONES,
} from '../constants/scorekeeper-toast.constants';
import { useScorekeeperActionMutation } from '../mutations/use-scorekeeper-action-mutation.hook';
import type { ScoringSide } from '../constants/matches.constants';

export interface ScorekeeperControlsScope {
  readonly ownerUserId: string;
  readonly teamId: string;
  readonly matchId: string;
  readonly isOnline: boolean;
  readonly baseStreamVersion: number;
}

export interface ScorekeeperControlsView {
  readonly scorerValue: string;
  readonly assistValue: string;
  readonly isSubmitting: boolean;
  readonly setScorer: (value: string) => void;
  readonly setAssist: (value: string) => void;
  readonly recordPoint: (side: ScoringSide) => void;
  readonly recordTimeout: (side: ScoringSide) => void;
  readonly recordCorrection: (eventId: string, reason: string) => void;
}

function toMembershipId(value: string): string | null {
  return value === UNATTRIBUTED_VALUE ? null : value;
}

/**
 * Scorer/assist selection plus the three field commands.
 *
 * Every command captures the stream version the operator was looking at when
 * they tapped. That version travels to the server as `expectedStreamVersion`,
 * so a queue replayed after someone else scored is rejected rather than
 * applied on top of a stream it never saw.
 */
export function useScorekeeperControls(scope: ScorekeeperControlsScope): ScorekeeperControlsView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [scorerValue, setScorerValue] = useState(UNATTRIBUTED_VALUE);
  const [assistValue, setAssistValue] = useState(UNATTRIBUTED_VALUE);

  const mutation = useScorekeeperActionMutation({
    ownerUserId: scope.ownerUserId,
    teamId: scope.teamId,
    matchId: scope.matchId,
    isOnline: scope.isOnline,
    onResult: (status) => {
      void toast.showToast({
        message: t(SCOREKEEPER_TOAST_KEYS[status]),
        tone: SCOREKEEPER_TOAST_TONES[status],
      });
    },
  });

  return {
    scorerValue,
    assistValue,
    isSubmitting: mutation.isSubmitting,
    setScorer: setScorerValue,
    setAssist: setAssistValue,
    recordPoint: (side) => {
      mutation.submit({
        baseStreamVersion: scope.baseStreamVersion,
        payload: {
          kind: 'point',
          scoringSide: side,
          scorerMembershipId: side === 'us' ? toMembershipId(scorerValue) : null,
          assistMembershipId: side === 'us' ? toMembershipId(assistValue) : null,
        },
      });
    },
    recordTimeout: (side) => {
      mutation.submit({
        baseStreamVersion: scope.baseStreamVersion,
        payload: { kind: 'timeout', scoringSide: side },
      });
    },
    // Undo is a compensating event appended to the stream with a reason;
    // the original point is never rewritten or deleted.
    recordCorrection: (eventId, reason) => {
      mutation.submit({
        baseStreamVersion: scope.baseStreamVersion,
        payload: { kind: 'void', eventId, reason },
      });
    },
  };
}
