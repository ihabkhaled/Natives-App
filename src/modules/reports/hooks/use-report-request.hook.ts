import { useState } from 'react';

import { buildSeasonsQueryOptions } from '@/modules/teams';
import type { TranslateParams } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import {
  REPORTS_FILTER_ALL,
  type ReportFormat,
  type ReportTemplate,
} from '../constants/reports.constants';
import { resolveDefaultFormat } from '../helpers/report-request-form.helper';
import { buildRequestPanelView, coerceFormat } from '../helpers/report-request-view.helper';
import { classifyReportsRefusal } from '../helpers/to-reports-error.helper';
import { useGenerateReportMutation } from '../mutations/use-generate-report-mutation.hook';
import type { ReportJob } from '../types/reports.types';
import type { ReportRequestPanelView } from '../types/reports-view.types';
import type { ReportsContextView } from './use-reports-context.hook';

type Translate = (key: string, params?: TranslateParams) => string;

interface RequestHookInput {
  readonly context: ReportsContextView;
  readonly onQueued: (job: ReportJob) => void;
  readonly prefillTemplate: ReportTemplate | null;
  readonly onPrefillConsumed: () => void;
}

/**
 * View model of the request panel: the 10-template catalog, the format segment
 * preselecting the template default, the optional season scope, and the submit
 * whose duplicate lands on the idempotent existing job. Absent without
 * report.generate.
 */
export function useReportRequest(
  t: Translate,
  input: RequestHookInput,
): ReportRequestPanelView | null {
  const [template, setTemplate] = useState<ReportTemplate>('team_overview');
  const [format, setFormat] = useState<ReportFormat>('csv');
  const [season, setSeason] = useState<string>(REPORTS_FILTER_ALL);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const seasonsQuery = toRemoteQueryView(
    useAppQuery(buildSeasonsQueryOptions(input.context.teamId, input.context.canGenerate)),
  );

  const generate = useGenerateReportMutation(input.context.teamId, {
    onSuccess: (job) => {
      setValidationMessage(null);
      input.onQueued(job);
    },
    onError: (error) => {
      setValidationMessage(
        t(
          classifyReportsRefusal(error) === 'validation'
            ? I18N_KEYS.reports.requestValidation
            : I18N_KEYS.reports.requestFailed,
        ),
      );
    },
  });

  if (!input.context.canGenerate) {
    return null;
  }

  const activeTemplate = input.prefillTemplate ?? template;

  return buildRequestPanelView(t, {
    template: activeTemplate,
    format,
    season,
    seasons: seasonsQuery.data ?? [],
    isOffline: input.context.isOffline,
    isSubmitting: generate.isRunning,
    validationMessage,
    onSelectTemplate: (next) => {
      setTemplate(next);
      setFormat(resolveDefaultFormat(next));
      input.onPrefillConsumed();
    },
    onFormatChange: (value) => {
      setFormat(coerceFormat(value));
    },
    onSeasonChange: setSeason,
    onSubmit: () => {
      generate.run({
        template: activeTemplate,
        format,
        seasonId: season === REPORTS_FILTER_ALL ? null : season,
      });
    },
  });
}
