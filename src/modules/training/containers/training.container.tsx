import { TrainingView } from '../components/training-view';
import { useTrainingWorkspace } from '../hooks/use-training-workspace.hook';

/** The member external-training workspace screen. */
export function TrainingContainer(): React.JSX.Element {
  const view = useTrainingWorkspace();
  return <TrainingView {...view} />;
}
