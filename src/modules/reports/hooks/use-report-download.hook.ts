import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { openExternalUrl } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { buildDownloadToastMessage } from '../helpers/report-download.helper';
import { classifyReportsRefusal } from '../helpers/to-reports-error.helper';
import { createReportDownload } from '../services/create-report-download.service';
import type { ReportJob } from '../types/reports.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface ReportDownloadApi {
  readonly downloadingId: string;
  readonly download: (job: ReportJob) => void;
}

/**
 * The imperative, audited download: one fresh signed URL per click, opened in
 * the in-app browser, never cached. A `notReady`/`expired` refusal refetches
 * the list and explains via a toast rather than a dead link.
 */
export function useReportDownload(
  t: Translate,
  teamId: string,
  onRefetch: () => void,
): ReportDownloadApi {
  const toast = useAppToast();
  const [downloadingId, setDownloadingId] = useState('');

  const download = (job: ReportJob): void => {
    setDownloadingId(job.jobId);
    void (async () => {
      try {
        const ticket = await createReportDownload(teamId, job.jobId);
        await openExternalUrl(ticket.url);
        await toast.showToast({
          message: buildDownloadToastMessage(t, ticket.checksum),
          tone: 'success',
        });
      } catch (error) {
        onRefetch();
        await toast.showToast({
          message: t(
            classifyReportsRefusal(error) === 'expired'
              ? I18N_KEYS.reports.downloadExpired
              : I18N_KEYS.reports.downloadNotReady,
          ),
          tone: 'warning',
        });
      } finally {
        setDownloadingId('');
      }
    })();
  };

  return { downloadingId, download };
}
