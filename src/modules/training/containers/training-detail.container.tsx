import { TrainingDetailScreen } from '../components/training-detail-view';
import { useTrainingDetail } from '../hooks/use-training-detail.hook';

/** One training submission with its evidence, buddies, history, and actions. */
export function TrainingDetailContainer(): React.JSX.Element {
  const view = useTrainingDetail();
  return <TrainingDetailScreen {...view} />;
}
