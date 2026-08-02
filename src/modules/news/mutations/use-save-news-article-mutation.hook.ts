import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { newsQueryKeys } from '../queries/news.keys';
import { saveNewsArticle } from '../services/save-news-article.service';
import type { NewsWriteCommand, NewsWriteResult } from '../types/news.types';

/** What the newsroom screen wants to know about a completed write. */
export interface NewsWriteCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/**
 * Save a draft, or open a new revision of a published story — the service
 * signature carries the story being revised, so "edit a published item" is a
 * fork, never an in-place mutation. The whole `news` cache branch is
 * invalidated because a write can change both the authoring list and, once
 * published, the public one.
 */
export function useSaveNewsArticleMutation(
  callbacks: NewsWriteCallbacks,
): InvalidatingMutationView<NewsWriteCommand> {
  return useInvalidatingMutation<NewsWriteResult, NewsWriteCommand>({
    mutationFn: saveNewsArticle,
    invalidateKey: newsQueryKeys.all,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
