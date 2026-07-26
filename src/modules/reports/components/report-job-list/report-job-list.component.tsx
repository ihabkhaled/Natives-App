import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SelectField } from '@/shared/ui';

import { ReportJobRow } from '../report-job-row';
import type { ReportJobListProps } from './report-job-list.types';

/**
 * The server-paginated job list with its template/status facets, manual
 * refresh (always available beside the poll), and the degraded-poll notice
 * once the same job has been running for five minutes.
 */
export function ReportJobList(props: ReportJobListProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      className="app-report-list"
      aria-label={view.listHeading}
      data-testid={TEST_IDS.reportJobList}
    >
      <div className="app-report-list__toolbar">
        <SelectField
          testId={TEST_IDS.reportsTemplateFilter}
          label={view.templateFilterLabel}
          value={view.templateFilterValue}
          options={view.templateFilterOptions}
          onChange={view.onTemplateFilterChange}
        />
        <SelectField
          testId={TEST_IDS.reportsStatusFilter}
          label={view.statusFilterLabel}
          value={view.statusFilterValue}
          options={view.statusFilterOptions}
          onChange={view.onStatusFilterChange}
        />
        <AppButton
          label={view.refreshLabel}
          tone="ghost"
          testId={TEST_IDS.reportsRefresh}
          onClick={view.onRefresh}
        />
      </div>
      {view.slowPollNotice === null ? null : (
        <IonNote role="status" data-testid={TEST_IDS.reportsSlowPollNotice}>
          {view.slowPollNotice}
        </IonNote>
      )}
      <IonNote>{view.countLabel}</IonNote>
      <ul className="app-report-list__rows">
        {view.rows.map((row) => (
          <ReportJobRow key={row.key} row={row} />
        ))}
      </ul>
      <div className="app-report-list__pager" data-testid={TEST_IDS.reportsPager}>
        {view.pagerPreviousLabel === null ? null : (
          <AppButton
            label={view.pagerPreviousLabel}
            tone="secondary"
            testId={TEST_IDS.reportsPagerPrevious}
            onClick={view.onPreviousPage}
          />
        )}
        {view.pagerNextLabel === null ? null : (
          <AppButton
            label={view.pagerNextLabel}
            tone="secondary"
            testId={TEST_IDS.reportsPagerNext}
            onClick={view.onNextPage}
          />
        )}
      </div>
    </section>
  );
}
