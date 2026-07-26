import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  REBUILD_DEFAULT_PERIOD_TYPE,
  type AnalyticsPeriodType,
} from '../constants/analytics.constants';
import { buildRebuildDialogView } from '../helpers/team-analytics-view.helper';
import { useRebuildAnalyticsMutation } from '../mutations/use-rebuild-analytics-mutation.hook';
import type { RebuildDialogView } from '../types/analytics-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface AnalyticsRebuildApi {
  readonly dialog: RebuildDialogView | null;
  readonly banner: string | null;
  readonly error: string | null;
  readonly onOpenRebuild: () => void;
}

/**
 * The idempotent projection-rebuild concern (data_quality.manage), owned as a
 * sub-hook. Success cites the run's report; every analytics query is
 * invalidated by the mutation.
 */
export function useAnalyticsRebuild(
  t: Translate,
  teamId: string,
  isOffline: boolean,
): AnalyticsRebuildApi {
  const [isOpen, setOpen] = useState(false);
  const [period, setPeriod] = useState<string>(REBUILD_DEFAULT_PERIOD_TYPE);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rebuild = useRebuildAnalyticsMutation(teamId, {
    onSuccess: (report) => {
      setOpen(false);
      setBanner(
        t(I18N_KEYS.analytics.rebuildReport, {
          subjects: String(report.subjectsProjected),
          projections: String(report.projectionsWritten),
        }),
      );
    },
    onError: () => {
      setError(t(I18N_KEYS.analytics.rebuildFailed));
    },
  });

  return {
    dialog: !isOpen
      ? null
      : buildRebuildDialogView(t, {
          periodValue: period,
          isOffline,
          isRunning: rebuild.isRunning,
          onPeriodChange: setPeriod,
          onConfirm: () => {
            rebuild.run({ periodType: period as AnalyticsPeriodType, seasonId: null });
          },
          onCancel: () => {
            setOpen(false);
          },
        }),
    banner,
    error,
    onOpenRebuild: () => {
      setError(null);
      setOpen(true);
    },
  };
}
