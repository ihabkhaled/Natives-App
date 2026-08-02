import { I18N_KEYS } from '@/shared/i18n';

import type { NewsEditorFormView } from '../types/news-view.types';
import type { NewsArticle } from '../types/news.types';
import { buildNewsFormHeading, buildRevisionNotice } from './news-editor.helper';

type Translate = (key: string, params?: Record<string, string>) => string;

/** The field bindings and behaviour the screen hook supplies. */
export interface NewsEditorFormInput {
  readonly fields: Pick<
    NewsEditorFormView,
    'titleField' | 'bodyField' | 'coverField' | 'competitionField' | 'matchField' | 'onSubmit'
  >;
  /** The story being edited, or null for a brand-new draft. */
  readonly editing: NewsArticle | null;
  readonly isSubmitting: boolean;
  readonly onCancel: () => void;
}

/**
 * Assemble the story form's translated view model. Kept out of the screen
 * hook so the hook stays a composition and the label wiring stays pure.
 */
export function buildNewsEditorFormView(
  t: Translate,
  input: NewsEditorFormInput,
): NewsEditorFormView {
  const keys = I18N_KEYS.newsEditor;
  return {
    ...input.fields,
    heading: buildNewsFormHeading(t, input.editing),
    revisionNotice: buildRevisionNotice(t, input.editing),
    titleLabel: t(keys.titleLabel),
    titlePlaceholder: t(keys.titlePlaceholder),
    bodyLabel: t(keys.bodyLabel),
    bodyPlaceholder: t(keys.bodyPlaceholder),
    coverLabel: t(keys.coverImageLabel),
    coverPlaceholder: t(keys.coverImagePlaceholder),
    competitionLabel: t(keys.competitionLabel),
    competitionPlaceholder: t(keys.competitionPlaceholder),
    matchLabel: t(keys.matchLabel),
    matchPlaceholder: t(keys.matchPlaceholder),
    submitLabel: t(input.isSubmitting ? keys.saving : keys.save),
    cancelLabel: t(keys.cancel),
    isSubmitting: input.isSubmitting,
    onCancel: input.onCancel,
  };
}
