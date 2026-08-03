import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { useApplyRepairMutation } from '../mutations/use-apply-repair-mutation.hook';
import { useScanMutation } from '../mutations/use-scan-mutation.hook';
import {
  useTransitionAnomalyMutation,
  type TransitionInput,
} from '../mutations/use-transition-anomaly-mutation.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface DataQualityActionsView {
  readonly notice: string | null;
  readonly isScanning: boolean;
  readonly isApplying: boolean;
  readonly onScan: () => void;
  readonly onApply: (anomalyId: string) => void;
  readonly onTransition: (input: TransitionInput) => void;
}

const KEYS = I18N_KEYS.dataQuality;

/**
 * The three commands the queue issues, and the single notice line they share.
 *
 * Every failure resolves to the same sentence rather than a raw server
 * message: an operator needs to know the action did not happen, not how the
 * database phrased it.
 */
export function useDataQualityActions(t: Translate, teamId: string): DataQualityActionsView {
  const [notice, setNotice] = useState<string | null>(null);

  const clearNotice = (): void => {
    setNotice(null);
  };
  const reportFailure = (): void => {
    setNotice(t(KEYS.actionFailed));
  };

  const scan = useScanMutation(teamId, { onSuccess: clearNotice, onError: reportFailure });
  const apply = useApplyRepairMutation(teamId, {
    onSuccess: (): void => {
      setNotice(t(KEYS.rolledBackNotice));
    },
    onError: reportFailure,
  });
  const transition = useTransitionAnomalyMutation(teamId, {
    onSuccess: clearNotice,
    onError: reportFailure,
  });

  return {
    notice,
    isScanning: scan.isRunning,
    isApplying: apply.isRunning,
    onScan: (): void => {
      scan.run(undefined);
    },
    onApply: apply.run,
    onTransition: transition.run,
  };
}
