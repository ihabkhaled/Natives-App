import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import { dataQualityQueryKeys } from '../queries/data-quality.keys';
import { previewRepair } from '../services/preview-repair.service';
import type { RepairPreview } from '../types/data-quality.types';
import type { RepairPreviewView } from '../types/data-quality-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface PreviewActions {
  readonly isApplying: boolean;
  readonly onApply: (anomalyId: string) => void;
}

const KEYS = I18N_KEYS.dataQuality;

/**
 * The preview-then-apply half of a repair.
 *
 * The preview is a read, so opening it changes nothing; only `onApply` writes.
 * The reversibility line comes from the server rather than being assumed, so
 * an operator is never told a change can be undone when it cannot.
 */
export function useRepairPreview(
  t: Translate,
  teamId: string,
  actions: PreviewActions,
): { readonly view: RepairPreviewView | null; readonly open: (anomalyId: string) => void } {
  const [anomalyId, setAnomalyId] = useState('');

  const query = toRemoteQueryView<RepairPreview>(
    useAppQuery({
      queryKey: dataQualityQueryKeys.repairPreview(teamId, anomalyId),
      queryFn: (): Promise<RepairPreview> => previewRepair({ teamId, anomalyId }),
      enabled: anomalyId !== '',
    }),
  );

  const preview = anomalyId === '' ? null : query.data;

  return {
    open: setAnomalyId,
    view:
      preview === undefined || preview === null
        ? null
        : {
            heading: t(KEYS.previewHeading),
            repairKind: preview.repairKind,
            impactLabel: t(KEYS.previewImpact, { count: preview.impactCount }),
            reversibilityLabel: preview.reversible
              ? t(KEYS.previewReversible)
              : t(KEYS.previewIrreversible),
            applyLabel: t(KEYS.applyLabel),
            cancelLabel: t(KEYS.cancelLabel),
            isApplying: actions.isApplying,
            onApply: (): void => {
              actions.onApply(anomalyId);
            },
            onCancel: (): void => {
              setAnomalyId('');
            },
          },
  };
}
