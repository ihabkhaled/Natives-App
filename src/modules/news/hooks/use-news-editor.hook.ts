import { useMemo, useState } from 'react';

import { formatDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import {
  buildNewsEditorCopy,
  buildNewsSeamNotice,
  resolveNewsScreenStatus,
  selectWriteToastKey,
} from '../helpers/news-copy.helper';
import { buildNewsEditorFormView } from '../helpers/news-editor-form.helper';
import {
  buildNewsEditorRow,
  EMPTY_NEWS_DRAFT,
  toNewsDraftInput,
} from '../helpers/news-editor.helper';
import { usePublishNewsArticleMutation } from '../mutations/use-publish-news-article-mutation.hook';
import { useSaveNewsArticleMutation } from '../mutations/use-save-news-article-mutation.hook';
import { NEWS_ENDPOINTS_ENABLED, NEWS_FIRST_PAGE } from '../news.constants';
import type { NewsEditorScreenView } from '../types/news-view.types';
import { useManagedNewsQuery } from './use-managed-news-query.hook';
import { useNewsArticleForm } from './use-news-article-form.hook';
import { useNewsContext } from './use-news-context.hook';

/**
 * The permissioned newsroom: every story including drafts, one form, and a
 * publish action per row. The route guard already forbids a session without
 * `news.manage`; `canManage` mirrors that so the form is absent — not merely
 * disabled — in the impossible case the screen renders anyway.
 *
 * While the 1.8.0 write endpoints are stubbed, a completed write reports the
 * "nothing was sent" toast rather than a success the seam cannot back up.
 */
export function useNewsEditor(): NewsEditorScreenView {
  const { t, locale } = useAppTranslation();
  const context = useNewsContext();
  const toast = useAppToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const query = useManagedNewsQuery(NEWS_FIRST_PAGE, context.canManage);
  const items = query.data?.page.items ?? [];
  const editing = items.find((item) => item.id === editingId) ?? null;
  const draft = useMemo(
    () => (editing === null ? EMPTY_NEWS_DRAFT : toNewsDraftInput(editing)),
    [editing],
  );
  const notify = (key: string): void => {
    void toast.showToast({ message: t(key) });
  };
  const callbacks = {
    onSuccess: () => {
      notify(
        selectWriteToastKey(
          NEWS_ENDPOINTS_ENABLED,
          I18N_KEYS.newsEditor.savedToast,
          I18N_KEYS.newsEditor.unavailableToast,
        ),
      );
    },
    onError: () => {
      notify(I18N_KEYS.newsEditor.writeFailedToast);
    },
  };
  const save = useSaveNewsArticleMutation(callbacks);
  const publish = usePublishNewsArticleMutation({
    onSuccess: () => {
      notify(
        selectWriteToastKey(
          NEWS_ENDPOINTS_ENABLED,
          I18N_KEYS.newsEditor.publishedToast,
          I18N_KEYS.newsEditor.unavailableToast,
        ),
      );
    },
    onError: callbacks.onError,
  });
  const form = useNewsArticleForm({
    translate: t,
    values: draft,
    onValidSubmit: (values) => {
      save.run({ articleId: editingId, draft: values });
    },
  });

  return {
    ...buildNewsEditorCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      isSeamLive: NEWS_ENDPOINTS_ENABLED,
    }),
    status: resolveNewsScreenStatus(context, query, context.canManage, items.length > 0),
    title: t(I18N_KEYS.newsEditor.title),
    subtitle: t(I18N_KEYS.newsEditor.subtitle),
    notice: buildNewsSeamNotice(t, NEWS_ENDPOINTS_ENABLED),
    listHeading: t(I18N_KEYS.newsEditor.listHeading),
    listIntro: t(I18N_KEYS.newsEditor.listIntro),
    newDraftLabel: t(I18N_KEYS.newsEditor.newDraft),
    onNewDraft: () => {
      setEditingId(null);
    },
    rows: items.map((article) =>
      buildNewsEditorRow(t, (isoDate: string) => formatDate(isoDate, locale), article),
    ),
    onEdit: setEditingId,
    onPublish: publish.run,
    isPublishing: publish.isRunning,
    canManage: context.canManage,
    form: buildNewsEditorFormView(t, {
      fields: form,
      editing,
      isSubmitting: save.isRunning,
      onCancel: form.onReset,
    }),
  };
}
