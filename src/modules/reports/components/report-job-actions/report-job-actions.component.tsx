import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList } from '@/shared/ui';

import type { ReportJobActionsProps } from './report-job-actions.types';

/**
 * The per-status action buttons and the expandable citation region of one job
 * row, split out so the row itself stays simple.
 */
export function ReportJobActions(props: ReportJobActionsProps): React.JSX.Element {
  const { row } = props;
  return (
    <>
      <div className="app-report-row__actions">
        {row.downloadLabel === null ? null : (
          <AppButton
            label={row.downloadLabel}
            tone="primary"
            testId={TEST_IDS.reportDownloadButton}
            loading={row.isDownloading}
            onClick={row.onDownload}
          />
        )}
        {row.retryLabel === null ? null : (
          <AppButton
            label={row.retryLabel}
            tone="secondary"
            testId={TEST_IDS.reportRetryButton}
            onClick={row.onRetry}
          />
        )}
        {row.requestAgainLabel === null ? null : (
          <AppButton
            label={row.requestAgainLabel}
            tone="ghost"
            testId={TEST_IDS.reportRequestAgainButton}
            onClick={row.onRequestAgain}
          />
        )}
        <button
          type="button"
          className="app-report-row__expand"
          data-testid={TEST_IDS.reportJobExpand}
          aria-expanded={row.isExpanded}
          onClick={row.onToggleExpand}
        >
          {row.expandLabel}
        </button>
      </div>
      {row.isExpanded ? (
        <div className="app-report-row__detail" data-testid={TEST_IDS.reportJobDetail}>
          <FactList items={row.facts} ariaLabel={row.templateLabel} />
        </div>
      ) : null}
    </>
  );
}
