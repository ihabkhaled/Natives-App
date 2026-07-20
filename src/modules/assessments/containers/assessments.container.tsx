import { AssessmentsView } from '../components/assessments-view';
import { useAssessmentsWorkspace } from '../hooks/use-assessments-workspace.hook';

/** The coach assessment workspace screen. */
export function AssessmentsContainer(): React.JSX.Element {
  const view = useAssessmentsWorkspace();
  return <AssessmentsView {...view} />;
}
