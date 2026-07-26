import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { type ReportTemplate } from '../constants/reports.constants';
import { classifyReportsRefusal } from '../helpers/to-reports-error.helper';
import { useRetryReportMutation } from '../mutations/use-retry-report-mutation.hook';
import type { ReportJob } from '../types/reports.types';
import type { ReportRequestPanelView } from '../types/reports-view.types';
import { useReportRequest } from './use-report-request.hook';
import type { ReportsContextView } from './use-reports-context.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface ReportActionsApi {
  readonly requestPanel: ReportRequestPanelView | null;
  readonly banner: string | null;
  readonly highlightedId: string;
  readonly prefillTemplate: ReportTemplate | null;
  readonly onRetry: (job: ReportJob) => void;
  readonly onRequestAgain: (job: ReportJob) => void;
}

interface ActionsInput {
  readonly context: ReportsContextView;
  readonly jobs: readonly ReportJob[];
  readonly onRefetch: () => void;
}

/**
 * The request, retry, and "request again" concern of the reports center,
 * owned as a sub-hook: a duplicate submit flashes the existing row, a
 * retryNotAllowed refusal refetches and explains.
 */
export function useReportActions(t: Translate, input: ActionsInput): ReportActionsApi {
  const [banner, setBanner] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState('');
  const [prefillTemplate, setPrefillTemplate] = useState<ReportTemplate | null>(null);

  const retry = useRetryReportMutation(input.context.teamId, {
    onSuccess: () => {
      setBanner(null);
    },
    onError: (error) => {
      const notAllowed = classifyReportsRefusal(error) === 'retryNotAllowed';
      setBanner(t(notAllowed ? I18N_KEYS.reports.retryNotAllowed : I18N_KEYS.reports.errorMessage));
      if (notAllowed) {
        input.onRefetch();
      }
    },
  });

  const requestPanel = useReportRequest(t, {
    context: input.context,
    onQueued: (job) => {
      setHighlightedId(job.jobId);
      const duplicate = input.jobs.some((existing) => existing.jobId === job.jobId);
      setBanner(
        t(duplicate ? I18N_KEYS.reports.requestDuplicate : I18N_KEYS.reports.requestQueued),
      );
    },
    prefillTemplate,
    onPrefillConsumed: () => {
      setPrefillTemplate(null);
    },
  });

  return {
    requestPanel,
    banner,
    highlightedId,
    prefillTemplate,
    onRetry: (job) => {
      retry.run(job.jobId);
    },
    onRequestAgain: (job) => {
      setPrefillTemplate(job.template);
    },
  };
}
