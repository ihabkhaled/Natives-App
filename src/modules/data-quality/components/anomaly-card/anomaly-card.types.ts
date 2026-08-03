import type { AnomalyCardView } from '../../types/data-quality-view.types';
import type { AnomalyTransition } from '../../types/data-quality.types';

export interface AnomalyCardProps {
  readonly view: AnomalyCardView;
  readonly previewLabel: string;
  readonly onPreview: (anomalyId: string) => void;
  readonly onTransition: (anomalyId: string, transition: AnomalyTransition) => void;
}
