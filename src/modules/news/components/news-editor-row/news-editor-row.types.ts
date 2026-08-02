import type { NewsEditorRowView } from '../../types/news-view.types';

export interface NewsEditorRowProps {
  readonly row: NewsEditorRowView;
  readonly isPublishing: boolean;
  readonly onEdit: (articleId: string) => void;
  readonly onPublish: (articleId: string) => void;
}
