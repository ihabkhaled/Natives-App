import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { ReportJobActions } from '../report-job-actions';
import { ReportStatusChip } from '../report-status-chip';
import type { ReportJobRowProps } from './report-job-row.types';

/**
 * One job's whole story in a row: status chip, live progress while running,
 * row count + expiry countdown once completed, the sanitized failure reason
 * verbatim when failed, and the per-status action. The expandable region
 * reveals the citation facts (job id, calculation version, checksum tail).
 */
export function ReportJobRow(props: ReportJobRowProps): React.JSX.Element {
  const { row } = props;
  return (
    <li
      className={row.isHighlighted ? 'app-report-row app-report-row--flash' : 'app-report-row'}
      data-testid={TEST_IDS.reportJobRow}
    >
      <div className="app-report-row__head">
        <span className="app-report-row__title">{row.templateLabel}</span>
        <span className="app-report-row__format">{row.formatBadge}</span>
        <ReportStatusChip
          label={row.statusChip.label}
          tone={row.statusChip.tone}
          isAnimated={row.progressPercent !== null}
        />
      </div>
      <IonNote>{row.requestedAt}</IonNote>
      {row.progressPercent === null ? null : (
        <div
          className="app-report-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={row.progressPercent}
          aria-label={row.progressLabel ?? ''}
          data-testid={TEST_IDS.reportJobProgress}
        >
          <span
            className="app-report-progress__bar"
            style={{ inlineSize: `${String(row.progressPercent)}%` }}
          />
        </div>
      )}
      {row.completedSummary === null ? null : <IonNote>{row.completedSummary}</IonNote>}
      {row.countdown === null ? null : (
        <IonNote aria-live="polite" data-testid={TEST_IDS.reportJobCountdown}>
          {row.countdown}
        </IonNote>
      )}
      {row.failureReason === null ? null : (
        <IonNote color="danger" data-testid={TEST_IDS.reportJobFailure}>
          {row.failureReason}
        </IonNote>
      )}
      <ReportJobActions row={row} />
    </li>
  );
}
