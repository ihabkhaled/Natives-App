import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { newsQueryKeys } from '../queries/news.keys';
import { publishNewsArticle } from '../services/publish-news-article.service';
import type { NewsWriteResult } from '../types/news.types';
import type { NewsWriteCallbacks } from './use-save-news-article-mutation.hook';

/** Make the current revision of a story the one the public reads. */
export function usePublishNewsArticleMutation(
  callbacks: NewsWriteCallbacks,
): InvalidatingMutationView<string> {
  return useInvalidatingMutation<NewsWriteResult, string>({
    mutationFn: publishNewsArticle,
    invalidateKey: newsQueryKeys.all,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
