import { useState } from 'react';

import {
  REPORTS_FILTER_ALL,
  REPORTS_LIMITS,
  type ReportStatus,
  type ReportTemplate,
} from '../constants/reports.constants';
import type { ReportFiltersView } from '../types/reports-view.types';

/** The facet + pager state of the reports list, owned as a sub-hook. */
export function useReportFilters(): ReportFiltersView {
  const [templateValue, setTemplateValue] = useState<string>(REPORTS_FILTER_ALL);
  const [statusValue, setStatusValue] = useState<string>(REPORTS_FILTER_ALL);
  const [offset, setOffset] = useState(0);

  return {
    template: templateValue === REPORTS_FILTER_ALL ? null : (templateValue as ReportTemplate),
    status: statusValue === REPORTS_FILTER_ALL ? null : (statusValue as ReportStatus),
    offset,
    templateValue,
    statusValue,
    onTemplateChange: (value) => {
      setTemplateValue(value);
      setOffset(0);
    },
    onStatusChange: (value) => {
      setStatusValue(value);
      setOffset(0);
    },
    onPreviousPage: () => {
      setOffset((current) => Math.max(0, current - REPORTS_LIMITS.pageSize));
    },
    onNextPage: () => {
      setOffset((current) => current + REPORTS_LIMITS.pageSize);
    },
  };
}
