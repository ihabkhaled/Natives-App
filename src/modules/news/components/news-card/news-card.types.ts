import type { NewsCardView } from '../../types/news-view.types';

export interface NewsCardProps {
  readonly item: NewsCardView;
  readonly readMoreLabel: string;
  readonly onOpen: (slug: string) => void;
}
