import { AssessmentEntryView } from '../components/assessment-entry-view';
import { useAssessmentEntry } from '../hooks/use-assessment-entry.hook';

/** The coach assessment entry screen. */
export function AssessmentEntryContainer(): React.JSX.Element {
  const view = useAssessmentEntry();
  return <AssessmentEntryView {...view} />;
}
