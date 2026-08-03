import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AgendaMutationScope } from '../mutations/practice-agenda-mutations.types';
import { useRemoveStationMutation } from '../mutations/use-remove-station-mutation.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface PracticeAgendaActionsView {
  readonly notice: string | null;
  readonly isRemoving: boolean;
  readonly clearNotice: () => void;
  readonly reportFailure: () => void;
  readonly onRemoveStation: (blockId: string, stationId: string) => void;
}

/**
 * The station command and the single notice line every agenda command shares.
 *
 * A failure resolves to one sentence rather than a raw server message: a coach
 * mid-session needs to know the plan did not change, not how the database
 * phrased its refusal. The notice is owned here so the reorder — which lives
 * in its own hook, because it also owns provisional order state — can report
 * through the same line instead of opening a second one.
 */
export function usePracticeAgendaActions(
  t: Translate,
  scope: AgendaMutationScope,
): PracticeAgendaActionsView {
  const [notice, setNotice] = useState<string | null>(null);

  const clearNotice = (): void => {
    setNotice(null);
  };
  const reportFailure = (): void => {
    setNotice(t(I18N_KEYS.practiceAgenda.actionFailed));
  };

  const removal = useRemoveStationMutation(scope, {
    onSuccess: clearNotice,
    onError: reportFailure,
  });

  return {
    notice,
    isRemoving: removal.isRunning,
    clearNotice,
    reportFailure,
    onRemoveStation: (blockId: string, stationId: string): void => {
      removal.run({ blockId, stationId });
    },
  };
}
