import { ReportsScreen } from '../components/reports-view';
import { useReportJobs } from '../hooks/use-report-jobs.hook';

/** The reports center screen. */
export function ReportsContainer(): React.JSX.Element {
  const view = useReportJobs();
  return <ReportsScreen {...view} />;
}
