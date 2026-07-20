import { TrainingReviewScreen } from '../components/training-review-view';
import { useTrainingReview } from '../hooks/use-training-review.hook';

/** The reviewer queue and decision workspace. */
export function TrainingReviewContainer(): React.JSX.Element {
  const view = useTrainingReview();
  return <TrainingReviewScreen {...view} />;
}
